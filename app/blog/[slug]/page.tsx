import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { getBlogArticleBySlug } from '@/services/blog.service';

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function splitContent(content?: string) {
  return (content || '')
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Статья не найдена | MyJOB',
    };
  }

  return {
    title: `${article.title} | MyJOB`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const paragraphs = splitContent(article.content || article.excerpt);

  return (
    <>
      <Header />
      <main className="flex-1 bg-background">
        <article>
          <section className="border-b bg-muted/30">
            <div className="container py-10 md:py-14">
              <Badge variant="outline">Блог</Badge>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
                {article.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time>{formatDate(article.publishedAt)}</time>
                <span aria-hidden="true">·</span>
                <span>{article.author}</span>
              </div>
            </div>
          </section>

          <section className="container py-8 md:py-12">
            <div className="mx-auto max-w-3xl">
              {article.imageUrl && (
                <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={article.imageUrl}
                    alt={article.imageAlt ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="space-y-5 text-base leading-8 text-muted-foreground md:text-lg">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>Материал готовится к публикации.</p>
                )}
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
