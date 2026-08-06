import { BriefcaseBusiness, CalendarDays, MapPin, Sparkles, User, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOptionLabel, RESUME_EMPLOYMENT_OPTIONS } from '@/lib/enum-options';
import type { Resume, SkillItem } from '@/types/resume';

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatSalary(resume: Resume): string | null {
  if (!resume.salary) return null;
  return `${resume.salary.toLocaleString('ru-RU')} ${resume.currency}`;
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function initials(resume: Resume): string {
  const first = (resume.firstName || '').charAt(0).toUpperCase();
  const last = (resume.lastName || '').charAt(0).toUpperCase();
  return first + last || 'Р';
}

export function ResumeCard({ resume }: { resume: Resume }) {
  const skills = asArray<SkillItem>(resume.skills);

  const fullName = [resume.firstName, resume.lastName].filter(Boolean).join(' ') || resume.userEmail;
  const salary = formatSalary(resume);
  const updated = formatDate(resume.updatedAt);

  return (
    <Card className="group overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

      <CardHeader className="p-3 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-sm">
            {initials(resume)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-[15px] leading-snug font-semibold sm:text-lg">
                {resume.position || resume.title || 'Резюме'}
              </CardTitle>
              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-primary/30 bg-primary/5 px-2.5 py-0 text-[11px] font-medium text-primary"
              >
                {getOptionLabel(RESUME_EMPLOYMENT_OPTIONS, resume.employmentType)}
              </Badge>
            </div>

            <p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
              <User className="size-3.5 shrink-0" />
              {fullName}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {resume.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  {resume.location}
                </span>
              )}
              {salary && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <Wallet className="size-3.5 shrink-0 text-primary" />
                  {salary}
                </span>
              )}
              {updated && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {updated}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-3 pb-4 sm:px-5">
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill.name}
                variant="secondary"
                className="rounded-full border-primary/10 bg-primary/5 px-2.5 py-0 text-[11px] font-medium text-foreground"
              >
                {skill.name}
              </Badge>
            ))}
            {skills.length > 4 && (
              <span className="inline-flex items-center px-1 text-[11px] text-muted-foreground">
                +{skills.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <BriefcaseBusiness className="size-3.5" />
            {resume.experience?.length || 0} мест работы
          </span>
          <Button
            asChild
            className="h-9 px-4 text-[13px] shadow-sm bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary/70"
          >
            <a href={`/resumes/${resume.slug}-${resume.id}`}>
              <Sparkles className="mr-1.5 size-3.5" />
              Открыть
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
