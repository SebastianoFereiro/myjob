import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

/**
 * Обслуживание месячных партиций таблицы product_assignment_audit.
 *
 * Партиционирование задаётся вручную в миграции (Drizzle не умеет PARTITION BY).
 * Здесь только создание будущих партиций и удаление устаревших — без DELETE.
 * Все границы считаются в UTC.
 */

export const PRODUCT_AUDIT_TABLE = "product_assignment_audit";

/** Срок хранения истории — 12 месяцев. */
export const PRODUCT_AUDIT_RETENTION_MONTHS = 12;

/** Сколько месяцев вперёд поддерживать партиции. */
export const PRODUCT_AUDIT_MONTHS_AHEAD = 2;

const PARTITION_PREFIX = `${PRODUCT_AUDIT_TABLE}_`;
const PARTITION_NAME_RE = /^product_assignment_audit_\d{4}_\d{2}$/;

/** Имя партиции для месяца, в который попадает дата: product_assignment_audit_YYYY_MM. */
export function partitionNameFor(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${PARTITION_PREFIX}${year}_${month}`;
}

function monthStartUtc(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addMonthsUtc(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 0, 0, 0, 0));
}

/**
 * Идентификаторы партиций нельзя передать параметром: подставляем через sql.raw
 * после строгой проверки имени. Даты формируются из Date через toISOString.
 */
function assertPartitionName(name: string): void {
  if (!PARTITION_NAME_RE.test(name)) {
    throw new Error(`Некорректное имя партиции: ${name}`);
  }
}

function quoteIdent(name: string): string {
  assertPartitionName(name);
  return `"${name}"`;
}

async function listAuditPartitions(): Promise<string[]> {
  const result = await db.execute<{ name: string }>(sql`
    SELECT child.relname AS name
    FROM pg_inherits
    JOIN pg_class parent ON parent.oid = pg_inherits.inhparent
    JOIN pg_class child ON child.oid = pg_inherits.inhrelid
    WHERE parent.relname = ${PRODUCT_AUDIT_TABLE}
  `);

  return result.rows.map((row) => row.name).filter((name) => PARTITION_NAME_RE.test(name));
}

/** Создаёт отсутствующие партиции на текущий месяц и monthsAhead месяцев вперёд. */
export async function ensureProductAuditPartitions(
  monthsAhead: number = PRODUCT_AUDIT_MONTHS_AHEAD,
): Promise<{ created: string[] }> {
  const existing = new Set(await listAuditPartitions());
  const created: string[] = [];
  const base = monthStartUtc(new Date());

  for (let offset = 0; offset <= monthsAhead; offset++) {
    const from = addMonthsUtc(base, offset);
    const to = addMonthsUtc(base, offset + 1);
    const name = partitionNameFor(from);

    if (existing.has(name)) continue;

    const statement =
      `CREATE TABLE IF NOT EXISTS ${quoteIdent(name)} ` +
      `PARTITION OF "${PRODUCT_AUDIT_TABLE}" ` +
      `FOR VALUES FROM ('${from.toISOString()}') TO ('${to.toISOString()}')`;

    await db.execute(sql.raw(statement));
    created.push(name);
  }

  return { created };
}

/**
 * Удаляет партиции старше срока хранения (12 месяцев от текущего месяца).
 * Удаление выполняется через DROP TABLE партиции, а не через DELETE.
 */
export async function dropExpiredProductAuditPartitions(
  retentionMonths: number = PRODUCT_AUDIT_RETENTION_MONTHS,
): Promise<{ dropped: string[] }> {
  const boundary = addMonthsUtc(monthStartUtc(new Date()), -retentionMonths);
  const partitions = await listAuditPartitions();
  const dropped: string[] = [];

  for (const name of partitions) {
    const match = /^product_assignment_audit_(\d{4})_(\d{2})$/.exec(name);
    if (!match) continue;

    const partitionStart = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
    const partitionEnd = addMonthsUtc(partitionStart, 1);

    if (partitionEnd.getTime() > boundary.getTime()) continue;

    await db.execute(sql.raw(`DROP TABLE IF EXISTS ${quoteIdent(name)}`));
    dropped.push(name);
  }

  return { dropped };
}

/** Список текущих партиций (для диагностики и ответа крон-роута). */
export async function getProductAuditPartitions(): Promise<string[]> {
  const partitions = await listAuditPartitions();
  return partitions.sort();
}
