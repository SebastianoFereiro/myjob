import { fetchAPI } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import type {
  CvVacancy,
  CvVacancyFormData,
  CvFilters,
  CvListResult,
} from "@/types/cv";

const CV_ENDPOINT = "/cvs";
const PAGE_SIZE = 10;

function buildPopulateParams(): URLSearchParams {
  const params = new URLSearchParams();
  params.append("populate", "company");
  params.append("populate", "category");
  params.append("populate", "image");
  return params;
}

type StrapiCvRecord = {
  id?: number | string;
  documentId?: string;
  slug?: string;
  title?: string;
  position?: string;
  description?: string;
  requirements?: string | null;
  conditions?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  currency?: string;
  employmentType?: string;
  location?: string;
  city?: string | null;
  level_job?: string | null;
  experience_job?: string | null;
  education_job?: string | null;
  deadline?: string | null;
  datetime_start?: string | null;
  datetime_finish?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  userId?: string;
  company?: Record<string, unknown> | null;
  category?: Record<string, unknown> | null;
  image?: unknown;
  SEO?: unknown[];
  Profile?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

function extractRef<T extends { id?: number; documentId?: string; [key: string]: unknown }>(
  data: Record<string, unknown> | null | undefined,
): T | null {
  if (!data) return null;
  const unwrapped = unwrapStrapiRecord(data as Record<string, unknown>);
  return unwrapped as T;
}

function mapStrapiCv(record: StrapiCvRecord): CvVacancy {
  const company = extractRef<import("@/types/cv").CompanyRef>(
    record.company as Record<string, unknown> | null | undefined,
  );
  const category = extractRef<import("@/types/cv").CategoryRef>(
    record.category as Record<string, unknown> | null | undefined,
  );

  return {
    id: String(record.documentId || record.id || ""),
    documentId: record.documentId || "",
    strapiId: typeof record.id === "number" ? record.id : undefined,
    slug: record.slug || "",
    title: record.title || "",
    position: record.position || "",
    description: record.description || "",
    requirements: record.requirements ?? null,
    conditions: record.conditions ?? null,
    salaryFrom: record.salaryFrom ?? null,
    salaryTo: record.salaryTo ?? null,
    currency: (record.currency as CvVacancy["currency"]) || "BYN",
    employmentType: (record.employmentType as CvVacancy["employmentType"]) || "Полная занятость",
    location: record.location || "",
    city: record.city ?? null,
    level_job: (record.level_job as CvVacancy["level_job"]) ?? null,
    experience_job: (record.experience_job as CvVacancy["experience_job"]) ?? null,
    education_job: (record.education_job as CvVacancy["education_job"]) ?? null,
    deadline: record.deadline ?? null,
    datetime_start: record.datetime_start ?? null,
    datetime_finish: record.datetime_finish ?? null,
    sortOrder: record.sortOrder ?? 100,
    isActive: record.isActive !== false,
    userId: record.userId || "",
    company,
    category,
    image: record.image,
    SEO: record.SEO,
    Profile: record.Profile,
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
    publishedAt: record.publishedAt ?? null,
  };
}

async function strapiClientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/strapi${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status}`);
  }

  return response.json();
}

export async function getCvsByUserId(page = 1): Promise<CvListResult> {
  try {
    const params = buildPopulateParams();
    params.set("sort[0]", "updatedAt:desc");
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(PAGE_SIZE));

    const response = await fetch(
      `/api/strapi/cvs?${params.toString()}`,
    );

    if (!response.ok) {
      return { vacancies: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
    }

    const json = await response.json();

    if (!json.data || !Array.isArray(json.data)) {
      return { vacancies: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
    }

    return {
      vacancies: json.data.map((record: StrapiCvRecord) =>
        mapStrapiCv(unwrapStrapiRecord(record)),
      ),
      pagination: json.meta?.pagination || { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 },
    };
  } catch {
    return { vacancies: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
  }
}

export async function getCvBySlug(slug: string): Promise<CvVacancy | null> {
  const params = buildPopulateParams();
  params.set("filters[slug][$eq]", slug);

  try {
    const response = await fetchAPI<StrapiListResponse<StrapiCvRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    const record = response.data[0];
    if (!record) return null;

    return mapStrapiCv(unwrapStrapiRecord(record));
  } catch {
    return null;
  }
}

export async function getCvByDocumentId(documentId: string): Promise<CvVacancy | null> {
  try {
    const params = buildPopulateParams();
    const json = await fetchAPI<{ data: StrapiCvRecord }>(
      `${CV_ENDPOINT}/${documentId}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    if (!json.data) return null;

    return mapStrapiCv(unwrapStrapiRecord(json.data));
  } catch {
    return null;
  }
}

export async function createCv(data: CvVacancyFormData) {
  const slug = (data.title || data.position)
    .toLowerCase()
    // Транслитерация кириллицы
    .replace(/[а-яё]/g, (ch) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
        ы: "y", э: "e", ю: "yu", я: "ya",
      };
      return map[ch] ?? ch;
    })
    .replace(/[^a-z0-9-_.~]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\.+/g, ".")
    .slice(0, 200);

  const payload: Record<string, unknown> = {
    title: data.title || data.position,
    slug,
    position: data.position,
    description: data.description,
    salaryFrom: data.salaryFrom,
    salaryTo: data.salaryTo,
    currency: data.currency,
    employmentType: data.employmentType,
    location: data.location,
    city: data.city,
    level_job: data.level_job || undefined,
    experience_job: data.experience_job || undefined,
    education_job: data.education_job || undefined,
    deadline: data.deadline || undefined,
    sortOrder: 100,
    isActive: data.isActive,
    requirements: data.requirements || undefined,
    conditions: data.conditions || undefined,
    userId: "",
  };

  // Relations — используем documentId (Strapi 5)
  if (data.companyDocumentId) {
    payload.company = data.companyDocumentId;
  }
  if (data.categoryDocumentId) {
    payload.category = data.categoryDocumentId;
  }

  const json = await strapiClientFetch<{ data: StrapiCvRecord }>(
    "/cvs",
    {
      method: "POST",
      body: JSON.stringify({ data: payload }),
    },
  );

  if (!json.data) throw new Error("Failed to create CV");

  return mapStrapiCv(unwrapStrapiRecord(json.data));
}

export async function updateCv(documentId: string, data: Partial<CvVacancyFormData>) {
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.position !== undefined) payload.position = data.position;
  if (data.description !== undefined) payload.description = data.description;
  if (data.salaryFrom !== undefined) payload.salaryFrom = data.salaryFrom;
  if (data.salaryTo !== undefined) payload.salaryTo = data.salaryTo;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.employmentType !== undefined) payload.employmentType = data.employmentType;
  if (data.location !== undefined) payload.location = data.location;
  if (data.city !== undefined) payload.city = data.city;
  if (data.level_job !== undefined) payload.level_job = data.level_job || undefined;
  if (data.experience_job !== undefined) payload.experience_job = data.experience_job || undefined;
  if (data.education_job !== undefined) payload.education_job = data.education_job || undefined;
  if (data.deadline !== undefined) payload.deadline = data.deadline || undefined;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  if (data.requirements !== undefined) payload.requirements = data.requirements || undefined;
  if (data.conditions !== undefined) payload.conditions = data.conditions || undefined;
  if (data.companyDocumentId !== undefined) payload.company = data.companyDocumentId;
  if (data.categoryDocumentId !== undefined) payload.category = data.categoryDocumentId;

  const json = await strapiClientFetch<{ data: StrapiCvRecord }>(
    `/cvs/${documentId}`,
    {
      method: "PUT",
      body: JSON.stringify({ data: payload }),
    },
  );

  if (!json.data) throw new Error("Failed to update CV");

  return mapStrapiCv(unwrapStrapiRecord(json.data));
}

export async function softDeleteCv(documentId: string) {
  await strapiClientFetch(`/cvs/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { isActive: false } }),
  });
}

function buildFiltersParams(filters: CvFilters): URLSearchParams {
  const params = buildPopulateParams();
  let orIndex = 0;

  params.set("filters[isActive][$eq]", "true");

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
    params.set("filters[employmentType][$eq]", filters.type);
  }

  if (filters.category) {
    if (filters.category === "other") {
      params.set("filters[category][id][$null]", "true");
    } else {
      params.set("filters[category][slug][$eq]", filters.category);
    }
  }

  if (filters.level_job) {
    params.set("filters[level_job][$eq]", filters.level_job);
  }

  if (filters.experience_job) {
    params.set("filters[experience_job][$eq]", filters.experience_job);
  }

  if (filters.education_job) {
    params.set("filters[education_job][$eq]", filters.education_job);
  }

  if (filters.salary_min != null) {
    params.set("filters[salaryFrom][$gte]", String(filters.salary_min));
  }

  if (filters.salary_max != null) {
    params.set("filters[salaryTo][$lte]", String(filters.salary_max));
  }

  if (filters.remote_possible != null) {
    params.set("filters[employmentType][$eq]", "Удаленно");
  }

  return params;
}

export async function getAllCvs(filters: CvFilters = {}): Promise<CvListResult> {
  const params = buildFiltersParams(filters);

  const safePage = filters.page && Number.isFinite(filters.page) && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.page_size ?? PAGE_SIZE;
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[page]", String(safePage));
  params.set("pagination[pageSize]", String(pageSize));

  try {
    const response = await fetchAPI<StrapiListResponse<StrapiCvRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["cv"] } },
    );

    return {
      vacancies: response.data.map((record) =>
        mapStrapiCv(unwrapStrapiRecord(record)),
      ),
      pagination: response.meta?.pagination || { page: 1, pageSize, pageCount: 0, total: 0 },
    };
  } catch {
    return { vacancies: [], pagination: { page: 1, pageSize, pageCount: 0, total: 0 } };
  }
}
