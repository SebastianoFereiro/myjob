import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  Phone,
  User,
  Wallet,
} from 'lucide-react';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { ResumeDetails } from '@/components/resume/resume-details';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPublishedResumeByDocumentId } from '@/services/resume.service';
import { getOptionLabel, RESUME_EMPLOYMENT_OPTIONS } from '@/lib/enum-options';
import type { Resume } from '@/types/resume';

const UUID_RE = /^([\w-]+)-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function parseSlugId(rawSlug: string) {
  const match = rawSlug.match(UUID_RE);
  if (match) return { id: match[2], slug: match[1] };
  const parts = rawSlug.split('-');
  return { id: parts.pop()!, slug: parts.join('-') };
}

function formatSalary(resume: Resume): string {
  return resume.salary
    ? `${resume.salary.toLocaleString('ru-RU')} ${resume.currency}`
    : 'По договоренности';
}

function formatDate(date?: string): string {
  if (!date) return 'Не указано';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function getContactHref(resume: Resume): string | null {
  if (resume.phone) return `tel:${resume.phone}`;
  if (resume.email) return `mailto:${resume.email}`;
  return null;
}

type ResumeDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ResumeDetailsPageProps): Promise<Metadata> {
  const rawSlug = (await params).slug;
  const { id } = parseSlugId(rawSlug);
  const resume = await getPublishedResumeByDocumentId(id);

  if (!resume) {
    return { title: 'Резюме не найдено | MyJOB', robots: { index: false, follow: false } };
  }

  return {
    title: `${resume.position || resume.title} | MyJOB`,
    description:
      `Резюме: ${resume.position || resume.title}. ${resume.location || ''} ${formatSalary(resume)}`.trim(),
    robots: { index: false, follow: false },
  };
}

export default async function ResumeDetailPage({ params }: ResumeDetailsPageProps) {
  const rawSlug = (await params).slug;
  const { id } = parseSlugId(rawSlug);
  const resume = await getPublishedResumeByDocumentId(id);

  if (!resume) {
    notFound();
  }

  const fullName =
    [resume.firstName, resume.lastName].filter(Boolean).join(' ') || resume.userEmail;
  const contactHref = getContactHref(resume);

  return (
    <>
      <Header />

      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container py-6 md:py-10">
            <Button variant="ghost" className="mb-5 gap-2 px-0" asChild>
              <Link href="/resumes">
                <ArrowLeft className="size-4" />К списку резюме
              </Link>
            </Button>

            <div className="rounded-lg border bg-background p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <User className="size-9 text-muted-foreground" />
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{fullName}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      {resume.position || resume.title || 'Резюме'}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {resume.location && (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="size-4" />
                          {resume.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="size-4" />
                        {getOptionLabel(RESUME_EMPLOYMENT_OPTIONS, resume.employmentType)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="size-4" />
                        Обновлено {formatDate(resume.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-lg border bg-foreground p-6 text-background shadow-sm xl:max-w-[320px]">
                  <div className="mb-4 flex items-center gap-2 text-background/70">
                    <Wallet className="size-4" />
                    Зарплатные ожидания
                  </div>
                  <h2 className="text-3xl font-bold">{formatSalary(resume)}</h2>
                  {contactHref ? (
                    <Button className="mt-6 w-full" variant="secondary" asChild>
                      <a href={contactHref} target="_blank" rel="noopener noreferrer">
                        Связаться
                      </a>
                    </Button>
                  ) : (
                    <Button className="mt-6 w-full" variant="secondary" disabled>
                      Связаться
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-lg border bg-background p-5 shadow-sm md:p-8">
              <ResumeDetails resume={resume} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border bg-background p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Информация</h2>
                <div className="mt-5 space-y-4 text-sm">
                  {resume.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Город</p>
                        <p className="font-medium">{resume.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <BriefcaseBusiness className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Тип занятости</p>
                      <p className="font-medium">
                        {getOptionLabel(RESUME_EMPLOYMENT_OPTIONS, resume.employmentType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Зарплата</p>
                      <p className="font-medium">{formatSalary(resume)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Обновлено</p>
                      <p className="font-medium">{formatDate(resume.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {(resume.phone || resume.email) && (
                  <div className="mt-5 space-y-2 border-t pt-5">
                    {resume.phone && (
                      <a
                        href={`tel:${resume.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <Phone className="size-4" />
                        {resume.phone}
                      </a>
                    )}
                    {resume.email && (
                      <a
                        href={`mailto:${resume.email}`}
                        className="flex items-center gap-2 break-all text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        <Mail className="size-4 shrink-0" />
                        {resume.email}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
