"use client";

import { SlidersHorizontal } from "lucide-react";

import { SearchFilters } from "@/components/jobs/search-filters";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { JobCategory, JobFilters } from "@/types/jobs";
import type { CityRef } from "@/types/strapi-collections";

type JobFiltersPanelProps = {
  filters: JobFilters;
  categories: JobCategory[];
  cities?: CityRef[];
};

function FilterContent({ filters, categories, cities }: JobFiltersPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Фильтры</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Уточните категорию, город, формат работы или должность.
        </p>
      </div>
      <SearchFilters
        initialFilters={filters}
        layout="sidebar"
        categories={categories}
        cities={cities}
      />
    </div>
  );
}

export function JobFiltersPanel({ filters, categories, cities }: JobFiltersPanelProps) {
  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-lg border bg-background p-4 shadow-sm">
          <FilterContent filters={filters} categories={categories} cities={cities} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 gap-2">
              <SlidersHorizontal className="size-4" />
              Фильтры
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88vw] overflow-y-auto p-0">
            <SheetHeader>
              <SheetTitle>Фильтры вакансий</SheetTitle>
              <SheetDescription>
                Настройте параметры поиска и примените фильтр.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-6">
              <SearchFilters
                initialFilters={filters}
                layout="sidebar"
                categories={categories}
                cities={cities}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
