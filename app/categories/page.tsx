import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getCategoriesWithCounts } from '@/services/categories.service';
import { ArrowRight } from 'lucide-react';
import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { navigationItems } from '../data/navigation';

export const metadata: Metadata = {
  title: 'Резюме и вакансии по категориям | MyJOB',
  description:
    'Найди работу или профессионалов в нужной категории на MyJOB. Логистика, IT, Маркетинг и многое другое.',
};

export default async function CVSPage() {
  const categories = (await getCategoriesWithCounts()) || [];

  return (
    <>
      <Header navigationData={navigationItems} />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Поиск по категориям</h1>
            <p className="text-lg text-muted-foreground">
              Выбери интересующую тебя категорию, чтобы увидеть все резюме и вакансии в этой области
            </p>
          </div>

          {/* Categories Grid */}
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`} className="group">
                  <div className="h-full rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h2>
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                        {category.count || 0}
                      </span>
                    </div>

                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center text-primary text-sm font-medium">
                      Смотреть
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground text-lg">Категории еще не загружены</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
