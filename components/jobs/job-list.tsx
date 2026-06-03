import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoriesWithCounts } from "@/services/categories.service";
import { getJobs } from "@/services/jobs.service";
import type { JobFilters } from "@/types/jobs";

type JobListProps = {
  filters: JobFilters;
  basePath?: string;
  contained?: boolean;
};

function pageHref(filters: JobFilters, page: number, basePath: string) {
  const params = new URLSearchParams();

  if (filters.query) params.set("query", filters.query);
  if (filters.location) params.set("location", filters.location);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `${basePath}?${query}#vacancies` : `${basePath}#vacancies`;
}

export async function JobList({
  filters,
  basePath = "/jobs",
  contained = true,
}: JobListProps) {
  const [{ jobs, pagination }, categories] = await Promise.all([
    getJobs(filters),
    getCategoriesWithCounts(),
  ]);
  const categoryName = categories.find(
    (category) => category.slug === filters.category,
  )?.name;

  return (
    <section
      id="vacancies"
      className={cn(contained ? "container py-12" : "py-0")}
    >
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {categoryName ? `Вакансии: ${categoryName}` : "Актуальные вакансии"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Найдено вакансий: {pagination.total}
          </p>
        </div>
        {filters.category ? (
          <Button variant="outline" asChild>
            <a href={`${basePath}#vacancies`}>Сбросить категорию</a>
          </Button>
        ) : null}
      </div>

      {jobs.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-background p-8 text-center">
          <h3 className="text-xl font-medium">Вакансии не найдены</h3>
          <p className="mt-2 text-muted-foreground">
            Попробуйте изменить запрос, город, категорию или тип занятости.
          </p>
        </div>
      )}

      {pagination.pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            asChild={pagination.page > 1}
          >
            {pagination.page > 1 ? (
              <a href={pageHref(filters, pagination.page - 1, basePath)}>Назад</a>
            ) : (
              <span>Назад</span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {pagination.page} из {pagination.pageCount}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pageCount}
            asChild={pagination.page < pagination.pageCount}
          >
            {pagination.page < pagination.pageCount ? (
              <a href={pageHref(filters, pagination.page + 1, basePath)}>Вперед</a>
            ) : (
              <span>Вперед</span>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}

