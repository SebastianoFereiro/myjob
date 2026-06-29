import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { getCategoriesWithCounts } from '@/services/categories.service';

export async function ToolsStackSection() {
  const categories = await getCategoriesWithCounts();
  const top = categories
    .filter((c) => (c.count ?? 0) > 0)
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, 6);

  if (top.length === 0) return null;

  return (
    <section id="vacancies" className="w-full md:py-8 py-4">
      <div className="mx-auto max-w-6xl space-y-10 ">
        <h2 className="mb-6 pb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
          Вакансии по направлениям
        </h2>

        <ul className="relative grid w-full gap-3 lg:grid-cols-2">
          {top.map((category) => (
            <li key={category.slug}>
              <Link href={`/jobs?category=${category.slug}#vacancies`} className="block">
                <Card className="bg-hatch rounded-2xl border-0 p-2 shadow-none transition-colors hover:bg-accent/50">
                  <div className="flex items-center justify-between gap-2 md:gap-10">
                    <div className="flex items-center gap-0 md:gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-background/70 text-lg font-bold text-foreground">
                        {category.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">{category.name}</h3>
                        {category.description ? (
                          <p className="text-[8px] sm:text-xs uppercase text-foreground/50 md:text-sm">
                            {category.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="pr-2 text-right font-semibold uppercase md:pr-5">
                      <span className="block text-2xl leading-none">{category.count ?? 0}</span>
                      <span className="text-[8px] sm:text-xs text-foreground/50">вакансий</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
