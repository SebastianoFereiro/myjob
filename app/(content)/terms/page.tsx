import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('terms');
  if (!page) {
    return { title: 'Пользовательское соглашение | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: page.SEO,
    fallbackTitle: page.title,
    fallbackDescription: 'Пользовательское соглашение MyJOB',
  });
}

export default async function TermsPage() {
  const page = await getPageBySlug('terms');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
