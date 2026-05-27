"use client";
import { useState, useEffect } from "react";

export default function CompanyListingPage() {
  const companies = [
    {
      id: 1,
      name: "TechCorp",
      industry: "IT & Software",
      employees: "120+",
      location: "Минск",
      openJobs: 14,
      verified: true,
      logo: "https://placehold.co/100x100?text=T",
    },
    {
      id: 2,
      name: "NovaSoft",
      industry: "Fintech",
      employees: "80+",
      location: "Варшава",
      openJobs: 8,
      verified: true,
      logo: "https://placehold.co/100x100?text=N",
    },
    {
      id: 3,
      name: "PixelLab",
      industry: "Design",
      employees: "40+",
      location: "Remote",
      openJobs: 4,
      verified: false,
      logo: "https://placehold.co/100x100?text=P",
    },
    {
      id: 4,
      name: "CloudBase",
      industry: "Cloud",
      employees: "200+",
      location: "Берлин",
      openJobs: 21,
      verified: true,
      logo: "https://placehold.co/100x100?text=C",
    },
    {
      id: 5,
      name: "StartupX",
      industry: "Startup",
      employees: "15+",
      location: "Киев",
      openJobs: 3,
      verified: false,
      logo: "https://placehold.co/100x100?text=S",
    },
    {
      id: 6,
      name: "DevSolutions",
      industry: "Outsource",
      employees: "300+",
      location: "Прага",
      openJobs: 17,
      verified: true,
      logo: "https://placehold.co/100x100?text=D",
    },
  ];

  const industries = [
    "Все",
    "IT & Software",
    "Fintech",
    "Design",
    "Cloud",
    "Startup",
    "Outsource",
  ];

  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("Все");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "Все" ||
      company.industry === selectedIndustry;

    const matchesVerified =
      !verifiedOnly || company.verified;

    return (
      matchesSearch &&
      matchesIndustry &&
      matchesVerified
    );
  });

  const totalPages = Math.ceil(
    filteredCompanies.length / itemsPerPage
  );

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedIndustry, verifiedOnly]);

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

              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Компании
              </h1>

              <p className="mt-3 max-w-2xl text-muted-foreground">
                Найдите лучшие компании для работы, изучите открытые вакансии
                и условия.
              </p>
            </div>

            <div className="rounded-3xl bg-black p-6 text-white shadow-xl">
              <p className="text-sm text-zinc-400">
                Всего компаний
              </p>

              <h2 className="mt-2 text-4xl font-bold">
                {filteredCompanies.length}
              </h2>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-8 rounded-[32px] border bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_180px]">
            {/* SEARCH */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Поиск компании
              </label>

              <input
                type="text"
                placeholder="Введите название компании"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
              />
            </div>

            {/* INDUSTRY */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Индустрия
              </label>

              <select
                value={selectedIndustry}
                onChange={(e) =>
                  setSelectedIndustry(e.target.value)
                }
                className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
              >
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* VERIFIED */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Фильтр
              </label>

              <button
                onClick={() =>
                  setVerifiedOnly(!verifiedOnly)
                }
                className={`h-12 w-full rounded-2xl border px-4 font-medium transition ${
                  verifiedOnly
                    ? "border-black bg-black text-white"
                    : "bg-zinc-50 hover:bg-zinc-100"
                }`}
              >
                {verifiedOnly
                  ? "Только verified"
                  : "Все компании"}
              </button>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="grid gap-5 md:grid-cols-2">
          {paginatedCompanies.map((company) => (
            <div
              key={company.id}
              className="group rounded-[32px] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border bg-zinc-50">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold transition group-hover:text-primary">
                        {company.name}
                      </h2>

                      {company.verified && (
                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                          Verified
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {company.industry}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-sm">
                      <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                        {company.location}
                      </div>

                      <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                        {company.employees}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t pt-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Открытые вакансии
                  </p>

                  <h3 className="text-2xl font-bold">
                    {company.openJobs}
                  </h3>
                </div>

                <a href={`/companies/${company.id}`} className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:scale-[1.02]">
                  Смотреть компанию
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {filteredCompanies.length === 0 && (
          <div className="rounded-[32px] border bg-white p-16 text-center shadow-sm">
            <h3 className="text-2xl font-semibold">
              Компании не найдены
            </h3>

            <p className="mt-3 text-muted-foreground">
              Попробуйте изменить параметры фильтрации.
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
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
                    currentPage === page
                      ? "bg-black text-white"
                      : "border bg-white hover:bg-zinc-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
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
