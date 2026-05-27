import type { Metadata } from "next";
import {
  MapPin,
  Clock3,
  BriefcaseBusiness,
  Wallet,
  CalendarDays,
  Building2,
  ArrowUpRight,
  Users,
  Globe,
  CheckCircle2,
} from "lucide-react";

import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { JobDetails } from "@/components/jobs/job-details";
import type { Job } from "@/types/jobs";
import { navigationItems } from "@/app/data/navigation";

export const metadata: Metadata = {
  title: "Детали вакансии | MyJOB",
  description:
    "Подробная информация о вакансии с требованиями, условиями и контактами.",
};

type JobDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const mockJob: Job = {
  id: "1",
  slug: "frontend-developer",
  title: "Frontend Developer",
  company: {
    id: "1",
    name: "TechCorp",
    slug: "techcorp",
    logoUrl: "/images/logo-by.png",
  },
  category: {
    slug: "development",
    name: "Разработка",
  },
  location: "Минск",
  employmentType: "full-time",
  salaryFrom: 2000,
  salaryTo: 3000,
  currency: "USD",
  description:
    "Ищем опытного Frontend Developer для работы над современными веб-приложениями. Участие в разработке пользовательских интерфейсов, взаимодействие с дизайнерами и backend-разработчиками.",
  publishedAt: "2024-01-15",
  deadline: "2024-02-15",
  requirements:
    "• Опыт работы с React.js, Vue.js или Angular\n• Знание HTML5, CSS3, JavaScript ES6+\n• Опыт работы с современными инструментами сборки\n• Понимание принципов responsive design\n• Опыт работы с Git\n• Английский язык на уровне Intermediate",
};

const similarJobs = [
  {
    id: 1,
    title: "React Developer",
    company: "PixelSoft",
    salary: "$2500 - $3500",
    location: "Remote",
  },
  {
    id: 2,
    title: "Frontend Engineer",
    company: "StartupX",
    salary: "$3000 - $4200",
    location: "Варшава",
  },
  {
    id: 3,
    title: "Next.js Developer",
    company: "NovaTech",
    salary: "$2800 - $4000",
    location: "Минск",
  },
];

export default async function JobDetailsPage({
  params,
}: JobDetailsPageProps) {
  const { slug } = await params;

  const job = mockJob;

  return (
    <>
      <Header navigationData={navigationItems} />

      <main className="flex-1 bg-[#fafafa]">
        {/* HERO */}
        <section className="border-b bg-white">
          <div className="container py-6 md:py-10">
            <div className="rounded-3xl border bg-gradient-to-br from-white to-zinc-50 p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                {/* LEFT */}
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-white shadow-sm">
                    <img
                      src={job.company.logoUrl}
                      alt={job.company.name}
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div>
                    <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      TOP VACANCY
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      {job.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {job.company.name}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>

                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="h-4 w-4" />
                        Full-time
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {job.publishedAt}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SALARY CARD */}
                <div className="w-full rounded-3xl border bg-black p-6 text-white shadow-2xl xl:max-w-[320px]">
                  <div className="mb-4 flex items-center gap-2 text-zinc-400">
                    <Wallet className="h-4 w-4" />
                    Зарплата
                  </div>

                  <h2 className="text-3xl font-bold md:text-4xl">
                    ${job.salaryFrom}–${job.salaryTo}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-400">
                    Конкурентная оплата + бонусы
                  </p>

                  <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]">
                    Откликнуться
                  </button>

                  <button className="mt-3 w-full rounded-2xl border border-zinc-700 px-5 py-3 text-sm transition hover:bg-zinc-900">
                    Сохранить вакансию
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="container py-6 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            {/* MAIN */}
            <div className="space-y-6">
              {/* JOB CONTENT */}
              <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-8">
                
                <JobDetails job={job} />
              </div>

              {/* REQUIREMENTS */}
              <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6" />

                  <h2 className="text-xl font-semibold md:text-2xl">
                    Требования
                  </h2>
                </div>

                <div className="space-y-4">
                  {job.requirements
                    .split("\n")
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                        <p className="text-sm text-muted-foreground md:text-base">
                          {item.replace("•", "")}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* SIMILAR JOBS */}
              <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold md:text-2xl">
                    Похожие вакансии
                  </h2>

                  <button className="text-sm font-medium text-primary">
                    Все вакансии
                  </button>
                </div>

                <div className="grid gap-4">
                  {similarJobs.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold transition group-hover:text-primary">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.company}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2 text-sm">
                            <div className="rounded-full bg-zinc-100 px-3 py-1">
                              {item.salary}
                            </div>

                            <div className="rounded-full bg-zinc-100 px-3 py-1">
                              {item.location}
                            </div>
                          </div>
                        </div>

                        <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              {/* COMPANY */}
              <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-zinc-50">
                    <img
                      src={job.company.logoUrl}
                      alt={job.company.name}
                      className="h-10 w-10 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-semibold">
                      {job.company.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      IT & Software
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    120+ сотрудников
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                    techcorp.com
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    Минск, Беларусь
                  </div>
                </div>

                <button className="mt-6 w-full rounded-2xl border px-4 py-3 font-medium transition hover:bg-zinc-100">
                  Смотреть компанию
                </button>
              </div>

              {/* QUICK INFO */}
              <div className="rounded-3xl border bg-white p-5 shadow-sm md:p-7">
                <h3 className="mb-5 text-xl font-semibold">
                  Информация
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Дедлайн
                      </p>

                      <p className="font-medium">{job.deadline}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Тип занятости
                      </p>

                      <p className="font-medium">
                        Полная занятость
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Зарплата
                      </p>

                      <p className="font-medium">
                        ${job.salaryFrom} - ${job.salaryTo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-3xl bg-black p-6 text-white shadow-xl md:p-7">
                <h3 className="text-2xl font-semibold">
                  Подходит вакансия?
                </h3>

                <p className="mt-3 text-sm text-zinc-400">
                  Отправьте отклик и получите ответ от компании.
                </p>

                <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]">
                  Откликнуться сейчас
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}