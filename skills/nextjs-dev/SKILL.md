---
name: nextjs-dev
description: Develop a Next.js 15 application with React 18
---

# Next.js 15 + React Skill

## Next.js App Router

- Server Components by default (без "use client")
- Client Components: добавлять директиву `"use client"`
- App Router структура: `app/` папка с `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Динамические маршруты: `[param]` папки, `...slug` для catch-all
- Parallel routes: `@folder` для одновременного отображения
- Intercepting routes: `(.)folder` для модальных окон

## Data Fetching

- Server Components: прямой вызов `fetch()` или базы данных
- Client Components: использование SWR или React Query для кеширования
- Server Actions (экспериментально): мутации данных из Server Components
- Route Handlers: `route.ts` файлы для API endpoints (`app/api/.../route.ts`)

## Оптимизация

- Code splitting: автоматический для dynamic imports
- useCallback, useMemo для предотвращения лишних рендеров
- React.memo для тяжелых компонентов
- Lazy loading: `next/dynamic` для компонентов
- Image optimization: `next/image` компонент

## shadcn/ui Компоненты

- Установка: `npx shadcn@latest init`
- Добавление компонентов: `npx shadcn@latest add button dialog dropdown-menu`
- Импорт: `import { Button } from "@/components/ui/button"`
- Кастомизация через className и CVA варианты
- Доступность: все компоненты соответствуют WAI-ARIA

## Error Handling

- Error boundaries: `error.tsx` файлы в App Router
- `try-catch` в Server Actions
- Глобальная обработка ошибок в `app/global-error.tsx`
- Fallback UI для loading states

## SEO

- Metadata API: `export const metadata = { title, description }` в `layout.tsx` или `page.tsx`
- Open Graph и Twitter cards
- Semantic HTML: правильные теги `<header>`, `<main>`, `<section>`, `<article>`
- Structured data (JSON-LD) для поисковиков

## Типизация (TypeScript)

- Строгий режим: `"strict": true` в `tsconfig.json`
- Типизация props компонентов
- Интерфейсы для API ответов (StrapiResponse<T>)
- Shared types: `packages/types/` для переиспользования

## Пример Server Component с Strapi

```tsx
// app/articles/page.tsx
import { fetchAPI } from '@/lib/strapi-client';
import { ArticleCard } from '@/components/article-card';

interface Article {
  title: string;
  content: string;
  publishedAt: string;
}

export default async function ArticlesPage() {
  const articles = await fetchAPI<Article>('/articles?populate=*');

  return (
    <main>
      <h1>Статьи</h1>
      <div className="grid grid-cols-3 gap-4">
        {articles.data.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </main>
  );
}
```
