import { NextRequest, NextResponse } from "next/server";

import {
  dropExpiredProductAuditPartitions,
  ensureProductAuditPartitions,
  getProductAuditPartitions,
} from "@/lib/db/partitions";

function authCheck(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true;
  return authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
}

/**
 * Обслуживание партиций аудит-лога продуктов. Запуск — ежедневно.
 *
 * 1. Создаёт партиции на текущий месяц и 2 месяца вперёд.
 * 2. Удаляет партиции старше срока хранения (12 месяцев) через DROP TABLE,
 *    а не через DELETE — записи аудита неизменяемы.
 *
 * Авторизация: Authorization: Bearer CRON_SECRET либо ?secret=.
 */
export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const errors: Array<{ stage: string; error: string }> = [];
  let created: string[] = [];
  let dropped: string[] = [];

  try {
    created = (await ensureProductAuditPartitions()).created;
  } catch (err) {
    console.error("[cron/audit-maintenance] не удалось создать партиции:", err);
    errors.push({ stage: "create", error: err instanceof Error ? err.message : String(err) });
  }

  try {
    dropped = (await dropExpiredProductAuditPartitions()).dropped;
  } catch (err) {
    console.error("[cron/audit-maintenance] не удалось удалить устаревшие партиции:", err);
    errors.push({ stage: "drop", error: err instanceof Error ? err.message : String(err) });
  }

  let partitions: string[] = [];
  try {
    partitions = await getProductAuditPartitions();
  } catch (err) {
    errors.push({ stage: "list", error: err instanceof Error ? err.message : String(err) });
  }

  return NextResponse.json({
    ok: errors.length === 0,
    created,
    dropped,
    partitions,
    errors: errors.length > 0 ? errors : undefined,
    message: `Партиций создано: ${created.length}, удалено: ${dropped.length}`,
  });
}
