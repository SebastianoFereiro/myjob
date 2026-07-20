export const IRR_BY_RUBRIC_OTHER = "/jobandeducation/vacancies/other/";

export const categoryToIrrby: Record<string, string> = {
  it: "/jobandeducation/vacancies/it/",
  finance: "/jobandeducation/vacancies/bank/",
  medicine: "/jobandeducation/vacancies/medicine/",
  logistics: "/jobandeducation/vacancies/logistics/",
  sales: "/jobandeducation/vacancies/sales/",
  marketing: "/jobandeducation/vacancies/marketing/",
  // Категории ниже пока не привязаны к существующим myjob.by,
  // но зарезервированы для будущего расширения:
  production: "/jobandeducation/vacancies/production/",
  building: "/jobandeducation/vacancies/building/",
  transport: "/jobandeducation/vacancies/transport/",
  legal: "/jobandeducation/vacancies/legal/",
  office: "/jobandeducation/vacancies/office/",
  tourizm: "/jobandeducation/vacancies/tourizm/",
  design: "/jobandeducation/vacancies/design/",
  security: "/jobandeducation/vacancies/security/",
  education: "/jobandeducation/vacancies/education/",
  sport: "/jobandeducation/vacancies/sport/",
  restaurant: "/jobandeducation/vacancies/restaurant/",
  entertainment: "/jobandeducation/vacancies/entertainment/",
};

export function mapCategoryToIrrby(categorySlug?: string | null): string {
  if (!categorySlug) return IRR_BY_RUBRIC_OTHER;

  const slug = categorySlug.toLowerCase().trim();
  return categoryToIrrby[slug] ?? IRR_BY_RUBRIC_OTHER;
}
