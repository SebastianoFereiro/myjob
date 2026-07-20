import { getStrapiMediaURL, fetchAPI } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import { getCategoryCounts } from "@/services/jobs.service";
import type { JobCategory } from "@/types/jobs";
import type { Category, PageBlock } from "@/types/strapi-collections";
import type { SeoMetadata } from "@/types/seo";

type StrapiMediaField =
  | string
  | {
      url?: string;
      data?: {
        attributes?: {
          url?: string;
        };
      };
    };

type StrapiCategoryRecord = {
  id?: string | number;
  documentId?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: StrapiMediaField;
  count?: number;
  SEO?: SeoMetadata | null;
  seo?: SeoMetadata | null;
  blocks?: Record<string, unknown>[];
  text?: string | null;
};

const CATEGORY_ENDPOINT = "/categories";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function getImageUrl(image?: StrapiMediaField): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return getStrapiMediaURL(image);
  return getStrapiMediaURL(image.url);
}

function mapStrapiCategory(record: StrapiCategoryRecord): JobCategory {
  const name = record.name || record.title || "Категория";

  return {
    slug: record.slug || slugify(name),
    name,
    description: record.description || "",
    imageUrl: getImageUrl(record.image),
    count: record.count ?? 0,
  };
}

function extractSeo(
  value: unknown,
): SeoMetadata | null {
  if (!value) return null;
  // Strapi 5 может вернуть SEO как массив [{...}] (repeatable component)
  if (Array.isArray(value)) {
    return (value[0] as SeoMetadata) ?? null;
  }
  return value as SeoMetadata;
}

function mapFullCategory(raw: Record<string, unknown>): Category {
  const record = unwrapStrapiRecord(raw);
  const blocks = (record.blocks as Record<string, unknown>[]) ?? [];
  const seo = extractSeo(record.SEO ?? record.seo ?? null);

  return {
    id: Number(record.id),
    documentId: String(record.documentId ?? ""),
    name: String(record.name ?? record.title ?? ""),
    slug: String(record.slug ?? ""),
    description: (record.description as string) ?? null,
    icon: (record.icon as string) ?? null,
    count: (record.count as number) ?? 0,
    SEO: seo,
    blocks: blocks.map((b) => ({
      ...b,
      id: String(b.id),
      __component: String(b.__component),
    })) as PageBlock[],
    text: (record.text as string) ?? null,
  };
}

export async function getCategories() {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.set("populate", "*");

    const response = await fetchAPI<StrapiListResponse<StrapiCategoryRecord>>(
      `${CATEGORY_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["categories"] } },
    );
    const categories = response.data
      .map((record) => mapStrapiCategory(unwrapStrapiRecord(record)))
      .sort((a, b) => {
        if (a.imageUrl && !b.imageUrl) return -1;
        if (!a.imageUrl && b.imageUrl) return 1;
        return 0;
      });

    return categories;
  } catch {
    console.log("Failed to fetch categories from Strapi, using fallback data.");
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  try {
    const params = new URLSearchParams();
    params.set("filters[slug][$eq]", slug);
    params.set("populate", "*");
    params.set("pagination[pageSize]", "1");

    const response = await fetchAPI<StrapiListResponse<StrapiCategoryRecord>>(
      `${CATEGORY_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 60, tags: [`category-${slug}`] } },
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return mapFullCategory(
      response.data[0] as Record<string, unknown>,
    );
  } catch (err) {
    console.log(
      `[categories] Failed to fetch category by slug "${slug}":`,
      err,
    );
    return null;
  }
}

export async function getCategoriesWithCounts() {
  const categories = await getCategories();
  return getCategoryCounts(categories);
}
