import { Suspense } from 'react';
import { JobCard } from '@/components/jobs/job-card';
import { PremiumSection } from '@/components/jobs/premium-section';
import { FilterPanel } from '@/components/jobs/filter-panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCategoriesWithCounts, getCategoryBySlug } from '@/services/categories.service';
import { getCompanyBySlug } from '@/services/companies.service';
import { getJobs, getPremiumJobs } from '@/services/jobs.service';
import type { JobFilters } from '@/types/jobs';

type JobListProps = {
  filters: JobFilters;
  basePath?: string;
  contained?: boolean;
  categorySlug?: string;
  citySlug?: string;
  regionSlug?: string;
  tags?: string[];
};

function pageHref(
  filters: JobFilters,
  page: number,
  basePath: string,
  categorySlug?: string,
  citySlug?: string,
  regionSlug?: string
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

  if (regionSlug && !filters.category) {
    const base = `/regions/${regionSlug}`;
    return query ? `${base}?${query}#vacancies` : `${base}#vacancies`;
  }

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
  regionSlug,
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

  const hasFilterContent = (tags?.length ?? 0) > 0 || activeFiltersCount > 0;

  return (
    <section
      id="vacancies"
      className={cn(contained ? 'container px-4 py-8 sm:px-6 lg:px-8' : 'py-0')}
    >
      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          {categoryData?.description && (
            <h1
              className="pt-3 text-2xl leading-[1.05] font-bold tracking-tight md:text-5xl mb-2"
              dangerouslySetInnerHTML={{ __html: categoryData.description }}
            />
          )}
          {/* <h2 className="text-xl mt-1 leading-[1.05] font-semibold tracking-tight">{heading}</h2> */}

          <p className="text-muted-foreground">
            Найдено вакансий: {pagination.total + premiumJobs.length}
          </p>
        </div>
      </div>

      {/* Кнопка фильтров — открывает Popover (десктоп) / Sheet (мобильный) */}
      {hasFilterContent && (
        <Suspense fallback={null}>
          <div className="mb-5">
            <FilterPanel
              filters={filters}
              basePath={basePath}
              categorySlug={categorySlug}
              citySlug={citySlug}
              regionSlug={regionSlug}
              tags={tags}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </Suspense>
      )}

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
      ) : premiumJobs.length === 0 ? (
        <div className="rounded-lg border bg-background p-8 text-center">
          <h3 className="text-xl font-medium">Вакансии не найдены</h3>
          <p className="mt-2 text-muted-foreground">
            Попробуйте изменить запрос, город, категорию или тип занятости.
          </p>
        </div>
      ) : null}

      {pagination.pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={pagination.page <= 1} asChild={pagination.page > 1}>
            {pagination.page > 1 ? (
              <a
                href={pageHref(
                  filters,
                  pagination.page - 1,
                  basePath,
                  categorySlug,
                  citySlug,
                  regionSlug
                )}
              >
                Назад
              </a>
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
              <a
                href={pageHref(
                  filters,
                  pagination.page + 1,
                  basePath,
                  categorySlug,
                  citySlug,
                  regionSlug
                )}
              >
                Вперед
              </a>
            ) : (
              <span>Вперед</span>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
