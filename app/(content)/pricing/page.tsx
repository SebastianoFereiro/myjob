import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Тарифы | MyJOB',
  description: 'Тарифные планы MyJOB для работодателей',
};

export default async function PricingPage() {
  const page = await getPageBySlug('pricing');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
