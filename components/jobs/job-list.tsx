import { Suspense } from 'react';
import { JobCard } from '@/components/jobs/job-card';
import { PremiumSection } from '@/components/jobs/premium-section';
import { TagFilter } from '@/components/jobs/tag-filter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCategoriesWithCounts, getCategoryBySlug } from '@/services/categories.service';
import { getCompanyBySlug } from '@/services/companies.service';
import { getJobs, getPremiumJobs } from '@/services/jobs.service';
import type { JobFilters } from '@/types/jobs';
import { X, Filter, SlidersHorizontal } from 'lucide-react';

type JobListProps = {
  filters: JobFilters;
  basePath?: string;
  contained?: boolean;
  categorySlug?: string;
  citySlug?: string;
  tags?: string[];
};

function pageHref(
  filters: JobFilters,
  page: number,
  basePath: string,
  categorySlug?: string,
  citySlug?: string
) {
  const params = new URLSearchParams();

  if (filters.query) params.set('query', filters.query);
  if (filters.location) params.set('location', filters.location);
  if (filters.type) params.set('type', filters.type);
  if (!categorySlug && filters.category) params.set('category', filters.category);
  if (filters.company) params.set('company', filters.company);
  if (filters.level) params.set('level', filters.level);
  if (filters.experience) params.set('experience', filters.experience);
  if (filters.education) params.set('education', filters.education);
  if (filters.position) params.set('position', filters.position);
  if (!citySlug && filters.city) params.set('city', filters.city);
  if (filters.tag) params.set('tag', filters.tag);
  if (page > 1) params.set('page', String(page));

  const query = params.toString();

  if (citySlug && !filters.category) {
    const base = `/cities/${citySlug}`;
    return query ? `${base}?${query}#vacancies` : `${base}#vacancies`;
  }

  if (categorySlug) {
    const base = `${basePath}/${categorySlug}`;
    const cityQ = filters.city ? `city=${filters.city}` : '';
    const combined = [query, cityQ].filter(Boolean).join('&');
    return combined ? `${base}?${combined}#vacancies` : `${base}#vacancies`;
  }

  return query ? `${basePath}?${query}#vacancies` : `${basePath}#vacancies`;
}

export async function JobList({
  filters,
  basePath = '/jobs',
  contained = true,
  categorySlug,
  citySlug,
  tags,
}: JobListProps) {
  const [{ jobs, pagination }, { jobs: premiumJobs }, categories, company, categoryData] =
    await Promise.all([
      getJobs(filters),
      getPremiumJobs(filters),
      getCategoriesWithCounts(),
      filters.company ? getCompanyBySlug(filters.company) : null,
      categorySlug ? getCategoryBySlug(categorySlug) : null,
    ]);

  const categoryName = categories.find((category) => category.slug === filters.category)?.name;

  const companyName = company?.name;

  const heading = companyName
    ? `Вакансии: ${companyName}`
    : categoryName
      ? `Вакансии: ${categoryName}`
      : 'Актуальные вакансии';

  // Подсчет активных фильтров
  const activeFiltersCount = [
    filters.city,
    filters.category,
    filters.company,
    filters.query,
    filters.type,
    filters.level,
    filters.experience,
    filters.education,
    filters.position,
    filters.tag,
  ].filter(Boolean).length;

  return (
    <section id="vacancies" className={cn(contained ? 'container py-12' : 'py-0')}>
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          {categoryData?.description && (
            <h1
              className="pt-3 text-2xl leading-[1.05] font-bold tracking-tight md:text-5xl mb-2"
              dangerouslySetInnerHTML={{ __html: categoryData.description }}
            />
          )}
          <h2 className="text-xl mt-1 leading-[1.05] font-semibold tracking-tight">{heading}</h2>

          <p className="text-muted-foreground">
            Найдено вакансий: {pagination.total + premiumJobs.length}
          </p>
        </div>
      </div>

      {/* Премиум блок фильтров */}
      <div className="relative mb-6 rounded-xl border bg-gradient-to-br from-background via-background to-muted/30 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Левая группа - фильтры */}
          <div className="flex items-center gap-1 flex-wrap">
            {/* Иконка фильтров */}
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Фильтры:</span>
            </div>

            {tags && tags.length > 0 && (
              <Suspense fallback={null}>
                <TagFilter
                  tags={tags}
                  basePath={categorySlug ? `/categories/${categorySlug}` : basePath}
                />
              </Suspense>
            )}

            {/* Кнопки сброса с премиум дизайном */}
            <div className="flex items-center gap-1 flex-wrap ml-1">
              {filters.city && !filters.category && (
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className="group relative h-8 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-3 text-xs font-medium text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/30 sm:text-sm"
                >
                  <a href={`/jobs#vacancies`}>
                    <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                    <span>Город</span>
                  </a>
                </Button>
              )}
              {filters.category && (
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className="group relative h-8 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-3 text-xs font-medium text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/30 sm:text-sm"
                >
                  <a href={citySlug ? `/cities/${citySlug}#vacancies` : `${basePath}#vacancies`}>
                    <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                    <span>Категория</span>
                  </a>
                </Button>
              )}
              {filters.company && !filters.category && (
                <Button
                  variant="ghost"
                  asChild
                  size="sm"
                  className="group relative h-8 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-3 text-xs font-medium text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/30 sm:text-sm"
                >
                  <a href={`${basePath}#vacancies`}>
                    <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                    <span>Компания</span>
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Правая группа - статистика фильтров */}
          <div className="flex items-center gap-1">
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 mr-2 rounded-full bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground">
                <Filter className="h-3 w-3 " />
                <span className="font-medium">{activeFiltersCount}</span>
                <span className="hidden sm:inline">активных фильтра</span>
              </div>
            )}
            {/* Опционально: кнопка "Сбросить все" */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                asChild
              >
                <a href={`${basePath}#vacancies`}>
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">Сбросить все</span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <PremiumSection jobs={premiumJobs} />

      {jobs.length > 0 ? (
        <div>
          {premiumJobs.length > 0 && <h3 className="mb-3 text-lg font-semibold">Все вакансии</h3>}
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
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
          <Button variant="outline" disabled={pagination.page <= 1} asChild={pagination.page > 1}>
            {pagination.page > 1 ? (
              <a href={pageHref(filters, pagination.page - 1, basePath, categorySlug)}>Назад</a>
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
              <a href={pageHref(filters, pagination.page + 1, basePath, categorySlug)}>Вперед</a>
            ) : (
              <span>Вперед</span>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
