import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { extractSeoMetadata } from '@/lib/extract-seo';
import { PremiumServicesDescription } from '@/components/premium-case';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('pricing');
  if (!page) {
    return { title: 'Тарифы | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: page.SEO,
    fallbackTitle: page.title,
    fallbackDescription: 'Тарифные планы MyJOB для работодателей',
  });
}

export default async function PricingPage() {
  const page = await getPageBySlug('pricing');
  if (!page) notFound();

  return (
    <main>
      <PremiumServicesDescription />
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
