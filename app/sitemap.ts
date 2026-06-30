import type { MetadataRoute } from "next";
import { fetchAPI } from "@/lib/strapi-client";
import { type StrapiListResponse, unwrapStrapiRecord } from "@/lib/strapi-record";

// ===== Типы для Strapi-записей (минимальные поля для sitemap) =====

type StrapiSitemapRecord = {
  id?: number | string;
  documentId?: string;
  slug?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ===== Вспомогательные =====

function siteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}${path}`;
}

function lastmod(record: StrapiSitemapRecord): string {
  return record.updatedAt || record.publishedAt || record.createdAt || new Date().toISOString();
}

type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

// ===== Статические маршруты =====

const STATIC_ROUTES: Array<{
  path: string;
  priority: SitemapEntry["priority"];
  changeFrequency: SitemapEntry["changeFrequency"];
}> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/jobs", priority: 0.9, changeFrequency: "daily" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/categories", priority: 0.7, changeFrequency: "weekly" },
  { path: "/companies", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/help", priority: 0.4, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contacts", priority: 0.4, changeFrequency: "monthly" },
];

// ===== Динамические маршруты =====

async function fetchJobPages(): Promise<SitemapEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set("filters[isActive][$eq]", "true");
    params.set("sort[0]", "updatedAt:desc");
    params.set("pagination[pageSize]", "1000");
    params.set("fields[0]", "slug");
    params.set("fields[1]", "documentId");
    params.set("fields[2]", "updatedAt");

    const response = await fetchAPI<StrapiListResponse<StrapiSitemapRecord>>(
      `/cvs?${params.toString()}`,
      { next: { revalidate: 3600, tags: ["cv"] } },
    );

    return response.data
      .map((record) => {
        const r = unwrapStrapiRecord(record);
        if (!r.slug || !r.documentId) return null;
        return {
          url: siteUrl(`/jobs/${r.slug}-${r.documentId}`),
          lastModified: new Date(lastmod(r)),
          changeFrequency: "daily" as const,
          priority: 0.8 as const,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    return [];
  }
}

async function fetchBlogPages(): Promise<SitemapEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set("sort[0]", "publishedAt:desc");
    params.set("pagination[pageSize]", "100");
    params.set("fields[0]", "slug");
    params.set("fields[1]", "publishedAt");
    params.set("fields[2]", "updatedAt");

    const response = await fetchAPI<StrapiListResponse<StrapiSitemapRecord>>(
      `/blogs?${params.toString()}`,
      { next: { revalidate: 3600, tags: ["blog"] } },
    );

    return response.data
      .map((record) => {
        const r = unwrapStrapiRecord(record);
        if (!r.slug) return null;
        return {
          url: siteUrl(`/blog/${r.slug}`),
          lastModified: new Date(lastmod(r)),
          changeFrequency: "weekly" as const,
          priority: 0.6 as const,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    return [];
  }
}

async function fetchCategoryPages(): Promise<SitemapEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set("sort[0]", "title:asc");
    params.set("pagination[pageSize]", "100");
    params.set("populate", "*");

    const response = await fetchAPI<StrapiListResponse<StrapiSitemapRecord>>(
      `/categories?${params.toString()}`,
      { next: { revalidate: 3600, tags: ["categories"] } },
    );

    return response.data
      .map((record) => {
        const r = unwrapStrapiRecord(record);
        if (!r.slug) return null;
        return {
          url: siteUrl(`/categories/${r.slug}`),
          changeFrequency: "weekly" as const,
          priority: 0.6 as const,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    return [];
  }
}

async function fetchCompanyPages(): Promise<SitemapEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set("filters[isActive][$eq]", "true");
    params.set("sort[0]", "name:asc");
    params.set("pagination[pageSize]", "100");
    params.set("populate", "*");

    const response = await fetchAPI<StrapiListResponse<StrapiSitemapRecord>>(
      `/companies?${params.toString()}`,
      { next: { revalidate: 3600, tags: ["companies"] } },
    );

    return response.data
      .map((record) => {
        const r = unwrapStrapiRecord(record);
        if (!r.slug) return null;
        return {
          url: siteUrl(`/companies/${r.slug}`),
          lastModified: r.updatedAt ? new Date(r.updatedAt) : undefined,
          changeFrequency: "weekly" as const,
          priority: 0.5 as const,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  } catch {
    return [];
  }
}

// ===== Главная функция =====

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticPages, jobPages, blogPages, categoryPages, companyPages] =
    await Promise.all([
      Promise.resolve(
        STATIC_ROUTES.map((route) => ({
          url: siteUrl(route.path),
          changeFrequency: route.changeFrequency,
          priority: route.priority,
        })),
      ),
      fetchJobPages(),
      fetchBlogPages(),
      fetchCategoryPages(),
      fetchCompanyPages(),
    ]);

  return [...staticPages, ...jobPages, ...blogPages, ...categoryPages, ...companyPages];
}
