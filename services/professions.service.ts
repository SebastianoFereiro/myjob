import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
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
  count?: number;
};

const CATEGORY_ENDPOINT = "/categories";

const REVALIDATE_SECONDS = 1800; // 30 min

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

function mapStrapiCategory(record: StrapiCategoryRecord): JobCategory {
  const name = record.name || record.title || "Профессия";
  return {
    slug: record.slug || slugify(name),
    name,
    description: record.description,
    imageUrl: resolveMediaURL(record.image),
    count: record.count ?? 0,
  };
}

export async function getProfessions(): Promise<JobCategory[]> {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL && !process.env.STRAPI_URL) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.set("populate", "*");
    params.set("sort[0]", "name:asc");

    const response = await fetchAPI<StrapiListResponse<StrapiCategoryRecord>>(
      `${CATEGORY_ENDPOINT}?${params.toString()}`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: ["professions"],
        },
      },
    );

    return response.data
      .map((record) => mapStrapiCategory(unwrapStrapiRecord(record)))
      .filter((category) => Boolean(category.slug && category.name));
  } catch {
    return [];
  }
}
