"use client";

import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Layers3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import type { Job } from "@/types/jobs";

export function JobDetails({ job }: { job: Job }) {
  return (
    <div className="space-y-8">
      {/* ABOUT */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />

          <h2 className="text-2xl font-semibold tracking-tight">
            О вакансии
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 text-xs font-medium"
            >
              {job.category.name}
            </Badge>

            <Badge
              variant={
                job.employmentType === "remote"
                  ? "secondary"
                  : "outline"
              }
              className="rounded-full px-4 py-1 text-xs font-medium"
            >
              {job.employmentType}
            </Badge>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5">
              <MapPin className="size-4" />
              {job.location}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5">
              <Layers3 className="size-4" />
              {job.category.name}
            </span>
          </div>

          <div className="mt-8">
            <p className="whitespace-pre-line text-[15px] leading-8 text-muted-foreground md:text-base">
              {job.description}
            </p>
          </div>
        </div>
      </section>

      {/* RESPONSIBILITIES */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />

          <h2 className="text-2xl font-semibold tracking-tight">
            Что нужно будет делать
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-5 md:p-7">
          <div className="space-y-4">
            {[
              "Разработка современных пользовательских интерфейсов",
              "Интеграция API и взаимодействие с backend",
              "Оптимизация производительности приложения",
              "Работа с командой дизайнеров и разработчиков",
              "Поддержка и развитие текущего проекта",
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:bg-zinc-100"
              >
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>

                <p className="text-sm leading-7 text-muted-foreground md:text-base">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Layers3 className="h-5 w-5" />

          <h2 className="text-2xl font-semibold tracking-tight">
            Технологии и стек
          </h2>
        </div>

        <div className="rounded-3xl border bg-white p-5 md:p-7">
          <div className="flex flex-wrap gap-3">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "TailwindCSS",
              "REST API",
              "Git",
              "Figma",
              "Vercel",
            ].map((tech) => (
              <div
                key={tech}
                className="rounded-2xl border bg-zinc-50 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}