'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TagFilter } from '@/components/jobs/tag-filter';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { X, Filter, SlidersHorizontal } from 'lucide-react';
import type { JobFilters } from '@/types/jobs';

type FilterPanelProps = {
  filters: JobFilters;
  basePath: string;
  categorySlug?: string;
  citySlug?: string;
  regionSlug?: string;
  tags?: string[];
  activeFiltersCount: number;
};

type FilterContentProps = Omit<FilterPanelProps, 'tags'> & {
  tags?: string[];
  onClose: () => void;
};

function FilterContent({
  filters,
  basePath,
  categorySlug,
  citySlug,
  regionSlug,
  tags,
  activeFiltersCount,
  onClose,
}: FilterContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* <div className="flex items-center gap-1.5">
        <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Фильтры:</span>
        {activeFiltersCount > 0 && (
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            <span className="font-medium">{activeFiltersCount} акт.</span>
          </span>
        )}
      </div> */}

      {tags && tags.length > 0 && (
        <Suspense fallback={null}>
          <TagFilter
            tags={tags}
            basePath={categorySlug ? `/categories/${categorySlug}` : basePath}
            onSelect={onClose}
          />
        </Suspense>
      )}

      {(filters.region || filters.city || filters.category || filters.company) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {filters.region && !filters.category && (
            <Button
              variant="ghost"
              asChild
              size="sm"
              onClick={onClose}
              className="group relative h-7 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 text-xs font-medium text-destructive transition-all hover:border-destructive/30 hover:bg-destructive/10"
            >
              <a href={`/jobs#vacancies`}>
                <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                <span>Регион</span>
              </a>
            </Button>
          )}
          {filters.city && !filters.category && (
            <Button
              variant="ghost"
              asChild
              size="sm"
              onClick={onClose}
              className="group relative h-7 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 text-xs font-medium text-destructive transition-all hover:border-destructive/30 hover:bg-destructive/10"
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
              onClick={onClose}
              className="group relative h-7 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 text-xs font-medium text-destructive transition-all hover:border-destructive/30 hover:bg-destructive/10"
            >
              <a href={citySlug ? `/cities/${citySlug}#vacancies` : '/jobs#vacancies'}>
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
              onClick={onClose}
              className="group relative h-7 gap-1 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 text-xs font-medium text-destructive transition-all hover:border-destructive/30 hover:bg-destructive/10"
            >
              <a
                href={
                  citySlug
                    ? `/cities/${citySlug}#vacancies`
                    : regionSlug
                      ? `/regions/${regionSlug}#vacancies`
                      : `${basePath}#vacancies`
                }
              >
                <X className="h-3 w-3 transition-transform group-hover:rotate-90" />
                <span>Компания</span>
              </a>
            </Button>
          )}
        </div>
      )}

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          asChild
          onClick={onClose}
          className="h-7 gap-1.5 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <a
            href={
              categorySlug || citySlug || regionSlug ? '/jobs#vacancies' : `${basePath}#vacancies`
            }
          >
            <X className="h-3 w-3" />
            <span>Сбросить все</span>
          </a>
        </Button>
      )}
    </div>
  );
}

export function FilterPanel({
  filters,
  basePath,
  categorySlug,
  citySlug,
  regionSlug,
  tags,
  activeFiltersCount,
}: FilterPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Закрывать окно/поповер после любого изменения фильтров (теги, сброс)
  const searchParams = useSearchParams();
  useEffect(() => {
    setSheetOpen(false);
    setPopoverOpen(false);
  }, [searchParams]);

  const trigger = (
    <Button
      variant="outline"
      size="sm"
      className="relative h-8 gap-1.5 rounded-full border-border px-3"
      aria-label={`Фильтры${activeFiltersCount > 0 ? `, активно: ${activeFiltersCount}` : ''}`}
    >
      <Filter className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Фильтры</span>
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground shadow-sm ring-2 ring-background">
          {activeFiltersCount}
        </span>
      )}
    </Button>
  );

  return (
    <>
      {/* Мобильный вариант — модальное окно (Sheet) */}
      <div className="sm:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Выберите теги и сбросьте активные фильтры вакансий.
              </SheetDescription>
            </SheetHeader>
            <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
              <FilterContent
                filters={filters}
                basePath={basePath}
                categorySlug={categorySlug}
                citySlug={citySlug}
                regionSlug={regionSlug}
                tags={tags}
                activeFiltersCount={activeFiltersCount}
                onClose={() => setSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Десктопный вариант — Popover */}
      <div className="hidden sm:block">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="w-80 p-4">
            <FilterContent
              filters={filters}
              basePath={basePath}
              categorySlug={categorySlug}
              citySlug={citySlug}
              regionSlug={regionSlug}
              tags={tags}
              activeFiltersCount={activeFiltersCount}
              onClose={() => setPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
