import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
    company?: string;
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

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  // Перенаправляем /jobs?category=X на каноническую страницу /categories/X
  if (params.category) {
    const targetParams = new URLSearchParams();
    if (params.query) targetParams.set("query", params.query);
    if (params.location) targetParams.set("location", params.location);
    if (params.type) targetParams.set("type", params.type);
    if (params.company) targetParams.set("company", params.company);
    if (params.level) targetParams.set("level", params.level);
    if (params.experience) targetParams.set("experience", params.experience);
    if (params.education) targetParams.set("education", params.education);
    if (params.position) targetParams.set("position", params.position);
    if (params.page) targetParams.set("page", params.page);
    const qs = targetParams.toString();
    redirect(`/categories/${params.category}${qs ? `?${qs}` : ""}`);
  }

  const filters: JobFilters = {
    query: params.query || "",
    location: params.location || "",
    type: (params.type || "") as EmploymentType | "",
    category: params.category || "",
    company: params.company || "",
    level: params.level || "",
    experience: params.experience || "",
    education: params.education || "",
    position: params.position || "",
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
