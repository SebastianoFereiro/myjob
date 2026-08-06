import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Badge } from '@/components/ui/badge';
import { markdownComponents } from '@/lib/markdown';
import {
  BriefcaseBusiness,
  GraduationCap,
  Languages,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type {
  EducationItem,
  ExperienceItem,
  LanguageItem,
  Resume,
  SkillItem,
} from '@/types/resume';

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function formatPeriod(start?: string, end?: string, current?: boolean): string {
  const startDate = start ? new Date(start) : null;
  const endDate = current ? null : end ? new Date(end) : null;

  if (startDate && !endDate) {
    return `${formatMonthYear(startDate)} — настоящее время`;
  }
  if (!startDate && endDate) {
    return `до ${formatMonthYear(endDate)}`;
  }
  if (!startDate || !endDate) {
    return '';
  }

  const sameMonthYear =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth();

  if (sameMonthYear) {
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    if (startDay === endDay) {
      return startDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const month = startDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    return `${startDay} — ${endDay} ${month}`;
  }

  return `${formatMonthYear(startDate)} — ${formatMonthYear(endDate)}`;
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="rounded-2xl border bg-gradient-to-br from-background via-background to-muted/50 p-5 shadow-sm md:p-7">
        {children}
      </div>
    </section>
  );
}

export function ResumeDetails({ resume }: { resume: Resume }) {
  const skills = asArray<SkillItem>(resume.skills);
  const experience = asArray<ExperienceItem>(resume.experience);
  const education = asArray<EducationItem>(resume.education);
  const languages = asArray<LanguageItem>(resume.languages);

  return (
    <div className="space-y-8">
      {resume.about && (
        <Section icon={<Sparkles className="size-5" />} title="О себе">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {resume.about}
          </ReactMarkdown>
        </Section>
      )}

      {skills.length > 0 && (
        <Section icon={<Wrench className="size-5" />} title="Навыки">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.name}
                variant="secondary"
                className="rounded-full border-primary/10 bg-primary/5 px-3 py-1 text-xs font-medium"
              >
                {skill.name}
                {skill.level ? ` · ${skill.level}` : ''}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {experience.length > 0 && (
        <Section icon={<BriefcaseBusiness className="size-5" />} title="Опыт работы">
          <div className="space-y-4">
            {experience.map((item, index) => (
              <div key={index} className="rounded-xl border bg-background p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{item.position}</h3>
                    {item.company && (
                      <p className="text-sm text-muted-foreground">{item.company}</p>
                    )}
                  </div>
                  {formatPeriod(item.startDate, item.endDate, item.current) && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {formatPeriod(item.startDate, item.endDate, item.current)}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {education.length > 0 && (
        <Section icon={<GraduationCap className="size-5" />} title="Образование">
          <div className="space-y-4">
            {education.map((item, index) => (
              <div key={index} className="rounded-xl border bg-background p-5">
                <h3 className="text-lg font-semibold">{item.institution}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[item.degree, item.specialty].filter(Boolean).join(', ')}
                </p>
                {item.startYear && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.startYear}
                    {item.endYear ? ` — ${item.endYear}` : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {languages.length > 0 && (
        <Section icon={<Languages className="size-5" />} title="Языки">
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <Badge
                key={lang.language}
                variant="outline"
                className="rounded-full border-primary/20 px-3 py-1 text-xs font-medium"
              >
                {lang.language}
                {lang.level ? ` — ${lang.level}` : ''}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
