import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Header from '@/components/header';
import { Footer } from '@/components/footer';
import { JobList } from '@/components/jobs/job-list';
import { extractSeoMetadata } from '@/lib/extract-seo';
import { getCityBySlug } from '@/services/cities.service';
import type { EmploymentType, JobFilters } from '@/types/jobs';
import { markdownComponents } from '@/lib/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { navigationItems } from '@/app/data/navigation';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    query?: string;
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);

  if (!city) {
    return { title: 'Город не найден | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: city.SEO,
    fallbackTitle: `Работа в ${city.title}`,
    fallbackDescription: city.description || `Вакансии и работа в городе ${city.title}. Поиск работы в ${city.title} на MyJOB.`,
    siteName: 'MyJOB',
  });
}

export default async function CityPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const city = await getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const filters: JobFilters = {
    city: slug,
    query: sp.query || '',
    type: (sp.type || '') as EmploymentType | '',
    level: sp.level || '',
    experience: sp.experience || '',
    education: sp.education || '',
    position: sp.position || '',
    page: normalizePage(sp.page),
  };

  return (
    <>
      <Header navigationData={navigationItems} />
      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container py-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Работа в {city.title}
              </h1>
              {city.description && (
                <p className="mt-3 text-muted-foreground">
                  {city.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <JobList
          filters={filters}
          basePath="/cities"
          contained={true}
          citySlug={slug}
        />

        {city.text && (
          <section className="w-full py-12">
            <div className="mx-auto max-w-4xl px-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {city.text}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
