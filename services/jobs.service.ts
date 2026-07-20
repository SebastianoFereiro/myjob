import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import type { SeoMetadata } from '@/types/seo';
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import type {
  EmploymentType,
  Job,
  JobCategory,
  JobFilters,
  JobListResult,
  PaginationMeta,
  SubscriptionPayload,
} from "@/types/jobs";

type NamedRecord = {
  documentId?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
};

type StrapiMediaField =
  | string
  | {
      url?: string;
      alternativeText?: string;
      data?:
        | {
            url?: string;
            alternativeText?: string;
          }
        | {
            attributes?: {
              url?: string;
              alternativeText?: string;
            };
          };
    };

type StrapiMediaArray = StrapiMediaField[];

type StrapiCompanyRef = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string;
  siteUrl?: string;
  email?: string;
  phone?: string;
  logo?: StrapiMediaField | null;
  [key: string]: unknown;
};

type StrapiCategoryRef = {
  id?: number;
  documentId?: string;
  name?: string;
  title?: string;
  slug?: string;
  [key: string]: unknown;
};

type StrapiCVRecord = {
  id?: string | number;
  documentId?: string;
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
  city?: string | null;
  location?: string | null;
  position?: string | null;
  requirements?: string | null;
  conditions?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  currency?: string;
  employmentType?: string | null;
  level_job?: string | null;
  experience_job?: string | null;
  education_job?: string | null;
  deadline?: string | null;
  datetime_start?: string | null;
  datetime_finish?: string | null;
  userId?: string;
  company?: StrapiCompanyRef | null;
  category?: StrapiCategoryRef | null;
  SEO?: SeoMetadata | null;
  image?: StrapiMediaField | null;
  // Премиум-закрепление
  premium_from?: string | null;
  premium_to?: string | null;
  // Авто-поднятие
  push_from?: string | null;
  push_to?: string | null;
};

const PAGE_SIZE = 6;
const CV_ENDPOINT = "/cvs";

function buildPopulateParams(): URLSearchParams {
  const params = new URLSearchParams();
  params.set("populate", "*");
  return params;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function getRecordName(value?: string | NamedRecord | null) {
  if (!value) return "";
  return typeof value === "string"
    ? value
    : value.name || value.title || value.slug || "";
}

function getRecordSlug(value?: string | NamedRecord | null) {
  if (!value) return "";
  if (typeof value === "string") return slugify(value);
  const name = getRecordName(value);
  return value.slug || (name ? slugify(name) : "");
}

function resolveMediaURL(media?: StrapiMediaField | StrapiMediaArray | null) {
  if (!media) return undefined;

  // Handle array (multiple media) — take first
  if (Array.isArray(media)) {
    return resolveMediaURL(media[0] ?? null);
  }

  if (typeof media === "string") return getStrapiMediaURL(media);

  if (media.url) return getStrapiMediaURL(media.url);

  const data = media.data;
  if (data) {
    if ("attributes" in data && data.attributes?.url) {
      return getStrapiMediaURL(data.attributes.url);
    }
    if ("url" in data && data.url) {
      return getStrapiMediaURL(data.url);
    }
  }

  return undefined;
}

function normalizeCategoryTag(tag: StrapiCategoryRef | string): JobCategory | null {
  if (typeof tag === "string") {
    return { slug: slugify(tag), name: tag };
  }

  const name = tag.title || tag.name || "";
  const slug = tag.slug || (name ? slugify(name) : "");

  if (!name || !slug) return null;

  return { slug, name, description: tag.description as string | undefined };
}

const employmentTypeMap: Record<string, EmploymentType> = {
  "Полная занятость": "full-time",
  "Частичная занятость": "part-time",
  "Проектная работа": "contract",
  "Стажировка": "internship",
  "Удаленно": "remote",
};

function normalizeEmploymentType(value?: string | null): EmploymentType {
  if (!value) return "full-time";
  const mapped = employmentTypeMap[value];
  if (mapped) return mapped;

  const lower = value.toLowerCase();
  if (lower.includes("удален")) return "remote";
  if (lower.includes("част")) return "part-time";
  if (lower.includes("проект")) return "contract";
  if (lower.includes("стаж")) return "internship";

  return "full-time";
}

function extractCompany(record: StrapiCVRecord) {
  const company = record.company;
  if (!company) {
    return {
      id: "myjob",
      name: "MyJOB",
      slug: "myjob",
      logoUrl: undefined as string | undefined,
    };
  }

  const unwrapped = unwrapStrapiRecord(company as Record<string, unknown>);
  const typed = unwrapped as { name?: string; slug?: string; phone?: string; email?: string; logo?: StrapiMediaField | null };
  return {
    id: String(unwrapped.documentId || unwrapped.id || "myjob"),
    name: typed.name || "MyJOB",
    slug: typed.slug || "myjob",
    logoUrl: resolveMediaURL(typed.logo),
    phone: typed.phone || undefined,
    email: typed.email || undefined,
  };
}

function extractCategory(record: StrapiCVRecord): JobCategory | null {
  const category = record.category;
  if (!category) return null;

  const unwrapped = unwrapStrapiRecord(category as Record<string, unknown>);
  return normalizeCategoryTag(unwrapped as StrapiCategoryRef) || null;
}

function cvToJob(record: StrapiCVRecord): Job {
  const company = extractCompany(record);
  const primaryCategory = extractCategory(record) ?? null;

  const id = String(record.documentId ?? record.id ?? record.slug ?? record.title);

  return {
    id,
    documentId: record.documentId || id,
    slug: record.slug || slugify(record.title || id),

    title: record.title || "Вакансия",
    description: record.description || "",
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      phone: company.phone,
      email: company.email,
    },

    category: primaryCategory,
    jobType: record.employmentType || undefined,
    level: record.level_job || undefined,
    education: record.education_job || undefined,
    experience: record.experience_job || undefined,
    position: record.position || undefined,
    region: record.city || record.location || undefined,
    cities: record.city ? [record.city] : [],
    city: record.city || undefined,
    location: record.location || record.city || "Не указано",
    employmentType: normalizeEmploymentType(record.employmentType),

    salaryFrom: record.salaryFrom ?? undefined,
    salaryTo: record.salaryTo ?? undefined,
    salary: undefined,
    currency: record.currency || "BYN",

    requirements: record.requirements || undefined,
    conditions: record.conditions || undefined,

    publishedAt: record.publishedAt || record.createdAt || new Date().toISOString(),
    createdAt: record.createdAt || undefined,
    updatedAt: record.updatedAt || undefined,
    deadline: record.datetime_finish || record.deadline || undefined,
    startDate: record.datetime_start || undefined,
    finishDate: record.datetime_finish || undefined,

    isActive: record.isActive !== false,
    sortOrder: record.sortOrder,
    image: resolveMediaURL(record.image),
    SEO: record.SEO ?? null,
    // Премиум-закрепление
    premium_from: record.premium_from ?? null,
    premium_to: record.premium_to ?? null,
    // Авто-поднятие
    push_from: record.push_from ?? null,
    push_to: record.push_to ?? null,
    // Вычисляем isPremium: active if now is between premium_from and premium_to
    isPremium: !!(record.premium_from && record.premium_to
      && record.premium_from <= new Date().toISOString()
      && record.premium_to >= new Date().toISOString()),
  };
}

const employmentTypeReverseMap: Record<EmploymentType, string> = {
  "full-time": "Полная занятость",
  "part-time": "Частичная занятость",
  "contract": "Проектная работа",
  "internship": "Стажировка",
  "remote": "Удаленно",
};

function buildFiltersParams(
  filters: JobFilters,
  options?: { excludePremium?: boolean },
): URLSearchParams {
  const params = buildPopulateParams();
  let orIndex = 0;

  params.set("filters[isActive][$eq]", "true");
  params.set("sort[0]", "publishedAt:desc");

  // Исключаем активные премиум-вакансии из обычной выдачи
  if (options?.excludePremium) {
    const now = new Date().toISOString();
    params.set("filters[$or][0][premium_from][$null]", "true");
    params.set("filters[$or][1][premium_to][$lt]", now);
  }

  if (filters.query) {
    params.set(`filters[$or][${orIndex}][title][$contains]`, filters.query);
    orIndex++;
    params.set(`filters[$or][${orIndex}][position][$contains]`, filters.query);
    orIndex++;
    params.set(`filters[$or][${orIndex}][description][$contains]`, filters.query);
    orIndex++;
    params.set(`filters[$or][${orIndex}][company][name][$contains]`, filters.query);
    orIndex++;
  }

  if (filters.location) {
    params.set("filters[location][$contains]", filters.location);
  }

  if (filters.type) {
    const russianType = employmentTypeReverseMap[filters.type as EmploymentType] || filters.type;
    params.set("filters[employmentType][$eq]", russianType);
  }

  if (filters.category) {
    if (filters.category === "other") {
      params.set("filters[category][id][$null]", "true");
    } else {
      params.set("filters[category][slug][$eq]", filters.category);
    }
  }

  if (filters.company) {
    params.set("filters[company][slug][$eq]", filters.company);
  }

  if (filters.level) {
    params.set("filters[level_job][$eq]", filters.level);
  }

  if (filters.experience) {
    params.set("filters[experience_job][$eq]", filters.experience);
  }

  if (filters.education) {
    params.set("filters[education_job][$eq]", filters.education);
  }

  if (filters.position) {
    params.set("filters[position][$contains]", filters.position);
  }

  const safePage = filters.page && Number.isFinite(filters.page) && filters.page > 0 ? filters.page : 1;
  params.set("pagination[page]", String(safePage));
  params.set("pagination[pageSize]", String(PAGE_SIZE));

  return params;
}

export async function getJobs(filters: JobFilters = {}): Promise<JobListResult> {
  try {
    const params = buildFiltersParams(filters, { excludePremium: true });
    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    return {
      jobs: response.data.map((record) => cvToJob(unwrapStrapiRecord(record))),
      pagination: response.meta?.pagination || { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 },
    };
  } catch {
    return { jobs: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
  }
}

export async function getPremiumJobs(filters: JobFilters = {}): Promise<JobListResult> {
  try {
    const now = new Date().toISOString();
    const params = buildPopulateParams();
    let orIndex = 0;

    params.set("filters[isActive][$eq]", "true");
    params.set("filters[premium_from][$lte]", now);
    params.set("filters[premium_to][$gte]", now);
    params.set("sort[0]", "premium_from:desc");

    if (filters.query) {
      params.set(`filters[$or][${orIndex}][title][$contains]`, filters.query);
      orIndex++;
      params.set(`filters[$or][${orIndex}][position][$contains]`, filters.query);
      orIndex++;
      params.set(`filters[$or][${orIndex}][description][$contains]`, filters.query);
      orIndex++;
      params.set(`filters[$or][${orIndex}][company][name][$contains]`, filters.query);
      orIndex++;
    }

    if (filters.location) {
      params.set("filters[location][$contains]", filters.location);
    }

    if (filters.type) {
      const russianType = employmentTypeReverseMap[filters.type as EmploymentType] || filters.type;
      params.set("filters[employmentType][$eq]", russianType);
    }

    if (filters.category) {
      if (filters.category === "other") {
        params.set("filters[category][id][$null]", "true");
      } else {
        params.set("filters[category][slug][$eq]", filters.category);
      }
    }

    if (filters.company) {
      params.set("filters[company][slug][$eq]", filters.company);
    }

    if (filters.level) {
      params.set("filters[level_job][$eq]", filters.level);
    }

    if (filters.experience) {
      params.set("filters[experience_job][$eq]", filters.experience);
    }

    if (filters.education) {
      params.set("filters[education_job][$eq]", filters.education);
    }

    if (filters.position) {
      params.set("filters[position][$contains]", filters.position);
    }

    params.set("pagination[pageSize]", "50");

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    return {
      jobs: response.data.map((record) => cvToJob(unwrapStrapiRecord(record))),
      pagination: response.meta?.pagination || { page: 1, pageSize: 50, pageCount: 0, total: 0 },
    };
  } catch {
    return { jobs: [], pagination: { page: 1, pageSize: 50, pageCount: 0, total: 0 } };
  }
}

export async function getJobBySlug(slug: string) {
  if (!slug) return null;

  try {
    const params = buildPopulateParams();
    params.set("filters[slug][$eq]", slug);
    params.set("filters[isActive][$eq]", "true");

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    const record = response.data[0];
    if (!record) return null;

    return cvToJob(unwrapStrapiRecord(record));
  } catch {
    return null;
  }
}

export async function getJobByDocumentId(documentId: string) {
  if (!documentId) return null;

  try {
    const params = buildPopulateParams();
    params.set("filters[documentId][$eq]", documentId);

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    const record = response.data[0];
    if (!record) return null;

    return cvToJob(unwrapStrapiRecord(record));
  } catch {
    return null;
  }
}

export async function getJobsByCategory(categorySlug: string): Promise<JobListResult> {
  if (!categorySlug) {
    return {
      jobs: [],
      pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 },
    };
  }

  try {
    const params = buildPopulateParams();
    params.set("filters[isActive][$eq]", "true");
    params.set("filters[category][slug][$eq]", categorySlug);
    params.set("sort[0]", "publishedAt:desc");
    params.set("pagination[page]", "1");
    params.set("pagination[pageSize]", String(PAGE_SIZE));

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    return {
      jobs: response.data.map((record) => cvToJob(unwrapStrapiRecord(record))),
      pagination: response.meta?.pagination || { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 },
    };
  } catch {
    return { jobs: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
  }
}

export async function getCategoryCounts(categories: JobCategory[] = []) {
  try {
    const allJobs = await getAllJobs();

    return categories.map((category) => ({
      ...category,
      count: allJobs.filter((job) => job.category?.slug === category.slug).length,
    }));
  } catch {
    return categories.map((category) => ({ ...category, count: 0 }));
  }
}

export async function getAllJobs() {
  try {
    const now = new Date().toISOString();
    const params = buildPopulateParams();
    params.set("filters[isActive][$eq]", "true");
    // Исключаем премиум-вакансии из общего подсчёта (они уже в premium-секции)
    params.set("filters[$or][0][premium_from][$null]", "true");
    params.set("filters[$or][1][premium_to][$lt]", now);
    params.set("sort[0]", "publishedAt:desc");
    params.set("pagination[pageSize]", "100");

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    return response.data.map((record) => cvToJob(unwrapStrapiRecord(record)));
  } catch {
    return [];
  }
}

export type SitemapJobEntry = {
  slug: string;
  documentId: string;
  updatedAt: string;
};

export async function getAllJobsForSitemap(): Promise<SitemapJobEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set("filters[isActive][$eq]", "true");
    params.set("sort[0]", "updatedAt:desc");
    params.set("pagination[pageSize]", "1000");
    // Минимальная populate — только поля для URL и даты
    params.set("fields[0]", "slug");
    params.set("fields[1]", "documentId");
    params.set("fields[2]", "updatedAt");

    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 3600, tags: ["cv"] } },
    );

    return response.data.map((record) => {
      const r = unwrapStrapiRecord(record) as StrapiCVRecord;
      return {
        slug: r.slug || "",
        documentId: r.documentId || String(r.id || ""),
        updatedAt: r.updatedAt || r.publishedAt || new Date().toISOString(),
      };
    }).filter((entry) => entry.slug && entry.documentId);
  } catch {
    return [];
  }
}

export async function createJobSubscription(payload: SubscriptionPayload) {
  return fetchAPI("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });
}

export type { PaginationMeta };
