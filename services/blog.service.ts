import { fetchAPI, getStrapiMediaURL } from "@/lib/strapi-client";
import {
  type StrapiListResponse,
  unwrapStrapiRecord,
} from "@/lib/strapi-record";
import { type BlogArticle, FALLBACK_IMAGE_URL } from "@/types/blog";
import type { SeoMetadata } from '@/types/seo';

type StrapiBlogRecord = {
  id?: number | string;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  author?: string;
  images?: Array<{
    id: number;
    url?: string;
    alternativeText?: string | null;
    formats?: Record<string, unknown>;
  }>;
  publishedAt?: string;
  createdAt?: string;
  SEO?: SeoMetadata | null;
};

const BLOG_ENDPOINT = "/blogs";

function resolveImages(
  images?: StrapiBlogRecord["images"],
): { url: string; alt: string }[] {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [{ url: FALLBACK_IMAGE_URL, alt: "Изображение недоступно" }];
  }

  return images.map((img) => ({
    url: getStrapiMediaURL(img.url) || FALLBACK_IMAGE_URL,
    alt: img.alternativeText || "Иллюстрация статьи",
  }));
}

function mapStrapiBlog(record: StrapiBlogRecord): BlogArticle {
  const resolvedImages = resolveImages(record.images);
  const id = String(
    record.documentId || record.id || record.slug || record.title,
  );

  return {
    id,
    slug: record.slug || id,
    title: record.title || "Статья",
    excerpt: record.excerpt || null,
    content: record.content || "",
    author: record.author || "MyJOB",
    coverUrl: resolvedImages[0].url,
    coverAlt: resolvedImages[0].alt,
    images: resolvedImages.map((img) => img.url),
    publishedAt:
      record.publishedAt || record.createdAt || new Date().toISOString(),
    SEO: record.SEO ?? null,
  };
}

export async function getBlogArticles(limit?: number) {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("sort[0]", "publishedAt:desc");
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", String(limit || 24));

  const response = await fetchAPI<StrapiListResponse<StrapiBlogRecord>>(
    `${BLOG_ENDPOINT}?${params.toString()}`,
    { next: { revalidate: 300, tags: ["blog"] } },
  );

  return response.data
    .map((record) => mapStrapiBlog(unwrapStrapiRecord(record)))
    .filter((article) => Boolean(article.slug && article.title));
}

export async function getBlogArticleBySlug(slug: string) {
  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("filters[slug][$eq]", slug);
  params.set("pagination[pageSize]", "1");

  const response = await fetchAPI<StrapiListResponse<StrapiBlogRecord>>(
    `${BLOG_ENDPOINT}?${params.toString()}`,
    { next: { revalidate: 300, tags: ["blog"] } },
  );

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return mapStrapiBlog(unwrapStrapiRecord(response.data[0]));
}
