# План: Коллекция region — типы, страницы, вывод в вакансиях

## Контекст

В Strapi 5 добавлена коллекция `region` (collectionName `regions`) со связями на CV и City:

- Поля: `title`, `description`, `slug` (uid), `text` (richtext), `SEO` (component `shared.seo`).
- Связи: `cvs` (1:M, mappedBy `region` в CV), `cities` (1:M, mappedBy `region` в City).

Задача на фронте:
1. Обновить типы.
2. Выводить region перед city в вакансии.
3. Отдельные страницы регионов `/regions/[slug]` (как `/cities/[slug]`).
4. Без отдельного UI-фильтра, но с элементом-переходом со страницы вакансии и из списка вакансий на карточку/страницу региона.

Страница региона: инфо региона + список вакансий региона (серверный фильтр `filters[region][slug]`, без UI-фильтра).

## Архитектура

```mermaid
graph LR
    A[Strapi region] -->|GET /api/regions| B[services/regions.service.ts]
    C[CV.region relation] -->|populate *| D[services/jobs.service.ts cvToJob]
    C -->|populate *| E[services/cv.service.ts mapStrapiCv]
    D --> F[Job.regionRef]
    E --> G[CvVacancy.region]
    B --> H[app/regions/[slug]/page.tsx]
    H --> I[JobList filters.region]
    F --> J[app/jobs/[slug]/page.tsx + job-card.tsx]
```

## Важные наблюдения по кодовой базе

- `populate=*` уже используется в [`services/jobs.service.ts`](services/jobs.service.ts:117) и [`services/cv.service.ts`](services/cv.service.ts:23) — relation `region` попадёт в ответ Strapi автоматически после добавления в Strapi, дополнительные populate не требуются.
- `Job` уже содержит строковое поле `region?: string` ([`types/strapi-collections.ts`](types/strapi-collections.ts:312)), нужно добавить `regionRef?: RegionRef`.
- `JobFilters.city` уже мапится в `filters[city][slug][$eq]` ([`services/jobs.service.ts`](services/jobs.service.ts:395)) — по аналогии добавить `region`.
- Поле SEO у region названо `SEO` (как у city) — маппинг как в [`services/cities.service.ts`](services/cities.service.ts:16).
- Схема CV на диске отсутствует (`apps/backend/api/` содержит только blog, city, page, resume) — CV создаётся в админке Strapi, relation `region` уже добавлен пользователем.

## Шаги реализации

### 1. Strapi-схемы (backend)
- В [`apps/backend/strapi-schema.ts`](apps/backend/strapi-schema.ts): добавить `RegionSchema` (collectionName `regions`, draftAndPublish, атрибуты title/description/slug/text/SEO + связи cvs и cities).
- В `CitySchema` добавить relation `region` (manyToOne -> api::region.region, inversedBy `cities`).
- В `CVSchema` добавить relation `region` (manyToOne -> api::region.region, inversedBy `cvs`).
- Обновить сводную таблицу отношений в конце файла.
- Создать `apps/backend/api/region/content-types/region/schema.json` (по содержимому из ТЗ).
- Обновить `apps/backend/api/city/content-types/city/schema.json` — добавить атрибут `region`.

### 2. Типы (frontend)
- [`types/strapi-collections.ts`](types/strapi-collections.ts): добавить `Region` (с `seo?: SeoMetadata | null`) и `RegionRef` (по образцу City/CityRef).
- В `Job` добавить `regionRef?: RegionRef`.
- В `JobFilters` добавить `region?: string`.
- [`types/cv.ts`](types/cv.ts): в `CvVacancy` добавить `region?: RegionRef | null`.

### 3. Сервисы
- Новый [`services/regions.service.ts`](services/regions.service.ts): `getRegions()` и `getRegionBySlug(slug)`, по образцу [`services/cities.service.ts`](services/cities.service.ts:26). Маппинг `SEO` — как в cities.service.ts.
- [`services/jobs.service.ts`](services/jobs.service.ts): добавить `region` в `StrapiCVRecord`, хелперы `extractRegionName`/`extractRegionRef`, маппинг `regionRef` в `cvToJob`, и в `buildFiltersParams` ветку `filters[region]` -> `filters[region][slug][$eq]`.
- [`services/cv.service.ts`](services/cv.service.ts): добавить `region` в `StrapiCvRecord` и маппинг `region: extractRef<RegionRef>(...)` в `mapStrapiCv`.

### 4. Страница региона
- Новый [`app/regions/[slug]/page.tsx`](app/regions/[slug]/page.tsx) по образцу [`app/cities/[slug]/page.tsx`](app/cities/[slug]/page.tsx:49):
  - `generateMetadata` через `extractSeoMetadata` (SEO из region).
  - Заголовок «Работа в {region.title}», описание, `<JobList filters={{ region: slug, ...sp }} basePath="/regions" contained regionSlug={slug} />`.
  - Markdown-текст `region.text`.

### 5. Компонент JobList
- [`components/jobs/job-list.tsx`](components/jobs/job-list.tsx): добавить prop `regionSlug?`, в `pageHref` ветку `/regions/{regionSlug}` для пагинации, кнопку сброса «Регион» (как «Город», строки 144-156).

### 6. Вывод region перед city
- [`app/jobs/[slug]/page.tsx`](app/jobs/[slug]/page.tsx): перед блоком city (строки 159-172) добавить ссылку на `/regions/{job.regionRef.slug}` (рендер при наличии `regionRef.slug`).
- [`components/jobs/job-card.tsx`](components/jobs/job-card.tsx): перед блоком city (строки 116-136) добавить ссылку на `/regions/{job.regionRef.slug}`.

### 7. Sitemap (рекомендуется)
- [`app/sitemap.ts`](app/sitemap.ts): добавить `fetchRegionPages()` по образцу `fetchCityPages()` и включить `/regions/{slug}` в sitemap.

### 8. Проверка
- `pnpm typecheck`, `pnpm lint`, `pnpm build`.

## Вне области (не входит в этот релиз)

- Отдельный UI-фильтр по региону в JobFiltersPanel.
- Выбор региона в формах CV ([`CvForm`](components/vacancy/CvForm.tsx), [`CvEditForm`](app/company/cvs/[id]/edit/CvEditForm.tsx)) — сейчас relation заполняется в админке Strapi.
- Сид-скрипт для регионов (при необходимости — по образцу [`scripts/seed-cities.ts`](scripts/seed-cities.ts)).
