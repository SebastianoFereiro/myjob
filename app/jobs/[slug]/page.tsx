import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Wallet,
} from "lucide-react";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { JobDetails } from "@/components/jobs/job-details";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJobBySlug } from "@/services/jobs.service";
import type { EmploymentType, Job } from "@/types/jobs";

type JobDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const employmentLabels: Record<EmploymentType, string> = {
  "full-time": "Полная занятость",
  "part-time": "Частичная занятость",
  contract: "Проектная работа",
  internship: "Стажировка",
  remote: "Удаленно",
};

function formatSalary(job: Job) {
  if (!job.salaryFrom && !job.salaryTo) {
    return "По договоренности";
  }

  if (job.salaryFrom && job.salaryTo) {
    return `${job.salaryFrom}-${job.salaryTo} ${job.currency}`;
  }

  return job.salaryFrom
    ? `от ${job.salaryFrom} ${job.currency}`
    : `до ${job.salaryTo} ${job.currency}`;
}

function formatDate(date?: string) {
  if (!date) {
    return "Не указано";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return {
      title: "Вакансия не найдена | MyJOB",
    };
  }

  return {
    title: `${job.title} | MyJOB`,
    description: job.description || `Вакансия ${job.title} в ${job.company.name}`,
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container py-6 md:py-10">
            <Button variant="ghost" className="mb-5 gap-2 px-0" asChild>
              <Link href="/jobs">
                <ArrowLeft className="size-4" />
                К списку вакансий
              </Link>
            </Button>

            <div className="rounded-lg border bg-background p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    {job.company.logoUrl ? (
                      <img
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <Building2 className="size-9 text-muted-foreground" />
                    )}
                  </div>

                  <div>
                    <Badge variant="secondary" className="mb-3">
                      {job.category.name}
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      {job.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <Building2 className="size-4" />
                        {job.company.name}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <BriefcaseBusiness className="size-4" />
                        {employmentLabels[job.employmentType]}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="size-4" />
                        {formatDate(job.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full rounded-lg border bg-foreground p-6 text-background shadow-sm xl:max-w-[320px]">
                  <div className="mb-4 flex items-center gap-2 text-background/70">
                    <Wallet className="size-4" />
                    Зарплата
                  </div>
                  <h2 className="text-3xl font-bold">{formatSalary(job)}</h2>
                  <Button className="mt-6 w-full" variant="secondary">
                    Откликнуться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-6 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="rounded-lg border bg-background p-5 shadow-sm md:p-8">
              <JobDetails job={job} />
            </div>

            <aside className="space-y-6">
              <div className="rounded-lg border bg-background p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Информация</h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Дедлайн</p>
                      <p className="font-medium">{formatDate(job.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BriefcaseBusiness className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Тип занятости</p>
                      <p className="font-medium">
                        {employmentLabels[job.employmentType]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 size-5 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Зарплата</p>
                      <p className="font-medium">{formatSalary(job)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
