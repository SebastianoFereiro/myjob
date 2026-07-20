import { BriefcaseBusiness, Layers3, MapPin, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EmploymentType, Job } from '@/types/jobs';

const employmentLabels: Record<EmploymentType, string> = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  contract: 'Проектная работа',
  internship: 'Стажировка',
  remote: 'Удаленно',
};

function formatSalary(job: Job) {
  if (!job.salaryFrom && !job.salaryTo) {
    return 'По договоренности';
  }

  if (job.salaryFrom && job.salaryTo) {
    return `${job.salaryFrom}-${job.salaryTo} ${job.currency}`;
  }

  return job.salaryFrom
    ? `от ${job.salaryFrom} ${job.currency}`
    : `до ${job.salaryTo} ${job.currency}`;
}

export function JobCard({ job, isPremium }: { job: Job; isPremium?: boolean }) {
  return (
    <Card
      className={cn(
        "shadow-sm transition-shadow hover:shadow-md",
        isPremium && "border-amber-400 ring-1 ring-amber-400/30",
      )}
    >
      <CardHeader className="p-3 sm:p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isPremium && (
                  <Sparkles className="size-4 shrink-0 text-amber-500" />
                )}
                <CardTitle className="text-[15px] leading-snug font-semibold sm:text-lg">
                  {job.title}
                </CardTitle>
              </div>
              {isPremium && (
                <Badge
                  variant="default"
                  className="mt-1.5 bg-amber-500 text-[10px] px-2 py-0 font-semibold text-white hover:bg-amber-600"
                >
                  Premium
                </Badge>
              )}
            </div>
            <Badge
              variant={job.employmentType === 'remote' ? 'secondary' : 'outline'}
              className="shrink-0 rounded-full text-[11px] px-2.5 py-0 font-normal"
            >
              {employmentLabels[job.employmentType]}
            </Badge>
          </div>
          <p className="text-[13px] text-muted-foreground truncate">{job.company.name}</p>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-0 sm:px-5 space-y-3">
        <p className="line-clamp-2 text-[13px] text-muted-foreground leading-relaxed">
          {job.description}
        </p>

        {job.category && (
          <div className="flex flex-wrap gap-1.5">
            <a href={`/categories/${job.category.slug}`}>
              <Badge
                variant="secondary"
                className="rounded-full text-[11px] px-2.5 py-0 font-normal cursor-pointer hover:bg-muted-foreground/20 transition-colors"
              >
                {job.category.name}
              </Badge>
            </a>
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          {job.level && (
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="size-3.5 shrink-0" />
              <span className="truncate">{job.level}</span>
            </span>
          )}
          {job.experience && (
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="size-3.5 shrink-0" />
              <span className="truncate">{job.experience}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {' '}
              {job.city} {job.location}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
            <BriefcaseBusiness className="size-3.5 shrink-0" />
            <span className="truncate">{formatSalary(job)}</span>
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <Button asChild className="flex-1 h-9 text-[13px] shadow-sm">
            <a href={`/jobs/${job.slug}-${job.id}`}>Открыть вакансию</a>
          </Button>
          <Button variant="outline" asChild className="flex-1 h-9 text-[13px]">
            <a href={`/companies/${job.company.slug}`}>Компания</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
