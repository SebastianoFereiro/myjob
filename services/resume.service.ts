import { fetchAPI } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  type StrapiSingleResponse,
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
    employmentType: (record.employmentType as Resume["employmentType"]) || "full-time",
    location: record.location || "",
    skills: record.skills ? JSON.parse(record.skills) : [],
    experience: record.experience ? JSON.parse(record.experience) : [],
    education: record.education ? JSON.parse(record.education) : [],
    languages: record.languages ? JSON.parse(record.languages) : [],
    about: record.about || "",
    isPublished: record.isPublished !== false,
    userId: record.userId || "",
    userEmail: record.userEmail || "",
    createdAt: record.createdAt || "",
    updatedAt: record.updatedAt || "",
    publishedAt: record.publishedAt || "",
  };
}

function serializeFormData(data: ResumeFormData) {
  return {
    title: data.title || `${data.position}`,
    slug: data.title
      ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      : `${data.firstName}-${data.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
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
    params.set("filters[userId][$eq]", userId);
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

  if (!response.ok) throw new Error("Failed to create resume");

  const json = await response.json();
  if (!json.data) throw new Error("Failed to create resume");

  return mapStrapiResume(unwrapStrapiRecord(json.data));
}

export async function updateResume(
  documentId: string,
  data: Partial<ResumeFormData>,
) {
  const payload = {
    data: serializeFormData(data as ResumeFormData),
  };

  const response = await fetchAPI<StrapiSingleResponse<StrapiResumeRecord>>(
    `${RESUME_ENDPOINT}/${documentId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  if (!response.data) throw new Error("Failed to update resume");

  return mapStrapiResume(unwrapStrapiRecord(response.data));
}

export async function deleteResume(documentId: string) {
  await fetchAPI(`${RESUME_ENDPOINT}/${documentId}`, {
    method: "DELETE",
  });
}