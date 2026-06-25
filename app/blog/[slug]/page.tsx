import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { Badge } from '@/components/ui/badge';
import { getBlogArticleBySlug } from '@/services/blog.service';
import { markdownComponents } from '@/lib/markdown';
import { extractSeoMetadata } from '@/lib/extract-seo';

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


export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    return { title: 'Статья не найдена | MyJOB' };
  }

  return extractSeoMetadata({
    SEO: article.SEO,
    fallbackTitle: article.title,
    fallbackDescription: article.excerpt || article.title,
    fallbackImage: article.coverUrl,
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = await getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const hasGallery = article.images.length > 1;

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
              <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>

              <div className="prose prose-gray max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {article.content || 'Материал готовится к публикации.'}
                </ReactMarkdown>
              </div>
              {hasGallery && (
                <div className="mb-8 grid grid-cols-2 gap-4">
                  {article.images.slice(1).map((imgUrl, idx) => (
                    <div key={idx} className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={imgUrl}
                        alt={`Иллюстрация ${idx + 2}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 384px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
