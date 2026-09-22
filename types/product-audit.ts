/** Типы аудит-лога назначения продуктов (Премиум, Автоподнятие). */

export type ProductType = "premium" | "auto_boost";

export type ProductAuditEventType = "activated" | "deactivated" | "expired";

export type ProductAuditMetadata = {
  source?: string;
  job?: string;
  runAt?: string;
  detectedBy?: string;
  [key: string]: unknown;
};

/** Запись на вставку в product_assignment_audit. */
export type ProductAuditEventInput = {
  companyId: string;
  vacancyId: string;
  vacancyTitle: string;
  vacancySlug?: string | null;
  productType: ProductType;
  eventType: ProductAuditEventType;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  metadata?: ProductAuditMetadata;
};

/** Запись аудита для отображения (даты — ISO-строки). */
export type ProductAuditEvent = {
  id: string;
  companyId: string;
  vacancyId: string;
  vacancyTitle: string;
  vacancySlug: string | null;
  productType: ProductType;
  eventType: ProductAuditEventType;
  periodStart: string | null;
  periodEnd: string | null;
  metadata: ProductAuditMetadata;
  createdAt: string;
};

/** История по одной вакансии, сгруппированная по типу продукта. */
export type ProductHistoryVacancyGroup = {
  vacancyId: string;
  vacancyTitle: string;
  vacancySlug: string | null;
  lastEventAt: string;
  products: Record<ProductType, ProductAuditEvent[]>;
};

export type CompanyProductHistoryParams = {
  companyId: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type CompanyProductHistoryResult = {
  items: ProductHistoryVacancyGroup[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

/** Последнее известное событие по паре vacancy_id + product_type (для диффа в кроне). */
export type LatestProductEvent = {
  vacancyId: string;
  productType: ProductType;
  eventType: ProductAuditEventType;
  companyId: string;
  vacancyTitle: string;
  vacancySlug: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  createdAt: Date;
};
