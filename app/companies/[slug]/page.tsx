import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Globe,
  Users,
  BriefcaseBusiness,
  ArrowUpRight,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import Header from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { markdownComponents } from '@/lib/markdown';
import { navigationItems } from '@/app/data/navigation';
import { getCompanyBySlug } from '@/services/companies.service';
import { getAllJobs } from '@/services/jobs.service';
import { extractSeoMetadata } from '@/lib/extract-seo';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: 'Компания не найдена | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: company.SEO,
    fallbackTitle: company.name,
    fallbackDescription: company.description || `Вакансии компании ${company.name}`,
    fallbackImage: company.logoUrl,
  });
}

export default async function CompanyDetailsPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const allJobs = await getAllJobs();
  const companyJobs = allJobs.filter((job) => job.company.slug === company.slug);

  return (
    <>
      <Header navigationData={navigationItems} />

      <main className="min-h-screen bg-[#fafafa]">
        <div className="container py-4">
          <Button variant="ghost" className="gap-2 px-0" asChild>
            <Link href="/companies">
              <ArrowLeft className="size-4" />К списку компаний
            </Link>
          </Button>
        </div>

        {/* HERO */}
        <section className="border-b bg-white">
          <div className="container py-6 md:py-10">
            <div className="rounded-[32px] border bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                {/* LEFT */}
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border bg-white shadow-sm">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={company.name}
                        width={56}
                        height={56}
                        className="h-14 w-14 object-contain"
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {company.industry && (
                        <div className="inline-flex rounded-full border bg-zinc-100 px-3 py-1 text-xs font-medium">
                          {company.industry}
                        </div>
                      )}
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      {company.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {company.location && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                          <MapPin className="h-4 w-4" />
                          {company.location}
                        </div>
                      )}

                      {company.size && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                          <Users className="h-4 w-4" />
                          {company.size}
                        </div>
                      )}

                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {companyJobs.length} вакансий
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION CARD */}
                <div className="w-full rounded-[28px] bg-black p-6 text-white shadow-2xl xl:max-w-[320px]">
                  <p className="text-sm text-zinc-400">Открытых вакансий</p>
                  <h2 className="mt-2 text-5xl font-bold">{companyJobs.length}</h2>
                  {companyJobs.length > 0 && (
                    <p className="mt-3 text-sm text-zinc-400">
                      Присоединяйтесь к команде {company.name}
                    </p>
                  )}
                  <Link
                    href={`/jobs?company=${company.slug}`}
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]"
                  >
                    Смотреть вакансии
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="container py-6 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {/* MAIN */}
            <div className="space-y-6">
              {/* ABOUT */}
              {company.description && (
                <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">О компании</h2>
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {company.description}
                  </ReactMarkdown>
                </div>
              )}

              {/* JOBS */}
              {companyJobs.length > 0 && (
                <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-8">
                  <div className="mb-6 flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">Открытые вакансии</h2>
                    <Link
                      href={`/jobs?company=${company.slug}`}
                      className="text-sm font-medium text-primary"
                    >
                      Смотреть все
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {companyJobs.slice(0, 10).map((job) => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.slug}-${job.id}`}
                        className="group block rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold transition group-hover:text-primary">
                              {job.title}
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                              {(job.salaryFrom || job.salaryTo) && (
                                <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                                  {job.salaryFrom && job.salaryTo
                                    ? `${job.salaryFrom}-${job.salaryTo} ${job.currency}`
                                    : job.salaryFrom
                                      ? `от ${job.salaryFrom} ${job.currency}`
                                      : `до ${job.salaryTo} ${job.currency}`}
                                </div>
                              )}
                              <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                                {job.city ? `${job.city},` : ''} {job.location}
                              </div>
                              <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                                {job.employmentType === 'full-time'
                                  ? 'Полная занятость'
                                  : job.employmentType === 'part-time'
                                    ? 'Частичная занятость'
                                    : job.employmentType === 'contract'
                                      ? 'Проектная работа'
                                      : job.employmentType === 'internship'
                                        ? 'Стажировка'
                                        : 'Удаленно'}
                              </div>
                            </div>
                          </div>
                          <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-7">
                <h3 className="mb-5 text-xl font-semibold">Информация</h3>
                <div className="space-y-5">
                  {company.siteUrl && (
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Веб-сайт</p>
                        <a
                          href={company.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          {new URL(company.siteUrl).hostname}
                        </a>
                      </div>
                    </div>
                  )}
                  {company.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Локация</p>
                        <p className="font-medium">{company.location}</p>
                      </div>
                    </div>
                  )}
                  {company.size && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Размер компании</p>
                        <p className="font-medium">{company.size}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {companyJobs.length > 0 && (
                <div className="rounded-[32px] bg-black p-6 text-white shadow-xl md:p-7">
                  <h3 className="text-2xl font-semibold">Хотите работать здесь?</h3>
                  <p className="mt-3 text-sm text-zinc-400">
                    Изучите вакансии компании и отправьте отклик.
                  </p>
                  <Link
                    href={`/jobs?company=${company.slug}`}
                    className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]"
                  >
                    Перейти к вакансиям
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
