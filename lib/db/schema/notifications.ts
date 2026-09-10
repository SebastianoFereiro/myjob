import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Состояние модерации зарегистрированных компаний.
 *
 * Запись создаётся при регистрации компании в app/api/company/register
 * со статусом "pending". Cron-роут /api/cron/company-moderation раз в час
 * проверяет isActive компании в Strapi и после прохождения модерации
 * переводит запись в "notified" — уведомление отправляется ровно один раз.
 */
export const companyModerationNotice = pgTable("company_moderation_notice", {
  id: text("id").primaryKey(),
  // documentId компании в Strapi
  companyId: text("company_id").notNull().unique(),
  companyName: text("company_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  // "pending" | "notified"
  status: text("status").notNull().default("pending"),
  notifiedAt: timestamp("notified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
