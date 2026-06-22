import { jobCategories as fallbackCategories } from "@/app/data/job-categories";
import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
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
      data?: {
        attributes?: {
          url?: string;
          alternativeText?: string;
        };
      };
    };

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
  SEO?: unknown[];
  image?: StrapiMediaField | null;
};

const PAGE_SIZE = 6;
const CV_ENDPOINT = "/cvs";

function buildPopulateParams(): URLSearchParams {
  const params = new URLSearchParams();
  params.append("populate", "company");
  params.append("populate", "category");
  params.append("populate", "image");
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

function resolveMediaURL(media?: StrapiMediaField | null) {
  if (typeof media === "string") return getStrapiMediaURL(media);
  return getStrapiMediaURL(
    media?.url || media?.data?.attributes?.url || undefined,
  );
}

function normalizeCategoryTag(tag: StrapiCategoryRef | string): JobCategory | null {
  if (typeof tag === "string") {
    const existing = fallbackCategories.find(
      (category) => category.slug === tag || category.name === tag,
    );
    return existing || { slug: slugify(tag), name: tag };
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
  return {
    id: String(unwrapped.documentId || unwrapped.id || "myjob"),
    name: (unwrapped as { name?: string }).name || "MyJOB",
    slug: (unwrapped as { slug?: string }).slug || "myjob",
    logoUrl: resolveMediaURL(
      (unwrapped as { logo?: StrapiMediaField | null }).logo,
    ),
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

  const id = String(record.id ?? record.documentId ?? record.slug ?? record.title);

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
  };
}

const employmentTypeReverseMap: Record<EmploymentType, string> = {
  "full-time": "Полная занятость",
  "part-time": "Частичная занятость",
  "contract": "Проектная работа",
  "internship": "Стажировка",
  "remote": "Удаленно",
};

function buildFiltersParams(filters: JobFilters): URLSearchParams {
  const params = buildPopulateParams();
  let orIndex = 0;

  params.set("filters[isActive][$eq]", "true");
  params.set("sort[0]", "publishedAt:desc");

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

  const safePage = filters.page && Number.isFinite(filters.page) && filters.page > 0 ? filters.page : 1;
  params.set("pagination[page]", String(safePage));
  params.set("pagination[pageSize]", String(PAGE_SIZE));

  return params;
}

export async function getJobs(filters: JobFilters = {}): Promise<JobListResult> {
  try {
    const params = buildFiltersParams(filters);
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

export async function getJobById(id: string | number) {
  if (!id) return null;

  try {
    const params = buildPopulateParams();
    params.set("filters[id][$eq]", String(id));

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

export async function getCategoryCounts(categories = fallbackCategories) {
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
    const params = buildPopulateParams();
    params.set("filters[isActive][$eq]", "true");
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

export async function createJobSubscription(payload: SubscriptionPayload) {
  return fetchAPI("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });
}

export type { PaginationMeta };
