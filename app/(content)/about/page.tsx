import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('about');
  if (!page) {
    return { title: 'О проекте | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: page.SEO,
    fallbackTitle: page.title,
    fallbackDescription: 'MyJOB — платформа для поиска работы и сотрудников в Беларуси',
  });
}

export default async function AboutPage() {
  const page = await getPageBySlug('about');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
