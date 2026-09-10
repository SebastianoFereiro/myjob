import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { companyModerationNotice } from "@/lib/db/schema/notifications";
import { sendCompanyApprovedMail } from "@/lib/mail/send";
import { fetchAPI } from "@/lib/strapi-client";

type StrapiCompanyRecord = {
  documentId?: string;
  id?: number;
  name?: string;
  isActive?: boolean;
};

function authCheck(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return true;
  return (
    authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret
  );
}

/**
 * Проверка модерации зарегистрированных компаний. Запуск — раз в час.
 *
 * Работает только по записям company_moderation_notice со статусом "pending":
 * компании без записи не опрашиваются. Для каждой записи проверяем isActive
 * в Strapi, и при isActive === true отправляем владельцу письмо о прохождении
 * модерации и переводим запись в "notified" — уведомление уходит один раз.
 */
export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let pendingRecords: (typeof companyModerationNotice.$inferSelect)[] = [];
  try {
    pendingRecords = await db
      .select()
      .from(companyModerationNotice)
      .where(eq(companyModerationNotice.status, "pending"))
      .limit(100);
  } catch (err) {
    console.error("[cron/company-moderation] failed to load pending records:", err);
    return NextResponse.json(
      {
        ok: false,
        checked: 0,
        sent: 0,
        pending: 0,
        errors: [{ companyId: "db", error: "Не удалось прочитать очередь модерации" }],
      },
      { status: 500 },
    );
  }

  const errors: Array<{ companyId: string; error: string }> = [];
  let sent = 0;

  for (const notice of pendingRecords) {
    try {
      const response = await fetchAPI<{ data?: StrapiCompanyRecord }>(
        `/companies/${notice.companyId}`,
      );
      const company = response?.data;

      if (!company || (!company.documentId && !company.id)) {
        errors.push({ companyId: notice.companyId, error: "Компания не найдена в Strapi" });
        continue;
      }

      // Модерация ещё не пройдена — ждём следующего запуска
      if (company.isActive !== true) continue;

      // Актуальный email владельца — из Better-Auth по companyId
      const owner = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.companyId, notice.companyId))
        .limit(1);

      const email = owner[0]?.email || notice.ownerEmail;
      const companyName = company.name || notice.companyName || email;

      const ok = await sendCompanyApprovedMail({ companyName, email });
      if (!ok) {
        errors.push({ companyId: notice.companyId, error: "Ошибка отправки письма" });
        continue;
      }

      // Флаг ставим только после успешной отправки — повторных писем не будет
      await db
        .update(companyModerationNotice)
        .set({ status: "notified", notifiedAt: new Date() })
        .where(
          and(
            eq(companyModerationNotice.companyId, notice.companyId),
            eq(companyModerationNotice.status, "pending"),
          ),
        );

      sent += 1;
    } catch (err) {
      errors.push({
        companyId: notice.companyId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    checked: pendingRecords.length,
    sent,
    pending: pendingRecords.length - sent,
    errors,
  });
}
