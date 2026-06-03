import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { JobFiltersPanel } from "@/components/jobs/job-filters-panel";
import { JobList } from "@/components/jobs/job-list";
import { getCategoriesWithCounts } from "@/services/categories.service";
import type { EmploymentType, JobFilters } from "@/types/jobs";

export const metadata: Metadata = {
  title: "Вакансии | MyJOB",
  description:
    "Каталог вакансий MyJOB с фильтрацией по категории, городу и формату занятости.",
};

type JobsPageProps = {
  searchParams: Promise<{
    query?: string;
    location?: string;
    type?: string;
    category?: string;
    page?: string;
  }>;
};



function normalizePage(value?: string) {
  const page = value ? parseInt(value, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const filters: JobFilters = {
    query: params.query || "",
    location: params.location || "",
    type: (params.type || "") as EmploymentType | "",
    category: params.category || "",
    page: normalizePage(params.page),
  };
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container py-8">
            <div className="max-w-3xl">
             
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Каталог вакансий
              </h1>
              <p className="mt-3 text-muted-foreground">
                Листинг вакансий с быстрым поиском, категориями и фильтрами по формату работы.
              </p>
            </div>
          </div>
        </section>

        <section className="container py-6 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            <JobFiltersPanel filters={filters} categories={categories} />
            <div className="min-w-0">
              <JobList filters={filters} basePath="/jobs" contained={false} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
