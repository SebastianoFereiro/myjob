import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProfessions } from '@/services/professions.service';

export async function ProfessionsSection() {
  const professions = await getProfessions();

  if (!professions.length) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden py-8 md:py-16 ">
      <div className="container px-0">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Профессии
          </p>
          <h2 className="text-3xl font-medium tracking-tight text-pretty text-foreground md:text-4xl">
            Выберите интересующее направление из списка профессий.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professions.map((profession) => (
            <Link
              key={profession.slug}
              href={`/jobs?category=${profession.slug}`}
              className="group block"
            >
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{profession.name}</span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profession.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {profession.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BriefcaseBusiness className="size-4" />
                    <span>
                      {profession.count != null
                        ? `${profession.count} ${decline(profession.count, ['вакансия', 'вакансии', 'вакансий'])}`
                        : 'Вакансии'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function decline(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}
