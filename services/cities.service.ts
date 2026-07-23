import { getStrapiURL } from "@/lib/strapi-client";
import { unwrapStrapiRecord } from "@/lib/strapi-record";
import type { SeoMetadata } from "@/types/seo";
import type { City, CityRef } from "@/types/strapi-collections";

type StrapiCityRecord = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  description?: string;
  text?: string;
  SEO?: SeoMetadata | null;
};

function mapStrapiCity(record: StrapiCityRecord): CityRef {
  return {
    id: Number(record.id ?? 0),
    documentId: record.documentId ?? "",
    title: record.title ?? "",
    slug: record.slug ?? "",
    description: record.description ?? undefined,
  };
}

export async function getCities(): Promise<CityRef[]> {
  try {
    const strapiUrl = getStrapiURL();
    const token = process.env.STRAPI_API_TOKEN;
    const params = new URLSearchParams();
    params.set("pagination[pageSize]", "100");
    params.set("sort[0]", "title:asc");

    const res = await fetch(`${strapiUrl}/api/cities?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 14400 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const data = json?.data;

    if (!data || !Array.isArray(data)) return [];

    return data.map((record: Record<string, unknown>) => {
      const unwrapped = unwrapStrapiRecord(record);
      return mapStrapiCity(unwrapped as unknown as StrapiCityRecord);
    });
  } catch {
    return [];
  }
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  try {
    const strapiUrl = getStrapiURL();
    const token = process.env.STRAPI_API_TOKEN;
    const params = new URLSearchParams();
    params.set("filters[slug][$eq]", slug);
    params.set("populate", "*");
    params.set("pagination[pageSize]", "1");

    const res = await fetch(`${strapiUrl}/api/cities?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 14400 },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data;

    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const record = unwrapStrapiRecord(data[0] as Record<string, unknown>);

    return {
      id: Number(record.id ?? 0),
      documentId: String(record.documentId ?? ""),
      title: String(record.title ?? ""),
      slug: String(record.slug ?? ""),
      description: (record.description as string) ?? null,
      text: (record.text as string) ?? null,
      SEO: (record.SEO as SeoMetadata) ?? null,
    };
  } catch {
    return null;
  }
}

export async function getCitiesWithCounts(): Promise<CityRef[]> {
  return getCities();
}
