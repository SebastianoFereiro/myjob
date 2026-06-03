import { jobCategories as fallbackCategories } from "@/app/data/job-categories";
import { getStrapiMediaURL, fetchAPI } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import { getCategoryCounts } from "@/services/jobs.service";
import type { JobCategory } from "@/types/jobs";

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
};

const CATEGORY_ENDPOINT = "/categories";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveMediaURL(media?: StrapiMediaField) {
  if (typeof media === "string") {
    return getStrapiMediaURL(media);
  }

  return getStrapiMediaURL(
    media?.url || media?.data?.attributes?.url || undefined,
  );
}

function  mapStrapiCategory(record: StrapiCategoryRecord): JobCategory {
  const name = record.name || record.title || "Категория";

  return {
    slug: record.slug || slugify(name),
    name,
    description: record.description,
    imageUrl: resolveMediaURL(record.image),
  };
}

export async function getCategories() {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.set("populate", "*");
    // params.set("sort[0]", "title:asc");
 
    const response = await fetchAPI<StrapiListResponse<StrapiCategoryRecord>>(
      `${CATEGORY_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ["categories"] } },
    );
   
    const categories = response.data
      .map((record) => mapStrapiCategory(unwrapStrapiRecord(record)))
      .filter((category) => Boolean(category.slug && category.name));
    console.log('categories', categories)
    return  categories 
  } catch {
    console.log('Failed to fetch categories from Strapi, using fallback data.');
    return [];
  }
}

export async function getCategoriesWithCounts() {
  const categories = await getCategories();
  return getCategoryCounts(categories);
}

