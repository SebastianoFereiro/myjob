# План: Коллекция Blog — Strapi Schema, Seed, Frontend Migration

## Требования (согласованы)

| Параметр | Значение |
|---|---|
| API ID | `blog` (singular), `blogs` (plural) |
| Endpoint | `/api/blogs` |
| Категории | Не нужны |
| Автор | Плоское строковое поле `author` |
| Фото | Несколько (media multiple), первое = обложка |
| Draft & Publish | `true` |

---

## Step 1 — Strapi Schema (schema.json)

### 1.1 Создать [`apps/backend/api/blog/content-types/blog/schema.json`](apps/backend/api/blog/content-types/blog/schema.json)

На основе [`apps/backend/api/page/content-types/page/schema.json`](apps/backend/api/page/content-types/page/schema.json).

```json
{
  "kind": "collectionType",
  "collectionName": "blogs",
  "info": {
    "singularName": "blog",
    "pluralName": "blogs",
    "displayName": "Blog",
    "description": "Статьи блога по поиску работы"
  },
  "options": {
    "draftAndPublish": true
  },
  "pluginOptions": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true,
      "maxLength": 200
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "excerpt": {
      "type": "text",
      "maxLength": 500
    },
    "content": {
      "type": "richtext",
      "required": true
    },
    "images": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["images"]
    },
    "author": {
      "type": "string",
      "maxLength": 100
    }
  }
}
```

> **Действие пользователя:** Создать коллекцию `Blog` в Strapi Admin через _Content-Type Builder_ или загрузить `schema.json` вручную по пути `./src/api/blog/content-types/blog/schema.json`.

### 1.2 Обновить [`apps/backend/strapi-schema.ts`](apps/backend/strapi-schema.ts)

Заменить `BlogPostSchema` (id: `blog-post`) на `BlogSchema` (id: `blog`):

```diff
- export const BlogPostSchema = {
-   collectionName: 'blog-posts',
-   info: {
-     singularName: 'blog-post',
-     pluralName: 'blog-posts',
-     displayName: 'Blog Post',
-     description: 'Статьи блога',
-   },
-   ...
-   attributes: {
-     title: { ... },
-     slug: { ... },
-     excerpt: { ... },
-     content: { ... },
-     cover_image: { type: 'media', multiple: false },
-     // categories: M:M
-     // author: M:1
-   },
- };

+ export const BlogSchema = {
+   collectionName: 'blogs',
+   info: {
+     singularName: 'blog',
+     pluralName: 'blogs',
+     displayName: 'Blog',
+     description: 'Статьи блога по поиску работы',
+   },
+   options: { draftAndPublish: true },
+   pluginOptions: {},
+   attributes: {
+     title: { type: 'string', required: true, maxLength: 200 },
+     slug: { type: 'uid', targetField: 'title', required: true },
+     excerpt: { type: 'text', maxLength: 500 },
+     content: { type: 'richtext', required: true },
+     images: { type: 'media', multiple: true, allowedTypes: ['images'], required: false },
+     author: { type: 'string', maxLength: 100 },
+   },
+ } as const;
```

---

## Step 2 — Seed Script (5 постов)

### 2.1 Создать [`scripts/seed-blog.ts`](scripts/seed-blog.ts)

По образу [`scripts/seed-pages.ts`](scripts/seed-pages.ts) и [`scripts/seed.ts`](scripts/seed.ts).

**Требования к скрипту:**

- **Запуск:** `npx tsx scripts/seed-blog.ts` (или `--force` для перезаписи)
- **5 постов** на тему поиска работы и резюме (3000 символов каждый)
- **Rich text контент:** заголовки, списки, цитаты, жирный текст
- **Фото:** скрипт скачивает 10 готовых изображений по URL через `fetch()` и загружает в Strapi Upload (`POST /api/upload` с FormData). Каждый пост получает 2 изображения. Первое = обложка.
- **Fallback 404:** при скачивании проверять `response.ok`. Если 404 — пропускать изображение (не добавлять к посту). На фронтенде — fallback `https://via.placeholder.com/1200x800?text=Image+Not+Found`.
- **Проверка дубликатов:** проверка по `slug` через `filters[slug][$eq]`
- **Параметр `--force`:** если передан — удаляет существующие посты с этими slug перед созданием

**5 тем для постов:**

| # | Slug | Тема |
|---|---|---|
| 1 | `how-to-write-cv` | Как составить резюме, которое заметят рекрутеры |
| 2 | `interview-mistakes` | 5 частых ошибок на собеседовании и как их избежать |
| 3 | `remote-work-tips` | Как эффективно работать удалённо: советы для новичков |
| 4 | `linkedin-profile` | Как оформить LinkedIn, чтобы вас нашли работодатели |
| 5 | `salary-negotiation` | Как правильно обсуждать зарплату на собеседовании |

**Структура каждого поста:**

```typescript
type BlogSeed = {
  title: string;
  slug: string;
  excerpt: string;          // до 300 символов
  content: string;          // markdown/richtext до 3000 символов
  author: string;           // "Редакция" или "MyJOB"
  imageIndexes: [number, number]; // индексы из IMAGE_URLS (2 на пост)
};
```

**Изображения:** 10 готовых URL от пользователя с описаниями. Скрипт скачивает их через `fetch()` и загружает в Strapi.

```typescript
const IMAGE_URLS: Array<{ url: string; alt: string }> = [
  { url: "https://kimi-web-img.moonshot.cn/img/cvviz.com/1efa621e83e983d0a6d4fc9293f2c5dd575d9b40.png", alt: "Job posting platforms — логотипы популярных платформ для поиска работы" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.shutterstock.com/41331cf0bc88606b85ad4697a7d2c21987aa123c.jpg", alt: "Candidate search icons — иконки поиска кандидатов" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.omnesgroup.com/0cfa5ca64b268b2527bd0201d6022186fa106b54.png", alt: "Remote vs Freelance — инфографика сравнения удаленной работы и фриланса" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.aihr.com/dc16d31bad8e326968673d4aa10867d4c5373429.png", alt: "Recruitment team infographic — 7 шагов построения команды рекрутинга" },
  { url: "https://kimi-web-img.moonshot.cn/img/media.gettyimages.com/e96efa8133d8fe78d53d900ec4a0356d9a50d86a.jpg", alt: "Candidate search — ноутбук с поиском кандидатов" },
  { url: "https://kimi-web-img.moonshot.cn/img/ccitraining.edu/2ecc3631bb796e49a84d155d8ac7707ad5e995bf.png", alt: "Office work — женщина за ноутбуком в офисе" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.aihr.com/bb635ea753418ae46c0f3a762fe4bbe8046d39c6.png", alt: "Talent acquisition roadmap — дорожная карта найма в 7 шагов" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.thebalancemoney.com/d5b8a82fc81fb49fc2aa1f53f39d6d95e27d345a.jpg", alt: "Job newspaper — газетные объявления о вакансиях" },
  { url: "https://kimi-web-img.moonshot.cn/img/www.cvhero.com/c95b27cd80e0bba05397d8e3507baf7a0414e415.jpg", alt: "CV template — пример резюме/составления CV" },
  { url: "https://kimi-web-img.moonshot.cn/img/storage.googleapis.com/95e89f00891ea4834566b01ee2ff71f0b43c2408.png", alt: "Office meeting — иллюстрация офисной встречи/собеседования" },
];
```

**Маппинг постов к изображениям:**
1. `how-to-write-cv` → IMAGE_URLS[8] (CV template), IMAGE_URLS[3] (Recruitment team)
2. `interview-mistakes` → IMAGE_URLS[9] (Office meeting), IMAGE_URLS[1] (Candidate search icons)
3. `remote-work-tips` → IMAGE_URLS[2] (Remote vs Freelance), IMAGE_URLS[5] (Office work)
4. `linkedin-profile` → IMAGE_URLS[0] (Job posting platforms), IMAGE_URLS[4] (Candidate search)
5. `salary-negotiation` → IMAGE_URLS[6] (Talent acquisition), IMAGE_URLS[7] (Job newspaper)

---

## Step 3 — Frontend: Обновить типы

### 3.1 Обновить [`types/strapi-collections.ts`](types/strapi-collections.ts)

```diff
- export interface BlogPost {
-   id: number;
-   title: string;
-   slug: string;
-   excerpt: string;
-   content: string;
-   cover_image: string | null;
-   categories: Category[];
-   author: Author;
-   publishedAt: string | null;
-   createdAt: string;
-   updatedAt: string;
- }

+ export interface BlogPost {
+   id: number;
+   documentId: string;
+   title: string;
+   slug: string;
+   excerpt: string | null;
+   content: string;
+   images: Array<{
+     id: number;
+     url: string;
+     alternativeText: string | null;
+   }>;
+   author: string;
+   publishedAt: string | null;
+   createdAt: string;
+   updatedAt: string;
+ }
```

### 3.2 Обновить [`types/blog.ts`](types/blog.ts)

Обновить `BlogArticle` — добавить `images` (массив) и `coverUrl` (производное поле — первое изображение).

```typescript
export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  author: string;
  coverUrl: string;         // первое из images
  coverAlt: string;
  images: string[];          // все URL изображений
  publishedAt: string;
}

export const FALLBACK_IMAGE_URL = "https://via.placeholder.com/1200x800?text=Image+Not+Found";
```

---

### 3.3 Fallback для изображений

В [`types/blog.ts`](types/blog.ts) добавлена константа `FALLBACK_IMAGE_URL`. Используется в сервисе и компонентах, если `images` пуст или Strapi вернул ошибку.

---

## Step 4 — Frontend: Обновить Blog Service

### 4.1 Обновить [`services/blog.service.ts`](services/blog.service.ts)

- Убрать `fallbackArticles`
- Убрать весь conditional fallback logic (проверку `process.env...`)
- Изменить endpoint с `/blog` на `/blogs`
- Обновить `StrapiBlogRecord` под новую структуру (поле `images`)
- Логика: первое изображение из массива `images` = `coverUrl`
- Параметры запроса: `populate=*`, `sort[0]=publishedAt:desc`
- Убрать `getBlogArticleBySlug` — заменить на прямой запрос с фильтром `filters[slug][$eq]`

### 4.2 Обработка ошибок

- Если Strapi недоступен — выбрасывать ошибку (не возвращать mock)
- Компоненты-предки (error boundary, not-found) обработают 404/500

### 4.3 Fallback изображений в сервисе

При маппинге `mapStrapiBlog`: если `images` пуст / null / undefined — `coverUrl = FALLBACK_IMAGE_URL`. Также если Strapi вернул записи без изображений.

---

## Step 5 — Frontend: Обновить страницы

### 5.1 [`app/blog/page.tsx`](app/blog/page.tsx)

- Заменить `article.imageUrl` → `article.coverUrl`
- Заменить `article.imageAlt` → `article.coverAlt`
- Если `article.excerpt` не null — показывать, иначе не показывать блок
- Fallback: если `article.coverUrl === FALLBACK_IMAGE_URL` — показать серый плейсхдер с текстом "Изображение недоступно"

### 5.2 [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx)

- Заменить `article.imageUrl` → `article.coverUrl`
- Если `article.images.length > 1` — добавить галерею под обложкой
- Парсинг `content` (rich text) остаётся как есть (разбивка на параграфы)
- Fallback: если изображения отсутствуют — показать серый placeholder

### 5.2 [`app/blog/[slug]/page.tsx`](app/blog/[slug]/page.tsx)

- Заменить `article.imageUrl` → `article.coverUrl`
- Если `article.images.length > 1` — добавить галерею под обложкой
- Парсинг `content` (rich text) остаётся как есть (разбивка на параграфы)

### 5.3 `generateMetadata` для `[slug]/page.tsx`

- Использовать `coverUrl` для OpenGraph images
- Использовать `excerpt` для description

---

## Step 6 — Синхронизировать Strapi Schema Reference

### 6.1 Удалить неиспользуемые типы из [`types/strapi-collections.ts`](types/strapi-collections.ts)

- Удалить `Author` интерфейс (больше не нужен, автор — плоская строка)
- Удалить `Category` из контекста блога (если не используется)

---

## Диаграмма потока данных

```mermaid
flowchart TD
    A[Strapi Admin] -->|создать коллекцию| B[(PostgreSQL blogs)]
    B -->|REST API /api/blogs| C[Seed Script]
    C -->|POST + Upload| B

    D[Next.js Server Component] -->|fetch /api/blogs| E[blog.service.ts]
    E -->|populate=* sort=publishedAt:desc| F[Strapi API]
    F -->|JSON response| E
    E -->|mapStrapiBlog| G[BlogArticle[]]
    G --> H[app/blog/page.tsx]
    G --> I[app/blog/[slug]/page.tsx]
    
    H -->|article.coverUrl| J[Image cover]
    I -->|article.images[]| K[Gallery]
```

---

## Порядок выполнения

| # | Шаг | Файлы | Затрагивает |
|---|---|---|---|
| 1 | Создать schema.json blog | `apps/backend/api/blog/content-types/blog/schema.json` | Пользователь вручную обновляет Strapi |
| 2 | Обновить strapi-schema.ts | `apps/backend/strapi-schema.ts` | Source of truth |
| 3 | Seed script | `scripts/seed-blog.ts` | Новый файл |
| 4 | Запустить seed | `npx tsx scripts/seed-blog.ts` | Strapi наполнится данными |
| 5 | Обновить типы | `types/strapi-collections.ts`, `types/blog.ts` | Frontend типы |
| 6 | Обновить сервис | `services/blog.service.ts` | Убрать mock, новый endpoint |
| 7 | Обновить страницы | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` | UI адаптация |
| 8 | Проверить работу | Открыть `/blog` и `/blog/how-to-write-cv` | E2E проверка |
