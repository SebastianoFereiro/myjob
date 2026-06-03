import { BriefcaseBusiness, Layers3, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmploymentType, Job } from "@/types/jobs";

const employmentLabels: Record<EmploymentType, string> = {
  "full-time": "Полная занятость",
  "part-time": "Частичная занятость",
  contract: "Проектная работа",
  internship: "Стажировка",
  remote: "Удаленно",
};

function formatSalary(job: Job) {
  if (!job.salaryFrom && !job.salaryTo) {
    return "Зарплата по договоренности";
  }

  if (job.salaryFrom && job.salaryTo) {
    return `${job.salaryFrom}-${job.salaryTo} ${job.currency}`;
  }

  return job.salaryFrom
    ? `от ${job.salaryFrom} ${job.currency}`
    : `до ${job.salaryTo} ${job.currency}`;
}

export function JobCard({ job }: { job: Job }) {
  const categories = job.categories?.length ? job.categories : [job.category];

  return (
    <Card className="rounded-lg border bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">{job.title}</CardTitle>
        <CardDescription>{job.company.name}</CardDescription>
        <CardAction>
          <Badge variant={job.employmentType === "remote" ? "secondary" : "outline"}>
            {employmentLabels[job.employmentType]}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {job.description}
        </p>

        {/* Категории как фильтры */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`/jobs?category=${cat.slug}`}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted-foreground/20"
            >
              {cat.name}
            </a>
          ))}
        </div>

        {/* Доп. информация */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {job.level && (
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="size-4" />
              {job.level}
            </span>
          )}
          {job.experience && (
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="size-4" />
              {job.experience}
            </span>
          )}
        </div>

        {/* Локация, зарплата */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-4" />
            {formatSalary(job)}
          </span>
        </div>

        <Button asChild>
          <a href={`/jobs/${job.slug}`}>Открыть вакансию</a>
        </Button>
      </CardContent>
    </Card>
  );
}
