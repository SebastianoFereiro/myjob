import { getPageBySlug } from '@/services/pages.service';
import { PageBlocks } from '@/components/page-blocks';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Помощь | MyJOB',
  description: 'Часто задаваемые вопросы и контакты поддержки MyJOB',
};

export default async function HelpPage() {
  const page = await getPageBySlug('help');
  if (!page) notFound();

  return (
    <main>
      <PageBlocks blocks={page.blocks} />
    </main>
  );
}
