import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  type StrapiSingleResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";

export type StrapiCompanyRecord = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  description?: string;
  siteUrl?: string;
  email?: string;
  phone?: string;
  logo?: {
    url?: string;
    alternativeText?: string;
  } | null;
  ynp?: string;
  address?: string;
  isActive?: boolean;
  industry?: string;
  size?: string;
  location?: string;
  founded_year?: number | null;
};

export type CompanyPublic = {
  id: string;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  logoUrl?: string;
  siteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  location?: string;
  industry?: string;
  size?: string;
  ynp?: string;
  founded_year?: number | null;
  isActive: boolean;
};

const COMPANY_ENDPOINT = "/companies";

function mapStrapiCompany(record: StrapiCompanyRecord): CompanyPublic {
  const logoUrl = record.logo?.url
    ? getStrapiMediaURL(record.logo.url)
    : undefined;

  return {
    id: String(record.documentId || record.id || ""),
    documentId: record.documentId || "",
    name: record.name || "",
    slug: record.slug || "",
    description: record.description || "",
    logoUrl,
    siteUrl: record.siteUrl || undefined,
    email: record.email || undefined,
    phone: record.phone || undefined,
    address: record.address || undefined,
    location: record.location || undefined,
    industry: record.industry || undefined,
    size: record.size || undefined,
    ynp: record.ynp || undefined,
    founded_year: record.founded_year ?? undefined,
    isActive: record.isActive !== false,
  };
}

export async function getCompanies(): Promise<CompanyPublic[]> {
  try {
    const params = new URLSearchParams();
    params.set("sort[0]", "name:asc");
    params.set("pagination[pageSize]", "100");

    const response = await fetchAPI<StrapiListResponse<StrapiCompanyRecord>>(
      `${COMPANY_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["companies"] } },
    );

    return response.data
      .map((record) => mapStrapiCompany(unwrapStrapiRecord(record)))
      .filter((c) => c.name && c.slug);
  } catch {
    return [];
  }
}

export async function getCompanyBySlug(slug: string): Promise<CompanyPublic | null> {
  if (!slug) return null;

  try {
    const params = new URLSearchParams();
    params.set("filters[slug][$eq]", slug);
    params.set("pagination[pageSize]", "1");

    const response = await fetchAPI<StrapiListResponse<StrapiCompanyRecord>>(
      `${COMPANY_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["companies"] } },
    );

    const record = response.data[0];
    if (!record) return null;

    return mapStrapiCompany(unwrapStrapiRecord(record));
  } catch {
    return null;
  }
}

export async function getCompanyByDocumentId(documentId: string): Promise<CompanyPublic | null> {
  if (!documentId) return null;

  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiCompanyRecord>>(
      `${COMPANY_ENDPOINT}/${documentId}`,
      { next: { revalidate: 1, tags: ["companies"] } },
    );

    if (!response.data) return null;

    return mapStrapiCompany(unwrapStrapiRecord(response.data));
  } catch {
    return null;
  }
}
