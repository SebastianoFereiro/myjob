import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Header from '@/components/header';
import { Footer } from '@/components/footer';
import { JobList } from '@/components/jobs/job-list';
import { extractSeoMetadata } from '@/lib/extract-seo';
import { withAutoCanonical } from '@/lib/canonical';
import { getCitiesByRegion } from '@/services/cities.service';
import { getRegionBySlug } from '@/services/regions.service';
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const region = await getRegionBySlug(slug);

  if (!region) {
    return { title: 'Регион не найден | MyJOB' };
  }

  return withAutoCanonical(
    extractSeoMetadata({
      SEO: region.SEO,
      fallbackTitle: `Работа в ${region.title}`,
      fallbackDescription:
        region.description ||
        `Вакансии и работа в регионе ${region.title}. Поиск работы в ${region.title} на MyJOB.`,
      siteName: 'MyJOB',
    }),
    `/regions/${slug}`,
    sp,
    ['query', 'type', 'level', 'experience', 'education', 'position', 'page'],
  );
}

export default async function RegionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const region = await getRegionBySlug(slug);

  if (!region) {
    notFound();
  }

  const cities = await getCitiesByRegion(slug);

  const filters: JobFilters = {
    region: slug,
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
          <div className="container px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {region.description && (
                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {region.description}
                </h1>
              )}
              {region.title && <p className="mt-3 text-muted-foreground">{region.title}</p>}
            </div>
          </div>
        </section>

        <JobList filters={filters} basePath="/regions" contained={true} regionSlug={slug} />

        {cities.length > 0 && (
          <section className="border-b bg-background">
            <div className="container px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Города региона:</span>
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="inline-flex items-center rounded-full border bg-zinc-100 px-3 py-1 text-xs font-medium transition hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {city.title}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {region.text && (
          <section className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl px-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {region.text}
              </ReactMarkdown>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
