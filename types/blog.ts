import type { SeoMetadata } from '@/types/seo';

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string;
  coverUrl: string;
  coverAlt: string;
  images: string[];
  publishedAt: string;
  SEO?: SeoMetadata | null;
}

export const FALLBACK_IMAGE_URL =
  "https://via.placeholder.com/1200x800?text=Image+Not+Found";
