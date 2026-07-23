'use client';

import { BriefcaseBusiness, Layers3, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EmploymentType, JobCategory, JobFilters } from '@/types/jobs';
import type { CityRef } from '@/types/strapi-collections';

type SearchFiltersProps = {
  initialFilters?: JobFilters;
  layout?: 'bar' | 'sidebar';
  categories?: JobCategory[];
  cities?: CityRef[];
};

const employmentOptions: Array<{ value: EmploymentType | ''; label: string }> = [
  { value: '', label: 'Любой формат' },
  { value: 'full-time', label: 'Полная занятость' },
  { value: 'part-time', label: 'Частичная занятость' },
  { value: 'contract', label: 'Проектная работа' },
  { value: 'internship', label: 'Стажировка' },
  { value: 'remote', label: 'Удаленно' },
];

export function SearchFilters({
  initialFilters,
  layout = 'bar',
  categories = [],
  cities = [],
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(initialFilters?.query || '');
  const [type, setType] = React.useState<EmploymentType | ''>(initialFilters?.type || '');
  const [category, setCategory] = React.useState(initialFilters?.category || '');
  const [city, setCity] = React.useState(initialFilters?.city || '');

  function updateURL(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (query.trim()) {
      params.set('query', query.trim());
    } else {
      params.delete('query');
    }

    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }

    const queryString = params.toString();

    if (category && city) {
      const qs = new URLSearchParams(queryString);
      qs.set('city', city);
      router.push(`/categories/${category}?${qs.toString()}`);
    } else if (city) {
      const qs = new URLSearchParams(queryString);
      qs.delete('city');
      const suffix = qs.toString() ? `?${qs.toString()}` : '';
      router.push(`/cities/${city}${suffix}`);
    } else if (category) {
      const suffix = queryString ? `?${queryString}` : '';
      router.push(`/categories/${category}${suffix}`);
    } else if (pathname.startsWith('/categories/') && pathname !== '/categories') {
      router.push(`/jobs${queryString ? `?${queryString}` : ''}`);
    } else if (pathname === '/') {
      const nextQuery = params.toString();
      router.push(nextQuery ? `/jobs?${nextQuery}` : '/jobs');
    } else {
      const nextQuery = params.toString();
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    }
  }

  return (
    <form
      onSubmit={updateURL}
      className={
        layout === 'sidebar'
          ? 'grid w-full gap-4'
          : 'grid w-full gap-3 rounded-lg border bg-background p-3 shadow-sm md:grid-cols-[1fr_1fr_220px_220px_auto]'
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
        <span className="sr-only">Город</span>
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={city}
          onChange={(event) => setCity(event.target.value)}
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Все города</option>
          {(cities ?? []).map((option) => (
            <option key={option.slug} value={option.slug}>
              {option.title}
            </option>
          ))}
        </select>
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
          {(categories ?? []).map((option) => (
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
          onChange={(event) => setType(event.target.value as EmploymentType | '')}
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {employmentOptions.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" size="lg" className="h-10">
        Найти
      </Button>
      {layout === 'sidebar' ? (
        <Button type="button" variant="outline" className="h-10" asChild>
          <Link href="/jobs">Сбросить фильтры</Link>
        </Button>
      ) : null}
    </form>
  );
}
