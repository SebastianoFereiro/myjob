import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('help');
  if (!page) {
    return { title: 'Помощь | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: page.SEO,
    fallbackTitle: page.title,
    fallbackDescription: 'Часто задаваемые вопросы и контакты поддержки MyJOB',
  });
}

export default async function HelpPage() {
  const page = await getPageBySlug('help');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
