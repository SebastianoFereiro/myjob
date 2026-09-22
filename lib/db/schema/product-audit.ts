import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Тип продукта: закрепление вакансии (premium) или авто-поднятие (auto_boost). */
export const productTypeEnum = pgEnum("product_type", ["premium", "auto_boost"]);

/** Тип события аудита назначения продукта. */
export const productAuditEventTypeEnum = pgEnum("product_audit_event_type", [
  "activated",
  "deactivated",
  "expired",
]);

/**
 * Append-only аудит-лог назначения продуктов в разрезе компаний и вакансий.
 *
 * ВАЖНО: таблица партиционирована по created_at помесячно (см. миграцию
 * lib/db/migrations и lib/db/partitions.ts). Drizzle не умеет декларировать
 * PARTITION BY, поэтому DDL партиционирования задаётся в SQL-миграции вручную.
 * Из-за партиционирования первичный ключ составной: (id, created_at).
 *
 * company_id и vacancy_id — строковые documentId записей Strapi.
 * Обновление и удаление записей запрещены (кроме планового DROP партиций).
 */
export const productAssignmentAudit = pgTable(
  "product_assignment_audit",
  {
    id: uuid("id").notNull().default(sql`gen_random_uuid()`),
    // documentId компании в Strapi
    companyId: text("company_id").notNull(),
    // documentId вакансии (cvs) в Strapi
    vacancyId: text("vacancy_id").notNull(),
    // Денормализация: название вакансии на момент события
    vacancyTitle: text("vacancy_title").notNull().default(""),
    // Денормализация: slug вакансии на момент события
    vacancySlug: text("vacancy_slug"),
    productType: productTypeEnum("product_type").notNull(),
    eventType: productAuditEventTypeEnum("event_type").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    // Дополнительный контекст: источник активации, автор, запуск крона
    metadata: jsonb("metadata")
      .notNull()
      .default(sql`'{}'::jsonb`),
    // Ключ партиционирования
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.id, table.createdAt] }),
    index("paa_company_created_idx").on(table.companyId, table.createdAt.desc()),
    index("paa_company_vacancy_created_idx").on(
      table.companyId,
      table.vacancyId,
      table.createdAt.desc(),
    ),
    index("paa_vacancy_product_created_idx").on(
      table.vacancyId,
      table.productType,
      table.createdAt.desc(),
    ),
  ],
);
