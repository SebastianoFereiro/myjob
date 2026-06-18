'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import type { CompanyPublic } from '@/services/companies.service';

type Props = {
  companies: CompanyPublic[];
};

export default function CompanyListingClient({ companies }: Props) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q) ||
        (c.location || '').toLowerCase().includes(q)
    );
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCompanies = filteredCompanies.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* HEADER */}
        <div className="mb-8 rounded-[32px] border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                COMPANY DIRECTORY
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Компании</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Найдите лучшие компании для работы, изучите открытые вакансии и условия.
              </p>
            </div>
            <div className="rounded-3xl bg-black p-6 text-white shadow-xl">
              <p className="text-sm text-zinc-400">Всего компаний</p>
              <h2 className="mt-2 text-4xl font-bold">{filteredCompanies.length}</h2>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-8 rounded-[32px] border bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr]">
            <div>
              <label className="mb-2 block text-sm font-medium">Поиск компании</label>
              <input
                type="text"
                placeholder="Введите название компании"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {paginatedCompanies.map((company) => (
            <div
              key={company.id}
              className="group rounded-[32px] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border bg-zinc-50">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {company.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold transition group-hover:text-primary">
                      {company.name}
                    </h2>
                    {company.industry && (
                      <p className="mt-2 text-sm text-muted-foreground">{company.industry}</p>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                      {company.location && (
                        <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                          {company.location}
                        </div>
                      )}
                      {company.size && (
                        <div className="rounded-full bg-zinc-100 px-3 py-1.5">{company.size}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                {company.description}
              </p>

              <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5">
                <div>
                  <p className="text-sm text-muted-foreground">Подробнее</p>
                </div>
                <a
                  href={`/companies/${company.slug}`}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
                >
                  Смотреть компанию
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {filteredCompanies.length === 0 && (
          <div className="rounded-[32px] border bg-white p-16 text-center shadow-sm">
            <h3 className="text-2xl font-semibold">Компании не найдены</h3>
            <p className="mt-3 text-muted-foreground">Попробуйте изменить параметры поиска.</p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              disabled={safePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="h-11 rounded-2xl border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-100"
            >
              Назад
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-medium transition ${
                    safePage === page ? 'bg-black text-white' : 'border bg-white hover:bg-zinc-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="h-11 rounded-2xl border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-zinc-100"
            >
              Далее
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
