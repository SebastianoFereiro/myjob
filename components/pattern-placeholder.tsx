import { Suspense } from 'react';
import { CategoryCatalog, type CategoryItem } from '@/components/category-catalog';
import { BlogLatestTech, type BlogPost } from '@/components/blog-latest-tech';
import { Button } from '@/components/ui/button';
import { getBlogArticles } from '@/services/blog.service';
import { getCategoriesWithCounts } from '@/services/categories.service';
import { Feature154 } from './feature-list';
import { SearchFilters } from './jobs/search-filters';
import { ToolsStackSection } from './tools-stack-section';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

const layouts: Array<'default' | 'wide' | 'tall'> = [
  'default',
  'wide',
  'tall',
  'wide',
  'default',
  'wide',
  'wide',
];

const PatternPlaceholder = async () => {
  const [{ articles }, categories] = await Promise.all([
    getBlogArticles(1, 5),
    getCategoriesWithCounts(),
  ]);

  const cat: CategoryItem[] = categories.slice(0, 7).map((category, index) => ({
    title: category.name,
    meta: `${category.count || 0} вакансий`,
    image: category.imageUrl || `/cat/default.jpg`,
    alt: `Раздел ${category.name}`,
    href: `/jobs?category=${category.slug}#vacancies`,
    slug: category.slug,
    layout: layouts[index] || 'default',
  }));
  const posts: BlogPost[] = articles.map((article) => ({
    href: `/blog/${article.slug}`,
    imageSrc: article.coverUrl,
    imageAlt: article.coverAlt,
    title: article.title,
    date: formatDate(article.publishedAt),
    author: article.author,
    excerpt: article.excerpt ?? undefined,
  }));
  return (
    <div className="relative z-10">
      <div className="container py-28 md:py-32">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
              Работа для людей, на которых все держится.
            </h1>
            <p className="mx-auto max-w-2xl font-light tracking-tighter text-pretty text-muted-foreground md:text-lg lg:text-xl">
              1002+ актуальные вакансии каждый день.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button asChild>
              <a href="#vacancies">Искать работу</a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="#resume">Разместить резюме</a>
            </Button>
          </div>
          <Suspense fallback={null}>
            <SearchFilters categories={categories} />
          </Suspense>
          <CategoryCatalog items={cat} />
          <Feature154 />
          <ToolsStackSection />
          <BlogLatestTech posts={posts} />
        </div>
      </div>
    </div>
  );
};

export { PatternPlaceholder };
