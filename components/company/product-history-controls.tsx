'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

interface ProductHistoryControlsProps {
  query: string;
  page: number;
  pageCount: number;
  total: number;
}

/** Поиск и пагинация истории продуктов: состояние страницы хранится в URL. */
export function ProductHistoryControls({
  query,
  page,
  pageCount,
  total,
}: ProductHistoryControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Компонент монтируется с key={query} со страницы, поэтому значение поля
  // всегда соответствует параметру ?q= без синхронизации через effect.
  const [value, setValue] = useState(query);

  function buildUrl(nextQuery: string, nextPage: number): string {
    const params = new URLSearchParams();
    if (nextQuery) params.set('q', nextQuery);
    if (nextPage > 1) params.set('page', String(nextPage));
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildUrl(value.trim(), 1));
  }

  function handleReset() {
    setValue('');
    router.push(buildUrl('', 1));
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Поиск по названию вакансии"
          aria-label="Поиск по названию вакансии"
          className="w-full sm:max-w-sm"
        />
        <Button type="submit" size="sm">
          <Search className="size-4" />
          <span className="ml-1.5">Найти</span>
        </Button>
        {query && (
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Сбросить
          </Button>
        )}
      </form>

      <Pagination page={page} pageCount={pageCount} total={total} onPageChange={(next) => router.push(buildUrl(query, next))} />
    </div>
  );
}
