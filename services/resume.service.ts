import { fetchAPI } from "@/lib/strapi-client";
import { formatStrapiError } from "@/lib/strapi-errors";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import type { Resume, ResumeFormData } from "@/types/resume";

const RESUME_ENDPOINT = "/resumes";

type StrapiResumeRecord = {
  id?: number | string;
  documentId?: string;
  title?: string;
  slug?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  position?: string;
  salary?: number;
  currency?: string;
  employmentType?: string;
  location?: string;
  skills?: string;
  experience?: string;
  education?: string;
  languages?: string;
  about?: string;
  isPublished?: boolean;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

function parseJSONField(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

function mapStrapiResume(record: StrapiResumeRecord): Resume {
  return {
    id: String(record.documentId || record.id || ""),
    documentId: record.documentId || "",
    title: record.title || "",
    slug: record.slug || "",
    firstName: record.firstName || "",
    lastName: record.lastName || "",
    phone: record.phone || "",
    email: record.email || "",
    position: record.position || "",
    salary: record.salary ?? null,
    currency: (record.currency as Resume["currency"]) || "BYN",
    employmentType: (record.employmentType as Resume["employmentType"]) || "Полный день",
    location: record.location || "",
    skills: parseJSONField(record.skills) as Resume["skills"],
    experience: parseJSONField(record.experience) as Resume["experience"],
    education: parseJSONField(record.education) as Resume["education"],
    languages: parseJSONField(record.languages) as Resume["languages"],
    about: record.about || "",
    isPublished: record.isPublished !== false,
    userId: record.userId || "",
    userEmail: record.userEmail || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
    publishedAt: record.publishedAt || "",
  };
}

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    || "resume";
}

function serializeFormData(data: ResumeFormData) {
  const hash = Date.now().toString(36).slice(-4);
  const base = toSlug(data.position || data.title || `${data.firstName}-${data.lastName}`);
  return {
    title: data.title || `${data.position}`,
    slug: `${base}-${hash}`,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    position: data.position,
    salary: data.salary,
    currency: data.currency,
    employmentType: data.employmentType,
    location: data.location,
    skills: JSON.stringify(data.skills),
    experience: JSON.stringify(data.experience),
    education: JSON.stringify(data.education),
    languages: JSON.stringify(data.languages),
    about: data.about,
    isPublished: data.isPublished,
    publishedAt: new Date().toISOString(),
  };
}

export type ResumeListResult = {
  resumes: Resume[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

const PAGE_SIZE = 10;

export async function getResumesByUserId(userId: string, page = 1): Promise<ResumeListResult> {
  try {
    const params = new URLSearchParams();
    params.set("populate", "*");
    params.set("sort[0]", "updatedAt:desc");
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(PAGE_SIZE));

    const response = await fetch(
      `/api/strapi/resumes?${params.toString()}`,
    );

    if (!response.ok) {
      return { resumes: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
    }

    const json = await response.json();

    if (!json.data || !Array.isArray(json.data)) {
      return { resumes: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
    }

    return {
      resumes: json.data.map((record: StrapiResumeRecord) =>
        mapStrapiResume(unwrapStrapiRecord(record)),
      ),
      pagination: json.meta?.pagination || { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 },
    };
  } catch {
    return { resumes: [], pagination: { page: 1, pageSize: PAGE_SIZE, pageCount: 0, total: 0 } };
  }
}

export async function getResumeByDocumentId(documentId: string) {
  try {
    const params = new URLSearchParams();
    params.set("populate", "*");

    const response = await fetchAPI<{ data: StrapiResumeRecord }>(
      `${RESUME_ENDPOINT}/${documentId}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["resumes"] } },
    );

    if (!response.data) return null;

    return mapStrapiResume(unwrapStrapiRecord(response.data));
  } catch {
    return null;
  }
}

export async function getResumeBySlug(slug: string) {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("filters[slug][$eq]", slug);

  const response = await fetchAPI<StrapiListResponse<StrapiResumeRecord>>(
    `${RESUME_ENDPOINT}?${params.toString()}`,
    { next: { revalidate: 1, tags: ["resumes"] } },
  );

  const record = response.data[0];
  if (!record) return null;

  return mapStrapiResume(unwrapStrapiRecord(record));
}

async function strapiClientFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/strapi${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Сервер вернул некорректный ответ (${response.status}). Попробуйте позже.`);
  }

  if (!response.ok) {
    throw new Error(formatStrapiError(json as Parameters<typeof formatStrapiError>[0]));
  }

  return json as T;
}

export async function createResume(data: ResumeFormData) {
  const payload = {
    data: {
      ...serializeFormData(data),
    },
  };

  const response = await fetch("/api/strapi/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Статус 2xx — успех, редиректим на dashboard
  // Ошибки парсинга игнорируем — запись уже создана в Strapi
  if (response.ok) return;

  // Пробуем получить причину ошибки
  try {
    const raw = await response.text();
    if (!raw) throw new Error(`HTTP ${response.status}`);
    const parsed = JSON.parse(raw);
    throw new Error(formatStrapiError(parsed));
  } catch (e) {
    if (e instanceof Error && e.message !== `HTTP ${response.status}`) throw e;
    throw new Error(`Ошибка сервера (${response.status}). Попробуйте позже.`);
  }
}

export async function updateResume(
  documentId: string,
  data: Partial<ResumeFormData>,
) {
  // Build partial payload — only send fields that changed
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.firstName !== undefined) payload.firstName = data.firstName;
  if (data.lastName !== undefined) payload.lastName = data.lastName;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.email !== undefined) payload.email = data.email;
  if (data.position !== undefined) payload.position = data.position;
  if (data.salary !== undefined) payload.salary = data.salary;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.employmentType !== undefined) payload.employmentType = data.employmentType;
  if (data.location !== undefined) payload.location = data.location;
  if (data.skills !== undefined) payload.skills = JSON.stringify(data.skills);
  if (data.experience !== undefined) payload.experience = JSON.stringify(data.experience);
  if (data.education !== undefined) payload.education = JSON.stringify(data.education);
  if (data.languages !== undefined) payload.languages = JSON.stringify(data.languages);
  if (data.about !== undefined) payload.about = data.about;
  if (data.isPublished !== undefined) payload.isPublished = data.isPublished;

  const response = await strapiClientFetch<{ data: StrapiResumeRecord }>(
    `/resumes/${documentId}`,
    {
      method: "PUT",
      body: JSON.stringify({ data: payload }),
    },
  );

  if (!response.data) throw new Error("Failed to update resume");

  return mapStrapiResume(unwrapStrapiRecord(response.data));
}

export async function deleteResume(documentId: string) {
  const response = await fetch(`/api/strapi/resumes/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let message = "Не удалось удалить резюме";
    try {
      const err = await response.json();
      message = err?.error?.message || message;
    } catch {}
    throw new Error(message);
  }
}
