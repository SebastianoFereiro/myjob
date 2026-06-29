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
  seo?: SeoMetadata | null;
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
    SEO: record.seo ?? null,
  };
}

export type BlogListResult = {
  articles: BlogArticle[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export async function getBlogArticles(
  page = 1,
  pageSize = 20,
): Promise<BlogListResult> {
  try {
    const params = new URLSearchParams();
    params.set("populate", "*");
    // params.set("populate[0]", "images");
    // params.set("populate[1]", "seo");
    params.set("sort[0]", "publishedAt:desc");
    params.set("pagination[page]", String(page));
    params.set("pagination[pageSize]", String(pageSize));

  
    const response = await fetchAPI<StrapiListResponse<StrapiBlogRecord>>(
      `${BLOG_ENDPOINT}?${params.toString()}`,
      { cache: "no-store" },
    );

    const articles = response.data
      .map((record) => mapStrapiBlog(unwrapStrapiRecord(record)))
      .filter((article) => Boolean(article.slug && article.title));

    return {
      articles,
      pagination: response.meta?.pagination || {
        page: 1,
        pageSize,
        pageCount: 0,
        total: 0,
      },
    };
  } catch (err) {
    console.log("[blog] Failed to fetch blog articles:", err);
    return {
      articles: [],
      pagination: { page: 1, pageSize, pageCount: 0, total: 0 },
    };
  }
}

export async function getBlogArticleBySlug(slug: string) {
  try {
    const params = new URLSearchParams();
    params.set("populate[0]", "images");
    params.set("populate[1]", "seo");
    params.set("filters[slug][$eq]", slug);
    params.set("pagination[pageSize]", "1");

    const response = await fetchAPI<StrapiListResponse<StrapiBlogRecord>>(
      `${BLOG_ENDPOINT}?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return mapStrapiBlog(unwrapStrapiRecord(response.data[0]));
  } catch {
    console.log(`Failed to fetch blog article by slug "${slug}" from Strapi.`);
    return null;
  }
}
