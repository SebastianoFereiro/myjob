import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | MyJOB',
  description: 'Политика конфиденциальности MyJOB',
};

export default async function PrivacyPage() {
  const page = await getPageBySlug('privacy');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
