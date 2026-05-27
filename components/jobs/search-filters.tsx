"use client";

import { BriefcaseBusiness, Layers3, MapPin, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobCategories } from "@/app/data/job-categories";
import type { EmploymentType, JobFilters } from "@/types/jobs";

type SearchFiltersProps = {
  initialFilters?: JobFilters;
  layout?: "bar" | "sidebar";
};

const employmentOptions: Array<{ value: EmploymentType | ""; label: string }> = [
  { value: "", label: "Любой формат" },
  { value: "full-time", label: "Полная занятость" },
  { value: "part-time", label: "Частичная занятость" },
  { value: "contract", label: "Проектная работа" },
  { value: "internship", label: "Стажировка" },
  { value: "remote", label: "Удаленно" },
];

export function SearchFilters({
  initialFilters,
  layout = "bar",
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialFilters?.query || "");
  const [location, setLocation] = React.useState(initialFilters?.location || "");
  const [type, setType] = React.useState<EmploymentType | "">(
    initialFilters?.type || "",
  );
  const [category, setCategory] = React.useState(initialFilters?.category || "");

  function updateURL(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }

    if (location.trim()) {
      params.set("location", location.trim());
    } else {
      params.delete("location");
    }

    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    const nextQuery = params.toString();
    router.push(nextQuery ? `/jobs${pathname}?${nextQuery}` : `/jobs${pathname}`);
  }

  return (
    <form
      onSubmit={updateURL}
      className={
        layout === "sidebar"
          ? "grid w-full gap-4"
          : "grid w-full gap-3 rounded-lg border bg-background p-3 shadow-sm md:grid-cols-[1fr_1fr_220px_220px_auto]"
      }
    >
      <label className="relative block">
        <span className="sr-only">Должность или компания</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Должность или компания"
          className="h-10 pl-9"
        />
      </label>

      <label className="relative block">
        <span className="sr-only">Город или формат</span>
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Город или удаленно"
          className="h-10 pl-9"
        />
      </label>

      <label className="relative block">
        <span className="sr-only">Категория</span>
        <Layers3 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Все категории</option>
          {jobCategories.map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <label className="relative block">
        <span className="sr-only">Тип занятости</span>
        <BriefcaseBusiness className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={type}
          onChange={(event) => setType(event.target.value as EmploymentType | "")}
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {employmentOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="lg" className="h-10">
        Найти
      </Button>
      {layout === "sidebar" ? (
        <Button type="button" variant="outline" className="h-10" asChild>
          <a href="/jobs">Сбросить фильтры</a>
        </Button>
      ) : null}
    </form>
  );
}
