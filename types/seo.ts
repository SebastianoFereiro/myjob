export interface OpenGraph {
  id?: number;
  ogTitle: string;
  ogDescription: string;
  ogImage?: StrapiMedia | null;
  ogUrl?: string;
  ogType?: string;
}

export interface SeoMetadata {
  id?: number;
  metaTitle: string;
  metaDescription: string;
  metaImage?: StrapiMedia | null;
  openGraph?: OpenGraph | null;
  keywords?: string | null;
  metaRobots?: string | null;
  metaViewport?: string | null;
  canonicalURL?: string | null;
  structuredData?: Record<string, unknown> | null;
}

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export type WithSeo<T> = T & { SEO?: SeoMetadata | null };
