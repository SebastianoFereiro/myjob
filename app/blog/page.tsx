import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

import Image from "next/image";

import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { getBlogArticles } from "@/services/blog.service";

export const metadata: Metadata = {
  title: "Блог | MyJOB",
  description: "Статьи MyJOB о поиске работы, вакансиях и карьере.",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function BlogPage() {
  const articles = await getBlogArticles();

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
              <a
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group relative block h-56 overflow-hidden rounded-lg border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {article.imageUrl && (
                  <Image
                    src={article.imageUrl}
                    alt={article.imageAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition group-hover:opacity-90"
                  />
                )}
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                    <time>{formatDate(article.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{article.author}</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {article.title}
                  </h2>
                  {article.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                      {article.excerpt}
                    </p>
                  ) : null}
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

