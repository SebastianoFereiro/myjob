import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('privacy');
  if (!page) {
    return { title: 'Политика конфиденциальности | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: page.SEO,
    fallbackTitle: page.title,
    fallbackDescription: 'Политика конфиденциальности MyJOB',
  });
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
