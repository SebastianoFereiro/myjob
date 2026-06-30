# План: robots.txt + sitemap.xml с динамическими вакансиями

## Контекст

**Стек**: Next.js 16.2.9 + Strapi 5
**Проект**: myjob.by — платформа вакансий

Необходимо добавить `robots.txt` и `sitemap.xml`, которые учитывают динамические страницы вакансий, но **исключают** резюме и связанные с ними приватные маршруты.

## Текущая архитектура

- Вакансии: Strapi collection `cvs`, URL-шаблон `/jobs/[slug]-[documentId]`
- Блог: Strapi collection `blogs`, URL-шаблон `/blog/[slug]`
- Компании: Strapi collection `companies`, URL-шаблон `/companies/[slug]`
- Категории: Strapi collection `categories`, URL-шаблон `/categories/[slug]`
- Статические страницы: `/(content)/about`, `/help`, `/pricing`, `/privacy`, `/terms`, `/contacts`
- Резюме: `resume/submit`, `dashboard/resume/[id]/edit`, `company/cvs/*`

## Что нужно реализовать

### 1. Базовый URL для sitemap

Использовать существующую `NEXT_PUBLIC_APP_URL`:
- `NEXT_PUBLIC_APP_URL=http://localhost:3000` (dev)
- `NEXT_PUBLIC_APP_URL=https://myjob.by` (prod)

В коде: `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"`

### 2. `app/robots.ts`

Правила:

```
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /resume/
Disallow: /company/
Disallow: /api/
Disallow: /upload/

Sitemap: https://myjob.by/sitemap.xml
```


**Почему `/auth/` исключён:** приватные страницы аутентификации, не подлежат индексации.

**Почему исключаем `/company/`:** там находятся приватные разделы (CV management, dashboard).

### 3. `app/sitemap.ts`

Динамическая генерация через Next.js App Router `sitemap.ts`.

#### Статические маршруты (с приоритетами)

| Маршрут | Priority | ChangeFreq |
|---------|----------|------------|
| `/` | 1.0 | daily |
| `/jobs` | 0.9 | daily |
| `/blog` | 0.7 | weekly |
| `/about` | 0.5 | monthly |
| `/help` | 0.4 | monthly |
| `/pricing` | 0.5 | monthly |
| `/privacy` | 0.3 | yearly |
| `/terms` | 0.3 | yearly |
| `/categories` | 0.7 | weekly |
| `/companies` | 0.7 | weekly |
| `/contacts` | 0.4 | monthly |

#### Динамические маршруты

1. **Вакансии** (`/jobs/[slug]-[documentId]`)
   - Источник: Strapi `/cvs` с фильтром `isActive=true`
   - Частота: daily
   - Priority: 0.8
   - lastmod: `updatedAt` записи
   - URL: `/jobs/{slug}-{documentId}`

2. **Блог** (`/blog/[slug]`)
   - Источник: Strapi `/blogs` с фильтром `publishedAt` не null
   - Частота: weekly
   - Priority: 0.6
   - lastmod: `publishedAt` записи

3. **Категории** (`/categories/[slug]`)
   - Источник: Strapi `/categories`
   - Частота: weekly
   - Priority: 0.6

4. **Компании** (`/companies/[slug]`)
   - Источник: Strapi `/companies` с фильтром `isActive=true`
   - Частота: weekly
   - Priority: 0.5

#### Исключённые маршруты (резюме, компании, категории и приватные)

- `/resume/*` — создание/редактирование резюме
- `/dashboard/*` — личный кабинет соискателя
- `/company/*` — личный кабинет работодателя
- `/auth/callback` — OAuth callback (технический, не для индексации)
- `/api/*` — API-прокси и вебхуки
- `/upload/*` — служебные файлы


### 4. Сервис `getAllJobsForSitemap`

Потребуется новая функция или модификация существующей `getAllJobs`, так как текущая исключает премиум-вакансии. Для sitemap нужны **все активные вакансии** независимо от премиум-статуса.

```typescript
// services/jobs.service.ts (добавить)
export async function getAllJobsForSitemap() {
  // Запрос: filters[isActive][$eq]=true&pagination[pageSize]=1000&sort[0]=updatedAt:desc
  // Возвращает: Pick<Job, 'slug' | 'documentId' | 'updatedAt'>[]
}
```

### 5. Размер sitemap

Если вакансий > 50,000, потребуется `generateSitemaps()` для разбиения. На старте проекта это маловероятно, поэтому single sitemap.

## Mermaid: Поток генерации sitemap

```mermaid
flowchart TD
    A[GET /sitemap.xml] --> B{Next.js Route Handler}
    B --> C[fetchStaticRoutes]
    B --> D[fetchDynamicRoutes]
    
    D --> E[Strapi /cvs?filters[isActive][$eq]=true]
    D --> F[Strapi /blogs]
    D --> G[Strapi /categories]
    D --> H[Strapi /companies]
    
    E --> I[Map to /jobs/slug-id]
    F --> J[Map to /blog/slug]
    G --> K[Map to /categories/slug]
    H --> L[Map to /companies/slug]
    
    C --> M[Merge all entries]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N[Return XML sitemap]
```

## Шаги реализации

1. **(Опционально) Обновить `NEXT_PUBLIC_APP_URL`** в `.env.production`, если нет
2. **Создать `app/robots.ts`**:
   - Импорт `type MetadataRoute`
   - Определить rules с Disallow для приватных секций
   - Добавить sitemap ссылку с динамическим origin
3. **Создать `app/sitemap.ts`**:
   - Использовать `fetchAPI` для запросов к Strapi
   - Статические маршруты: массив с `url`, `lastModified`, `changeFrequency`, `priority`
   - Динамические вакансии: `fetchAPI<StrapiListResponse>` `/cvs` с populate slug, documentId, updatedAt
   - Динамические статьи блога: `fetchAPI<StrapiListResponse>` `/blogs` с populate slug, publishedAt
   - Динамические категории: `fetchAPI<StrapiListResponse>` `/categories`
   - Динамические компании: `fetchAPI<StrapiListResponse>` `/companies`
4. **Добавить/обновить функцию `getAllJobsForSitemap`** в `services/jobs.service.ts`
5. **Проверить сборку**: `next build && curl localhost:3000/robots.txt && curl localhost:3000/sitemap.xml`

## Зависимости

- `fetchAPI` уже существует в `lib/strapi-client.ts`
- Новых npm-пакетов не требуется
- Strapi API tokens уже настроены (read-token достаточно для sitemap)
