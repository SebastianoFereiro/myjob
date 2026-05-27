import type { Metadata } from "next";
import {
  MapPin,
  Globe,
  Users,
  BriefcaseBusiness,
  ArrowUpRight,
  Building2,
  CheckCircle2,
} from "lucide-react";

import Header from "@/components/header";
import { Footer } from "@/components/footer";

import { navigationItems } from "@/app/data/navigation";

type CompanyDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "Компания | MyJOB",
  description:
    "Подробная информация о компании, открытых вакансиях и условиях работы.",
};

// MOCK DATA
const company = {
  id: "1",
  slug: "techcorp",
  name: "TechCorp",
  logo: "/images/logo-by.png",
  industry: "IT & Software",
  location: "Минск, Беларусь",
  employees: "120+",
  website: "https://techcorp.com",
  verified: true,
  description:
    "TechCorp — современная IT-компания, специализирующаяся на разработке веб-приложений, SaaS-платформ и enterprise решений. Мы создаем продукты для клиентов по всему миру и активно развиваем инженерную культуру.",
  benefits: [
    "Удаленная работа и гибкий график",
    "Оплачиваемые курсы и конференции",
    "Современный стек технологий",
    "Медицинская страховка",
    "Комфортный офис и техника",
  ],
};

const openJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    location: "Минск",
    salary: "$2500 - $4000",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Backend Engineer",
    location: "Remote",
    salary: "$3000 - $5000",
    type: "Remote",
  },
  {
    id: 3,
    title: "UI/UX Designer",
    location: "Варшава",
    salary: "$2000 - $3200",
    type: "Hybrid",
  },
];

export default async function CompanyDetailsPage({
  params,
}: CompanyDetailsPageProps) {
  const { slug } = await params;

  return (
    <>
      <Header navigationData={navigationItems} />

      <main className="min-h-screen bg-[#fafafa]">
        {/* HERO */}
        <section className="border-b bg-white">
          <div className="container py-6 md:py-10">
            <div className="rounded-[32px] border bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
                {/* LEFT */}
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border bg-white shadow-sm">
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-14 w-14 object-contain"
                    />
                  </div>

                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {company.verified && (
                        <div className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified Company
                        </div>
                      )}

                      <div className="inline-flex rounded-full border bg-zinc-100 px-3 py-1 text-xs font-medium">
                        {company.industry}
                      </div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                      {company.name}
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                        <MapPin className="h-4 w-4" />
                        {company.location}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                        <Users className="h-4 w-4" />
                        {company.employees}
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                        <BriefcaseBusiness className="h-4 w-4" />
                        {openJobs.length} вакансий
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION CARD */}
                <div className="w-full rounded-[28px] bg-black p-6 text-white shadow-2xl xl:max-w-[320px]">
                  <p className="text-sm text-zinc-400">
                    Открытых вакансий
                  </p>

                  <h2 className="mt-2 text-5xl font-bold">
                    {openJobs.length}
                  </h2>

                  <p className="mt-3 text-sm text-zinc-400">
                    Присоединяйтесь к команде TechCorp
                  </p>

                  <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]">
                    Смотреть вакансии
                  </button>

                  <button className="mt-3 w-full rounded-2xl border border-zinc-700 px-5 py-3 text-sm transition hover:bg-zinc-900">
                    Подписаться
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
              {/* ABOUT */}
              <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />

                  <h2 className="text-2xl font-semibold">
                    О компании
                  </h2>
                </div>

                <p className="text-[15px] leading-8 text-muted-foreground md:text-base">
                  {company.description}
                </p>
              </div>

              {/* BENEFITS */}
              <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />

                  <h2 className="text-2xl font-semibold">
                    Что предлагает компания
                  </h2>
                </div>

                <div className="space-y-4">
                  {company.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>

                      <p className="text-sm leading-7 text-muted-foreground md:text-base">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* JOBS */}
              <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold">
                    Открытые вакансии
                  </h2>

                  <button className="text-sm font-medium text-primary">
                    Смотреть все
                  </button>
                </div>

                <div className="space-y-4">
                  {openJobs.map((job) => (
                    <div
                      key={job.id}
                      className="group rounded-3xl border p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold transition group-hover:text-primary">
                            {job.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                              {job.salary}
                            </div>

                            <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                              {job.location}
                            </div>

                            <div className="rounded-full bg-zinc-100 px-3 py-1.5">
                              {job.type}
                            </div>
                          </div>
                        </div>

                        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:scale-[1.02]">
                          Подробнее
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              {/* INFO */}
              <div className="rounded-[32px] border bg-white p-5 shadow-sm md:p-7">
                <h3 className="mb-5 text-xl font-semibold">
                  Информация
                </h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Веб-сайт
                      </p>

                      <a
                        href={company.website}
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        techcorp.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Локация
                      </p>

                      <p className="font-medium">
                        {company.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Размер компании
                      </p>

                      <p className="font-medium">
                        {company.employees}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-[32px] bg-black p-6 text-white shadow-xl md:p-7">
                <h3 className="text-2xl font-semibold">
                  Хотите работать здесь?
                </h3>

                <p className="mt-3 text-sm text-zinc-400">
                  Изучите вакансии компании и отправьте отклик.
                </p>

                <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]">
                  Перейти к вакансиям
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