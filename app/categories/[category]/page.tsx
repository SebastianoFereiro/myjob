import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { getCategories, getCategoryBySlug } from '@/services/categories.service';
import { JobList } from '@/components/jobs/job-list';
import type { EmploymentType, JobFilters } from '@/types/jobs';
import Header from '@/components/header';
import { navigationItems } from '@/app/data/navigation';
import { Footer } from '@/components/footer';
import { extractSeoMetadata } from '@/lib/extract-seo';
import { PageBlocks } from '@/components/page-blocks';
import { markdownComponents } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    query?: string;
    location?: string;
    type?: string;
    level?: string;
    experience?: string;
    education?: string;
    position?: string;
    page?: string;
  }>;
};

function normalizePage(value?: string) {
  const page = value ? parseInt(value, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

async function getCategoryName(categorySlug: string): Promise<string | null> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  return category?.name || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const [categoryData, categoryName] = await Promise.all([
    getCategoryBySlug(category),
    getCategoryName(category),
  ]);
  return extractSeoMetadata({
    SEO: categoryData?.SEO,
    fallbackTitle: categoryName ? `${categoryName} - Резюме и вакансии` : 'Категория не найдена',
    fallbackDescription: categoryName
      ? `Профессионалы и вакансии в категории "${categoryName}". Найди свою идеальную работу на MyJOB.`
      : undefined,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;

  const [categoryName, categoryData] = await Promise.all([
    getCategoryName(category),
    getCategoryBySlug(category),
  ]);

  if (!categoryName) {
    notFound();
  }

  const filters: JobFilters = {
    category,
    query: sp.query || '',
    location: sp.location || '',
    type: (sp.type || '') as EmploymentType | '',
    level: sp.level || '',
    experience: sp.experience || '',
    education: sp.education || '',
    position: sp.position || '',
    page: normalizePage(sp.page),
  };

  const blocks = categoryData?.blocks;
  const text = categoryData?.text;

  return (
    <>
      <Header navigationData={navigationItems} />
      <main className="min-h-screen bg-background">
        {blocks && blocks.length > 0 && <PageBlocks blocks={blocks} />}

        <JobList filters={filters} basePath="/categories" contained={true} categorySlug={category} />
        {text && (
          <section className="w-full py-12">
            <div className="mx-auto max-w-3xl px-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {text}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
