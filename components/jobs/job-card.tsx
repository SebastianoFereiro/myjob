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

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness className="size-4" />
            {formatSalary(job)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers3 className="size-4" />
            {job.category.name}
          </span>
        </div>

        <Button asChild>
          <a href={`/jobs/${job.slug}`}>Открыть вакансию</a>
        </Button>
      </CardContent>
    </Card>
  );
}
