import { Badge } from '@/components/ui/badge';
import type { EmploymentType, Job } from '@/types/jobs';
import { CheckCircle2, Layers3, MapPin, Sparkles } from 'lucide-react';

const employmentLabels: Record<EmploymentType, string> = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  contract: 'Проектная работа',
  internship: 'Стажировка',
  remote: 'Удаленно',
};

function splitLines(value?: string) {
  return (value || '')
    .split(/\n|•|-/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobDetails({ job }: { job: Job }) {
  const requirements = splitLines(job.requirements);
  const conditions = splitLines(job.conditions);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="size-5" />
          <h2 className="text-2xl font-semibold tracking-tight">О вакансии</h2>
        </div>

        <div className="rounded-lg border bg-background p-5 md:p-7">
          <div className="flex flex-wrap gap-2">
            {job.category && (
              <Badge
                key={job.category.slug}
                variant="outline"
                className="rounded-full px-4 py-1 text-xs font-medium"
              >
                {job.category.name}
              </Badge>
            )}
            <Badge
              variant={job.employmentType === 'remote' ? 'secondary' : 'outline'}
              className="rounded-full px-4 py-1 text-xs font-medium"
            >
              {employmentLabels[job.employmentType]}
            </Badge>
            {job.level && (
              <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium">
                {job.level}
              </Badge>
            )}
            {job.experience && (
              <Badge variant="outline" className="rounded-full px-4 py-1 text-xs font-medium">
                {job.experience}
              </Badge>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <MapPin className="size-4" />
              {job.city ? `${job.city},` : ''} {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <Layers3 className="size-4" />
              {job.category?.name || ''}
            </span>
          </div>

          <p className="mt-8 whitespace-pre-line text-[15px] leading-8 text-muted-foreground md:text-base">
            {job.description || 'Описание вакансии готовится к публикации.'}
          </p>
        </div>
      </section>

      {(requirements.length > 0 || job.requirements) && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle2 className="size-5" />
            <h2 className="text-2xl font-semibold tracking-tight">Требования</h2>
          </div>

          <div className="rounded-lg border bg-background p-5 md:p-7">
            {requirements.length > 0 ? (
              <div className="space-y-3">
                {requirements.map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg border bg-muted/40 p-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-7 text-muted-foreground md:text-base">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Подробные требования будут добавлены позже.</p>
            )}
          </div>
        </section>
      )}

      {(conditions.length > 0 || job.conditions) && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <CheckCircle2 className="size-5" />
            <h2 className="text-2xl font-semibold tracking-tight">Условия</h2>
          </div>

          <div className="rounded-lg border bg-background p-5 md:p-7">
            {conditions.length > 0 ? (
              <div className="space-y-3">
                {conditions.map((item) => (
                  <div key={item} className="flex gap-3 rounded-lg border bg-muted/40 p-4">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-blue-600" />
                    <p className="text-sm leading-7 text-muted-foreground md:text-base">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Условия не указаны.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
