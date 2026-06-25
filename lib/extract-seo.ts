import { getStrapiMediaURL } from '@/lib/strapi-client';
import type { Metadata } from 'next';
import type { SeoMetadata } from '@/types/seo';

export interface SeoInput {
  SEO?: SeoMetadata | null;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackImage?: string;
  siteName?: string;
}

export function extractSeoMetadata(input: SeoInput): Metadata {
  const {
    SEO,
    fallbackTitle,
    fallbackDescription,
    fallbackImage,
    siteName = 'MyJOB',
  } = input;

  const title = SEO?.metaTitle || fallbackTitle || siteName;
  const description = SEO?.metaDescription || fallbackDescription || '';
  const og = SEO?.openGraph;

  const imageUrl =
    resolveMediaUrl(SEO?.metaImage) ||
    resolveMediaUrl(og?.ogImage) ||
    fallbackImage;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    ...(SEO?.keywords && { keywords: SEO.keywords }),
    ...(SEO?.metaRobots && { robots: SEO.metaRobots }),
    ...(SEO?.metaViewport && { viewport: SEO.metaViewport }),
    ...(SEO?.canonicalURL && {
      alternates: { canonical: SEO.canonicalURL },
    }),
    openGraph: {
      title: og?.ogTitle || title,
      description: og?.ogDescription || description,
      ...(og?.ogUrl && { url: og.ogUrl }),
      type: (og?.ogType as 'website' | 'article' | 'book' | 'profile') || 'website',
      ...(imageUrl && { images: [{ url: imageUrl }] }),
      siteName,
    },
  };

  if (SEO?.structuredData && typeof SEO.structuredData === 'object') {
    metadata.other = {
      'application/ld+json': JSON.stringify(SEO.structuredData),
    };
  }

  return metadata;
}

function resolveMediaUrl(
  media?: { url?: string; alternativeText?: string | null } | null,
): string | undefined {
  if (!media?.url) return undefined;
  return getStrapiMediaURL(media.url);
}
