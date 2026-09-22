import { sql, type SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { productAssignmentAudit } from "@/lib/db/schema/product-audit";
import type {
  CompanyProductHistoryParams,
  CompanyProductHistoryResult,
  LatestProductEvent,
  ProductAuditEvent,
  ProductAuditEventInput,
  ProductAuditEventType,
  ProductHistoryVacancyGroup,
  ProductType,
} from "@/types/product-audit";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
/** Ограничение числа событий на продукт в одной вакансии, чтобы не раздувать ответ. */
const MAX_EVENTS_PER_PRODUCT = 20;

/**
 * Временные метки в raw-выборках приводим к ISO-8601 UTC явно:
 * db.execute отдаёт timestamptz строкой в формате с часовым поясом сервера,
 * а формат ISO однозначен и одинаков на любой машине.
 */
function isoUtc(column: string): SQL {
  return sql.raw(`to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')`);
}

function parseIso(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ---------------------------------------------------------------------------
// Запись (append-only). Функции update/delete намеренно отсутствуют:
// записи аудита неизменяемы, очистка выполняется только удалением партиций.
// ---------------------------------------------------------------------------

/**
 * Batch-вставка событий аудита.
 *
 * Ошибка записи не должна ломать основной процесс применения продуктов,
 * поэтому исключение подавляется и возвращается в виде текста ошибки.
 */
export async function insertProductAuditEvents(
  events: ProductAuditEventInput[],
): Promise<{ inserted: number; error?: string }> {
  if (events.length === 0) return { inserted: 0 };

  try {
    await db.insert(productAssignmentAudit).values(
      events.map((event) => ({
        companyId: event.companyId,
        vacancyId: event.vacancyId,
        vacancyTitle: event.vacancyTitle,
        vacancySlug: event.vacancySlug ?? null,
        productType: event.productType,
        eventType: event.eventType,
        periodStart: event.periodStart ?? null,
        periodEnd: event.periodEnd ?? null,
        metadata: event.metadata ?? {},
      })),
    );

    return { inserted: events.length };
  } catch (err) {
    console.error("[product-audit] не удалось записать события аудита:", err);
    return { inserted: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---------------------------------------------------------------------------
// Чтение
// ---------------------------------------------------------------------------

type LatestEventRow = {
  vacancy_id: string;
  product_type: ProductType;
  event_type: ProductAuditEventType;
  company_id: string;
  vacancy_title: string | null;
  vacancy_slug: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at_iso: string;
};

/**
 * Последнее событие по каждой паре vacancy_id + product_type.
 *
 * Используется крон-задачей для диффа состояния продуктов:
 * DISTINCT ON идёт по индексу paa_vacancy_product_created_idx.
 */
export async function getLatestAuditEventPerPair(
  vacancyIds?: string[],
): Promise<LatestProductEvent[]> {
  const ids = vacancyIds ?? [];

  const result = await db.execute(sql`
    SELECT DISTINCT ON (vacancy_id, product_type)
      vacancy_id,
      product_type,
      event_type,
      company_id,
      vacancy_title,
      vacancy_slug,
      ${isoUtc("period_start")} AS period_start,
      ${isoUtc("period_end")} AS period_end,
      ${isoUtc("created_at")} AS created_at_iso
    FROM product_assignment_audit
    ${ids.length > 0
      ? sql`WHERE vacancy_id IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`
      : sql``}
    ORDER BY vacancy_id, product_type, created_at DESC
  `);

  const rows = result.rows as unknown as LatestEventRow[];

  return rows
    .map((row) => {
      const createdAt = parseIso(row.created_at_iso);
      if (!createdAt) return null;

      return {
        vacancyId: row.vacancy_id,
        productType: row.product_type,
        eventType: row.event_type,
        companyId: row.company_id,
        vacancyTitle: row.vacancy_title ?? "",
        vacancySlug: row.vacancy_slug,
        periodStart: parseIso(row.period_start),
        periodEnd: parseIso(row.period_end),
        createdAt,
      } satisfies LatestProductEvent;
    })
    .filter((event): event is LatestProductEvent => event !== null);
}

type VacancyRow = {
  vacancy_id: string;
  vacancy_title: string | null;
  vacancy_slug: string | null;
  last_event_at: string;
};

type EventRow = {
  id: string;
  company_id: string;
  vacancy_id: string;
  vacancy_title: string | null;
  vacancy_slug: string | null;
  product_type: ProductType;
  event_type: ProductAuditEventType;
  period_start: string | null;
  period_end: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};

function mapEventRow(row: EventRow): ProductAuditEvent {
  return {
    id: row.id,
    companyId: row.company_id,
    vacancyId: row.vacancy_id,
    vacancyTitle: row.vacancy_title ?? "",
    vacancySlug: row.vacancy_slug,
    productType: row.product_type,
    eventType: row.event_type,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    metadata: row.metadata ?? {},
    createdAt: row.created_at ?? "",
  };
}

function emptyProducts(): Record<ProductType, ProductAuditEvent[]> {
  return { premium: [], auto_boost: [] };
}

/**
 * История продуктов компании: страница вакансий (фильтр по company_id и,
 * при наличии, по названию вакансии) + события по этим вакансиям,
 * сгруппированные по типу продукта.
 */
export async function getCompanyProductHistory(
  params: CompanyProductHistoryParams,
): Promise<CompanyProductHistoryResult> {
  const { companyId } = params;

  const page = Number.isFinite(params.page) && params.page > 0 ? Math.floor(params.page) : 1;
  const requestedSize = Number.isFinite(params.pageSize)
    ? Math.floor(params.pageSize)
    : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(requestedSize, 1), MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  const search = params.search?.trim() ?? "";
  const pattern = search.length > 0 ? `%${search}%` : null;

  const vacanciesResult = await db.execute(sql`
    SELECT
      vacancy_id,
      max(vacancy_title) AS vacancy_title,
      max(vacancy_slug) AS vacancy_slug,
      ${isoUtc("max(created_at)")} AS last_event_at
    FROM product_assignment_audit
    WHERE company_id = ${companyId}
    ${pattern ? sql`AND vacancy_title ILIKE ${pattern}` : sql``}
    GROUP BY vacancy_id
    ORDER BY max(created_at) DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `);

  const vacancies = vacanciesResult.rows as unknown as VacancyRow[];

  let total = 0;
  try {
    const countResult = await db.execute(sql`
      SELECT count(DISTINCT vacancy_id)::int AS total
      FROM product_assignment_audit
      WHERE company_id = ${companyId}
      ${pattern ? sql`AND vacancy_title ILIKE ${pattern}` : sql``}
    `);
    const countRows = countResult.rows as unknown as { total: number }[];
    total = countRows[0]?.total ?? 0;
  } catch (err) {
    console.error("[product-audit] не удалось получить количество вакансий:", err);
    total = vacancies.length;
  }

  const pagination = {
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };

  if (vacancies.length === 0) {
    return { items: [], pagination };
  }

  const vacancyIds = vacancies.map((row) => row.vacancy_id);

  const eventsResult = await db.execute(sql`
    SELECT
      id,
      company_id,
      vacancy_id,
      vacancy_title,
      vacancy_slug,
      product_type,
      event_type,
      period_start,
      period_end,
      metadata,
      created_at_iso AS created_at
    FROM (
      SELECT
        id,
        company_id,
        vacancy_id,
        vacancy_title,
        vacancy_slug,
        product_type,
        event_type,
        ${isoUtc("period_start")} AS period_start,
        ${isoUtc("period_end")} AS period_end,
        metadata,
        ${isoUtc("created_at")} AS created_at_iso,
        created_at,
        row_number() OVER (
          PARTITION BY vacancy_id, product_type ORDER BY created_at DESC
        ) AS rn
      FROM product_assignment_audit
      WHERE company_id = ${companyId}
        AND vacancy_id IN (${sql.join(vacancyIds.map((id) => sql`${id}`), sql`, `)})
    ) ranked
    WHERE rn <= ${MAX_EVENTS_PER_PRODUCT}
    ORDER BY created_at DESC
  `);

  const events = (eventsResult.rows as unknown as EventRow[]).map(mapEventRow);

  const items: ProductHistoryVacancyGroup[] = vacancies.map((vacancy) => ({
    vacancyId: vacancy.vacancy_id,
    vacancyTitle: vacancy.vacancy_title ?? "",
    vacancySlug: vacancy.vacancy_slug,
    lastEventAt: vacancy.last_event_at,
    products: emptyProducts(),
  }));

  const byVacancyId = new Map(items.map((item) => [item.vacancyId, item]));

  for (const event of events) {
    const item = byVacancyId.get(event.vacancyId);
    if (!item) continue;
    item.products[event.productType].push(event);
  }

  return { items, pagination };
}
