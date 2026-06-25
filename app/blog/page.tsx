import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { getBlogArticles } from '@/services/blog.service';
import { extractSeoMetadata } from '@/lib/extract-seo';

export const metadata: Metadata = {
  title: 'Блог | MyJOB',
  description: 'Статьи MyJOB о поиске работы, вакансиях и карьере.',
};

const PAGE_SIZE = 20;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp?.page) || 1);
  const { articles, pagination } = await getBlogArticles(currentPage, PAGE_SIZE);

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container py-10">
            <Badge variant="outline">Блог</Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Советы для поиска работы
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Практичные материалы для кандидатов и работодателей.
            </p>
          </div>
        </section>

        <section className="container py-8 md:py-12">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group relative block h-56 overflow-hidden rounded-lg border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/80 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-5">
                  <h2 className="text-md font-semibold tracking-tight text-white">
                    {article.title}
                  </h2>
                  {article.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-xs text-white/70">{article.excerpt}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pageCount > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="inline-flex h-10 items-center rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                >
                  Назад
                </Link>
              )}

              {Array.from({ length: pagination.pageCount }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={`/blog?page=${page}`}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'border bg-background hover:bg-muted'
                  }`}
                >
                  {page}
                </Link>
              ))}

              {currentPage < pagination.pageCount && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="inline-flex h-10 items-center rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
                >
                  Далее
                </Link>
              )}
            </nav>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
