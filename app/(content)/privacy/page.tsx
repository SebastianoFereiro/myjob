import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';
import { withAutoCanonical } from '@/lib/canonical';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('privacy');
  if (!page) {
    return { title: 'Политика конфиденциальности | MyJOB' };
  }

  return withAutoCanonical(
    extractSeoMetadata({
      SEO: page.SEO,
      fallbackTitle: page.title,
      fallbackDescription: 'Политика конфиденциальности MyJOB',
    }),
    '/privacy',
  );
}

export default async function PrivacyPage() {
  const page = await getPageBySlug('privacy');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
