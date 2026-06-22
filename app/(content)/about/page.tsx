import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О проекте | MyJOB',
  description: 'MyJOB — платформа для поиска работы и сотрудников в Беларуси',
};

export default async function AboutPage() {
  const page = await getPageBySlug('about');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
