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

type CategoryTag = string | NamedRecord;

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
  job_types?: string | NamedRecord | null;
  level_job?: string | NamedRecord | null;
  education_job?: string | NamedRecord | null;
  experience_job?: string | NamedRecord | null;
  isactive?: boolean;
  city?: string | NamedRecord | null;
  requirements?: string | null;
  conditions?: string | null;
  salary_job?: number | string | null;
  datetime_start?: string | null;
  datetime_finish?: string | null;
  categories?: CategoryTag[] | CategoryTag | string | null;
  SEO?: unknown[];
  image?: StrapiMediaField | null;
  category?: CategoryTag | null;
};

const PAGE_SIZE = 6;
const CV_ENDPOINT = "/cvs";

const mockCVRecords: StrapiCVRecord[] = [
  {
    documentId: "e0bc65h5tuaolw3jhk1ds8f4",
    title: "пример",
    description: "пример",
    createdAt: "2026-04-28T08:38:34.140Z",
    updatedAt: "2026-06-01T18:41:59.306Z",
    publishedAt: "2026-06-01T18:41:59.356Z",
    slug: "primer",
    sortOrder: 0,
    job_types: null,
    level_job: null,
    education_job: null,
    experience_job: null,
    isactive: true,
    city: null,
    requirements: null,
    conditions: null,
    salary_job: null,
    datetime_start: null,
    datetime_finish: null,
    categories: [{ slug: "logistics", name: "Логистика и склад" }],
    SEO: [],
    image: null,
    category: { slug: "logistics", name: "Логистика и склад" },
  },
  {
    documentId: "mock-cv-sales",
    title: "Менеджер по продажам",
    description: "Работа с входящими заявками, консультации клиентов и ведение CRM.",
    createdAt: "2026-05-14T09:00:00.000Z",
    updatedAt: "2026-05-14T09:00:00.000Z",
    publishedAt: "2026-05-14T09:00:00.000Z",
    slug: "sales-manager-brest",
    sortOrder: 1,
    job_types: { slug: "full-time", name: "Полная занятость" },
    level_job: null,
    education_job: null,
    experience_job: null,
    isactive: true,
    city: { slug: "brest", name: "Брест" },
    requirements: "Навыки продаж и работа с CRM; коммуникабельность.",
    conditions: "Официальное оформление, бонусы по результатам продаж.",
    salary_job: "2000-4200",
    datetime_start: null,
    datetime_finish: "2026-06-30T00:00:00.000Z",
    categories: [{ slug: "sales", name: "Продажи и клиенты" }],
    SEO: [],
    image: null,
    category: { slug: "sales", name: "Продажи и клиенты" },
  },
  {
    documentId: "mock-cv-remote",
    title: "Frontend-разработчик",
    description: "Разработка интерфейсов на React и поддержка дизайн-системы продукта.",
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-18T09:00:00.000Z",
    publishedAt: "2026-05-18T09:00:00.000Z",
    slug: "frontend-developer-remote",
    sortOrder: 2,
    job_types: { slug: "remote", name: "Удаленно" },
    level_job: null,
    education_job: null,
    experience_job: null,
    isactive: true,
    city: { slug: "remote", name: "Удаленно" },
    requirements: "Опыт с React, TypeScript и системами компонент.",
    conditions: "Гибкий график и удаленная работа.",
    salary_job: "4500-6500",
    datetime_start: null,
    datetime_finish: "2026-06-15T00:00:00.000Z",
    categories: [{ slug: "it", name: "IT и цифровые профессии" }],
    SEO: [],
    image: null,
    category: { slug: "it", name: "IT и цифровые профессии" },
  },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function getRecordName(value?: string | NamedRecord | null) {
  if (!value) {
    return "";
  }

  return typeof value === "string"
    ? value
    : value.name || value.title || value.slug || "";
}

function getRecordSlug(value?: string | NamedRecord | null) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return slugify(value);
  }

  const name = getRecordName(value);
  return value.slug || (name ? slugify(name) : "");
}

function resolveMediaURL(media?: StrapiMediaField | null) {
  if (typeof media === "string") {
    return getStrapiMediaURL(media);
  }

  return getStrapiMediaURL(
    media?.url || media?.data?.attributes?.url || undefined,
  );
}

function normalizeCategoryTag(tag: CategoryTag): JobCategory | null {
  if (typeof tag === "string") {
    const existing = fallbackCategories.find(
      (category) => category.slug === tag || category.name === tag,
    );

    return existing || { slug: slugify(tag), name: tag };
  }

  const name = getRecordName(tag);
  const slug = getRecordSlug(tag);

  if (!name || !slug) {
    return null;
  }

  return { slug, name, description: tag.description };
}

function normalizeCategories(record: StrapiCVRecord): JobCategory[] {
  // Собрать все категории из обоих полей
  const allTags: CategoryTag[] = [];

  // Добавить categories
  if (record.categories) {
    if (Array.isArray(record.categories)) {
      allTags.push(...record.categories);
    } else if (typeof record.categories === "string" && record.categories.includes(",")) {
      allTags.push(...record.categories.split(",").map((c) => c.trim()));
    } else {
      allTags.push(record.categories);
    }
  }

  // Добавить category если categories пуст или если category отличается
  if (record.category && allTags.length === 0) {
    allTags.push(record.category);
  }

  // Нормализовать в JobCategory
  const normalized = allTags
    .map(normalizeCategoryTag)
    .filter((category): category is JobCategory => Boolean(category));

  // Удалить дубликаты по slug
  const unique = Array.from(
    new Map(normalized.map((cat) => [cat.slug, cat])).values()
  );

  return unique.length > 0 ? unique : [{ slug: "other", name: "Другое" }];
}

function normalizeEmploymentType(value?: string | NamedRecord | null): EmploymentType {
  const slug = getRecordSlug(value);
  const name = getRecordName(value).toLowerCase();

  if (slug === "remote" || name.includes("удален")) return "remote";
  if (slug === "part-time" || name.includes("част")) return "part-time";
  if (slug === "contract" || name.includes("проект")) return "contract";
  if (slug === "internship" || name.includes("стаж")) return "internship";

  return "full-time";
}

function parseSalary(value?: number | string | null) {
  if (typeof value === "number") {
    return { salaryFrom: value, salaryTo: undefined };
  }

  if (!value) {
    return { salaryFrom: undefined, salaryTo: undefined };
  }

  const numbers = value.match(/\d+/g)?.map(Number) || [];

  return {
    salaryFrom: numbers[0],
    salaryTo: numbers[1],
  };
}

function cvToJob(record: StrapiCVRecord): Job {
  const categories = normalizeCategories(record);
  // Определить основную категорию (первая в списке или специально отмеченная)
  const primaryCategory = categories[0];
  
  const cityName = getRecordName(record.city);
  const salary = parseSalary(record.salary_job);
  const id = String(record.documentId || record.id || record.slug || record.title);

  return {
    // ID и идентификаторы
    id,
    documentId: record.documentId || id,
    slug: record.slug || slugify(record.title || id),
    
    // Базовая информация
    title: record.title || "Вакансия",
    description: record.description || "",
    company: {
      id: "myjob",
      name: "MyJOB",
      slug: "myjob",
      logoUrl: resolveMediaURL(record.image),
    },
    
    // Категории и типы
    category: primaryCategory,
    categories,
    jobType: getRecordName(record.job_types) || undefined,
    level: getRecordName(record.level_job) || undefined,
    education: getRecordName(record.education_job) || undefined,
    experience: getRecordName(record.experience_job) || undefined,
    
    // Локация
    region: cityName || undefined,
    cities: cityName ? [cityName] : [],
    city: cityName || undefined,
    location: cityName || "Не указано",
    employmentType: normalizeEmploymentType(record.job_types),
    
    // Зарплата
    salaryFrom: salary.salaryFrom,
    salaryTo: salary.salaryTo,
    salary: record.salary_job || undefined,
    currency: "BYN",
    
    // Требования
    requirements: record.requirements || undefined,
    conditions: record.conditions || undefined,
    
    // Даты
    publishedAt: record.publishedAt || record.createdAt || new Date().toISOString(),
    createdAt: record.createdAt || undefined,
    updatedAt: record.updatedAt || undefined,
    deadline: record.datetime_finish || undefined,
    startDate: record.datetime_start || undefined,
    finishDate: record.datetime_finish || undefined,
    
    // Статус
    isActive: record.isactive !== false,
    
    // Дополнительно
    sortOrder: record.sortOrder,
    image: resolveMediaURL(record.image),
  };
}

function filterJobs(jobs: Job[], filters: JobFilters) {
  const query = filters.query?.trim().toLowerCase();
  const location = filters.location?.trim().toLowerCase();

  return jobs.filter((job) => {
    const categoryText = (job.categories || [job.category])
      .map((category) => `${category.name} ${category.slug}`)
      .join(" ");
    const locationText = `${job.location} ${(job.cities || []).join(" ")}`;
    const matchesQuery = query
      ? `${job.title} ${job.description} ${categoryText}`.toLowerCase().includes(query)
      : true;
    const matchesLocation = location
      ? locationText.toLowerCase().includes(location)
      : true;
    const matchesType = filters.type ? job.employmentType === filters.type : true;
    const matchesCategory = filters.category
      ? (job.categories || [job.category]).some(
          (category) => category.slug === filters.category,
        )
      : true;

    return matchesQuery && matchesLocation && matchesType && matchesCategory;
  });
}

function paginateJobs(jobs: Job[], page = 1): JobListResult {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const pageCount = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
  const offset = (safePage - 1) * PAGE_SIZE;

  return {
    jobs: jobs.slice(offset, offset + PAGE_SIZE),
    pagination: {
      page: safePage,
      pageSize: PAGE_SIZE,
      pageCount,
      total: jobs.length,
    },
  };
}

function buildCVQuery() {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", "100");

  return params.toString();
}

async function getStrapiCVRecords() {
  const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
    `${CV_ENDPOINT}?${buildCVQuery()}`,
    { next: { revalidate: 1, tags: ["cv"] } },
  );
 
  return response.data
    .map((record) => unwrapStrapiRecord(record))
    .filter((record) => record.isactive !== false);
}

async function getCVRecords() {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return mockCVRecords;
  }

  try {
    const records = await getStrapiCVRecords();
    return records.length > 0 ? records : mockCVRecords;
  } catch {
    return mockCVRecords;
  }
}

export async function getAllJobs() {
  const records = await getCVRecords();
  return records.map(cvToJob);
}

export async function getCategoryCounts(categories = fallbackCategories) {
  const jobs = await getAllJobs();

  return categories.map((category) => ({
    ...category,
    count: jobs.filter((job) =>
      (job.categories || [job.category]).some(
        (jobCategory) => jobCategory.slug === category.slug,
      ),
    ).length,
  }));
}

export async function getJobs(filters: JobFilters = {}): Promise<JobListResult> {
  const jobs = await getAllJobs();
  return paginateJobs(filterJobs(jobs, filters), filters.page);
}

export async function getJobBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  const jobs = await getAllJobs();
  return jobs.find((job) => job.slug === slug) || null;
}

export async function getJobsByCategory(categorySlug: string): Promise<JobListResult> {
  if (!categorySlug) {
    return {
      jobs: [],
      pagination: {
        page: 1,
        pageSize: PAGE_SIZE,
        pageCount: 0,
        total: 0,
      },
    };
  }

  const jobs = await getAllJobs();
  const filteredJobs = jobs.filter((job) =>
    (job.categories || [job.category]).some(
      (category) => category.slug === categorySlug,
    ),
  );

  return paginateJobs(filteredJobs, 1);
}

export async function createJobSubscription(payload: SubscriptionPayload) {
  return fetchAPI("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });
}

export type { PaginationMeta };
