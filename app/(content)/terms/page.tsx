import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение | MyJOB',
  description: 'Пользовательское соглашение MyJOB',
};

export default async function TermsPage() {
  const page = await getPageBySlug('terms');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
