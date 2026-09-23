import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  getLatestAuditEventPerPair,
  insertProductAuditEvents,
} from "@/services/product-audit.service";
import type {
  ProductAuditEventInput,
  ProductAuditMetadata,
  ProductType,
} from "@/types/product-audit";

const STRAPI_URL = (process.env.STRAPI_URL || "https://atlantis.myjob.by").replace(/\/$/, "");

/** Strapi отдаёт не больше 100 записей на страницу. */
const PAGE_SIZE = 100;
/** Предохранитель от бесконечного цикла по страницам. */
const MAX_PAGES = 50;

/** Ключ advisory-lock: одновременно аудит может писать только один запуск крона. */
const AUDIT_LOCK_KEY = 918273645;

/**
 * Поля вакансии, необходимые для записи аудита: компания, название, slug и
 * периоды продуктов. Параметр `fields` ограничивает набор атрибутов в ответе
 * Strapi, поэтому периоды нужно перечислять явно: иначе period_start и
 * period_end приходят пустыми и ни одно событие не записывается.
 */
const CV_AUDIT_FIELDS = [
  "populate[company]=true",
  "fields[0]=title",
  "fields[1]=slug",
  "fields[2]=premium_from",
  "fields[3]=premium_to",
  "fields[4]=push_from",
  "fields[5]=push_to",
].join("&");

/**
 * Необязательный порог отсечения истории (ISO 8601, UTC).
 *
 * Если переменная не задана, при первом запуске крона текущие активные
 * продукты фиксируются в истории как базовые события `activated`: иначе
 * история компании остаётся пустой для всех продуктов, назначенных раньше
 * внедрения аудита. Заданный порог отключает такую фиксацию для старых
 * продуктов (бэкфилл не выполняется).
 */
function parseTrackingSince(): Date | null {
  const raw = process.env.PRODUCT_AUDIT_TRACKING_SINCE;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

const AUDIT_TRACKING_SINCE = parseTrackingSince();

type CronError = { stage: string; id: string; error: string };

function authCheck(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true;
  return authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
}

async function fetchStrapi<T>(url: string, token: string): Promise<T | null> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function updateStrapi(
  documentId: string,
  data: Record<string, unknown>,
  token: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/cvs/${documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

type StrapiRecord = { documentId?: string; id?: number; [key: string]: unknown };

type StrapiListResponse = {
  data?: StrapiRecord[];
  meta?: { pagination?: { page?: number; pageCount?: number } };
};

/** Постраничная загрузка вакансий: одна страница Strapi может не вместить все записи. */
async function fetchAllCvs(query: string, token: string): Promise<StrapiRecord[]> {
  const records: StrapiRecord[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    const url = `${STRAPI_URL}/api/cvs?${query}&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`;
    const body = await fetchStrapi<StrapiListResponse>(url, token);
    if (!body) break;

    records.push(...(body.data ?? []));
    pageCount = body.meta?.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount && page <= MAX_PAGES);

  return records;
}

// ---------------------------------------------------------------------------
// Аудит назначения продуктов
// ---------------------------------------------------------------------------

type ActiveProduct = {
  vacancyId: string;
  companyId: string;
  vacancyTitle: string;
  vacancySlug: string | null;
  productType: ProductType;
  periodStart: Date | null;
  periodEnd: Date | null;
};

function toDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function pairKey(vacancyId: string, productType: ProductType): string {
  return `${vacancyId}::${productType}`;
}

function readActiveProducts(
  records: StrapiRecord[],
  productType: ProductType,
  fromField: string,
  toField: string,
  errors: CronError[],
): ActiveProduct[] {
  const result: ActiveProduct[] = [];

  for (const record of records) {
    const vacancyId =
      record.documentId ?? (record.id !== undefined ? String(record.id) : "");
    if (!vacancyId) continue;

    const company = record.company as { documentId?: string; id?: number } | null | undefined;
    const companyId =
      company?.documentId ?? (company?.id !== undefined ? String(company.id) : "");
    if (!companyId) {
      // Без компании запись аудита невозможна — фиксируем и пропускаем.
      errors.push({ stage: "audit", id: vacancyId, error: "Не найден company.documentId" });
      continue;
    }

    result.push({
      vacancyId,
      companyId,
      vacancyTitle: typeof record.title === "string" ? record.title : "",
      vacancySlug: typeof record.slug === "string" ? record.slug : null,
      productType,
      periodStart: toDate(record[fromField]),
      periodEnd: toDate(record[toField]),
    });
  }

  return result;
}

/**
 * Собирает события аудита сравнением текущего состояния продуктов в Strapi
 * с последним событием по паре vacancy_id + product_type.
 *
 * off -> on = activated, on -> off при непройденном period_end = deactivated,
 * on -> off при пройденном period_end = expired.
 */
async function collectProductAuditEvents(
  now: Date,
  writeToken: string,
  errors: CronError[],
): Promise<ProductAuditEventInput[]> {
  const nowIso = encodeURIComponent(now.toISOString());

  const [premiumRecords, pushRecords] = await Promise.all([
    fetchAllCvs(
      `${CV_AUDIT_FIELDS}&filters[premium_from][$lte]=${nowIso}&filters[premium_to][$gte]=${nowIso}`,
      writeToken,
    ),
    fetchAllCvs(
      `${CV_AUDIT_FIELDS}&filters[push_from][$lte]=${nowIso}&filters[push_to][$gte]=${nowIso}`,
      writeToken,
    ),
  ]);

  const active: ActiveProduct[] = [
    ...readActiveProducts(premiumRecords, "premium", "premium_from", "premium_to", errors),
    ...readActiveProducts(pushRecords, "auto_boost", "push_from", "push_to", errors),
  ];

  const activeKeys = new Set(active.map((item) => pairKey(item.vacancyId, item.productType)));

  const latestEvents = await getLatestAuditEventPerPair();
  const openPairs = latestEvents.filter((event) => event.eventType === "activated");
  const openKeys = new Set(openPairs.map((event) => pairKey(event.vacancyId, event.productType)));

  const metadata: ProductAuditMetadata = {
    source: "cron",
    job: "auto-push",
    runAt: now.toISOString(),
    detectedBy: "state-diff",
  };

  const events: ProductAuditEventInput[] = [];

  for (const item of active) {
    if (openKeys.has(pairKey(item.vacancyId, item.productType))) continue;

    // Продукт попал в выборку по периоду, но сам период не пришёл из Strapi:
    // фиксируем ошибку, чтобы запись не терялась молча.
    if (!item.periodStart) {
      errors.push({ stage: "audit", id: item.vacancyId, error: "Не найден periodStart" });
      continue;
    }

    // Явно заданный порог отсекает продукты, назначенные до внедрения аудита.
    if (AUDIT_TRACKING_SINCE && item.periodStart.getTime() < AUDIT_TRACKING_SINCE.getTime()) {
      continue;
    }

    events.push({
      companyId: item.companyId,
      vacancyId: item.vacancyId,
      vacancyTitle: item.vacancyTitle,
      vacancySlug: item.vacancySlug,
      productType: item.productType,
      eventType: "activated",
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      metadata,
    });
  }

  for (const item of openPairs) {
    if (activeKeys.has(pairKey(item.vacancyId, item.productType))) continue;

    const expired = item.periodEnd !== null && item.periodEnd.getTime() <= now.getTime();

    events.push({
      companyId: item.companyId,
      vacancyId: item.vacancyId,
      vacancyTitle: item.vacancyTitle,
      vacancySlug: item.vacancySlug,
      productType: item.productType,
      eventType: expired ? "expired" : "deactivated",
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      metadata,
    });
  }

  return events;
}

async function tryAcquireAuditLock(): Promise<boolean> {
  const result = await db.execute(sql`SELECT pg_try_advisory_lock(${AUDIT_LOCK_KEY}) AS locked`);
  const rows = result.rows as unknown as { locked: boolean }[];
  return rows[0]?.locked === true;
}

async function releaseAuditLock(): Promise<void> {
  await db.execute(sql`SELECT pg_advisory_unlock(${AUDIT_LOCK_KEY})`);
}

export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const writeToken = process.env.STRAPI_API_WRITE_TOKEN;
  if (!writeToken) {
    return NextResponse.json({ error: "STRAPI_API_WRITE_TOKEN not configured" }, { status: 500 });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const errors: CronError[] = [];

  // --- 0. Аудит назначения продуктов: до применения бизнес-изменений, ---
  // --- чтобы факт назначения был зафиксирован даже при сбое следующих шагов. ---
  const audit = { activated: 0, deactivated: 0, expired: 0, skipped: false };
  let lockAcquired = false;

  try {
    lockAcquired = await tryAcquireAuditLock();

    if (!lockAcquired) {
      audit.skipped = true;
      errors.push({ stage: "audit", id: "lock", error: "Не получен advisory-lock" });
    } else {
      const events = await collectProductAuditEvents(now, writeToken, errors);
      const result = await insertProductAuditEvents(events);

      if (result.error) {
        errors.push({ stage: "audit", id: "insert", error: result.error });
      } else {
        for (const event of events) {
          if (event.eventType === "activated") audit.activated += 1;
          else if (event.eventType === "deactivated") audit.deactivated += 1;
          else audit.expired += 1;
        }
      }
    }
  } catch (err) {
    // Сбой аудита не должен мешать применению продуктов.
    errors.push({ stage: "audit", id: "batch", error: String(err) });
  } finally {
    if (lockAcquired) {
      try {
        await releaseAuditLock();
      } catch (err) {
        console.error("[cron/auto-push] не удалось снять advisory-lock аудита:", err);
      }
    }
  }

  // --- 1. Auto-publish: datetime_start <= now, publishedAt == null, isActive == true ---
  let autoPublished = 0;
  try {
    const publishUrl = `${STRAPI_URL}/api/cvs?filters[datetime_start][$lte]=${encodeURIComponent(nowIso)}&filters[publishedAt][$null]=true&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const publishBody = await fetchStrapi<{ data: StrapiRecord[] }>(publishUrl, writeToken);
    const toPublish = publishBody?.data ?? [];
    for (const record of toPublish) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { publishedAt: nowIso }, writeToken);
      if (ok) autoPublished++;
      else errors.push({ stage: "publish", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "publish", id: "batch", error: String(err) });
  }

  // --- 2. Auto-unpublish: datetime_finish < now, isActive == true ---
  let autoUnpublished = 0;
  try {
    const unpublishUrl = `${STRAPI_URL}/api/cvs?filters[datetime_finish][$lt]=${encodeURIComponent(nowIso)}&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const unpublishBody = await fetchStrapi<{ data: StrapiRecord[] }>(unpublishUrl, writeToken);
    const toUnpublish = unpublishBody?.data ?? [];
    for (const record of toUnpublish) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { isActive: false }, writeToken);
      if (ok) autoUnpublished++;
      else errors.push({ stage: "unpublish", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "unpublish", id: "batch", error: String(err) });
  }

  // --- 3. Auto-push: push_from <= now, push_to >= now, isActive == true ---
  let autoPushed = 0;
  try {
    const pushUrl = `${STRAPI_URL}/api/cvs?filters[push_from][$lte]=${encodeURIComponent(nowIso)}&filters[push_to][$gte]=${encodeURIComponent(nowIso)}&filters[isActive][$eq]=true&pagination[pageSize]=100`;
    const pushBody = await fetchStrapi<{ data: StrapiRecord[] }>(pushUrl, writeToken);
    const toPush = pushBody?.data ?? [];
    for (const record of toPush) {
      const docId = record.documentId ?? String(record.id);
      if (!docId) continue;
      const ok = await updateStrapi(docId, { publishedAt: nowIso }, writeToken);
      if (ok) autoPushed++;
      else errors.push({ stage: "push", id: docId, error: "HTTP error" });
    }
  } catch (err) {
    errors.push({ stage: "push", id: "batch", error: String(err) });
  }

  // --- 4. Revalidate Yandex XML feed ---
  let feedRevalidated = false;
  if (autoPublished > 0 || autoPushed > 0) {
    try {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
      const cronSecret = process.env.CRON_SECRET || "";
      const revalidateUrl = `${appUrl}/api/revalidate?tag=yandex-feed&secret=${encodeURIComponent(cronSecret)}`;
      const res = await fetch(revalidateUrl);
      feedRevalidated = res.ok;
    } catch (err) {
      errors.push({ stage: "revalidate-feed", id: "feed", error: String(err) });
    }
  }

  return NextResponse.json({
    autoPublished,
    autoUnpublished,
    autoPushed,
    audit,
    feedRevalidated,
    errors: errors.length > 0 ? errors : undefined,
    message: `Опубликовано: ${autoPublished}, снято: ${autoUnpublished}, поднято: ${autoPushed}, аудит: активаций ${audit.activated}, деактиваций ${audit.deactivated}, истечений ${audit.expired}`,
  });
}
