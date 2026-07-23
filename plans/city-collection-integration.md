# План интеграции коллекции City (Strapi 5 + Next.js 15)

## Текущее состояние

- Поле `city` в CV — `string`, хранится как текст в Strapi
- В формах — `<Input>` для ручного ввода города
- В фильтрах — используется `location` (свободный текст)
- Тип `Job.city` — `string | undefined`

## Цель

Заменить `city: string` на relation `city -> City` (Strapi collection), где City — отдельная коллекция с SEO, slug, описанием.

---

## Routing scheme

| URL | Когда используется |
|-----|-------------------|
| `/cities/minsk` | Фильтр только по городу (dedicated page) |
| `/categories/it?city=minsk` | Фильтр по городу + категории (city как searchParam) |
| `/jobs?city=minsk` | Фильтр по городу + query/type и т.д. (city как searchParam) |

---

## Этап 1: Strapi Schema (бэкенд)

### 1.1 Новая коллекция City

Создать: `apps/backend/api/city/content-types/city/schema.json`

```json
{
  "kind": "collectionType",
  "collectionName": "cities",
  "info": {
    "singularName": "city",
    "pluralName": "cities",
    "displayName": "City"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "slug": { "type": "uid" },
    "text": { "type": "richtext" },
    "SEO": {
      "type": "component",
      "component": "shared.seo",
      "repeatable": false
    },
    "cvs": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::cv.cv",
      "mappedBy": "city"
    }
  }
}
```

### 1.2 Обновить CV schema

В `apps/backend/api/cv/content-types/cv/schema.json` заменить `city: string` на relation:

```json
"city": {
  "type": "relation",
  "relation": "manyToOne",
  "target": "api::city.city",
  "inversedBy": "cvs"
}
```

### 1.3 Обновить strapi-schema.ts

- Добавить `CitySchema` export
- В `CVSchema.attributes` заменить `city: { type: 'string' }` на relation

---

## Этап 2: Типизация (фронтенд)

### 2.1 Добавить City + CityRef в types/strapi-collections.ts

```typescript
export interface City {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string | null;
  text: string | null;
  SEO: SeoMetadata | null;
  count?: number;
}

export interface CityRef {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
}
```

### 2.2 Обновить types/cv.ts

- `CvVacancy.city`: `string | null` -> `CityRef | null`
- `CvVacancyFormData`: убрать `city: string`, добавить `cityDocumentId?: string | null`

### 2.3 Обновить Job в types/strapi-collections.ts

- `city?: string` — остаётся для отображения (название города)
- Добавить `cityRef?: CityRef` — полный объект

### 2.4 Обновить JobFilters

- Добавить `city?: string` (slug города)

---

## Этап 3: Сервис cities.service.ts

Создать `services/cities.service.ts`:

- `getCities()` — список всех городов
- `getCityBySlug(slug)` — город по slug с populate SEO
- `getCitiesWithCounts()` — города с количеством вакансий

```typescript
type StrapiCityRecord = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  description?: string;
  text?: string;
  SEO?: SeoMetadata | null;
};
```

---

## Этап 4: Обновить CV service

Файл: `services/cv.service.ts`

- `StrapiCvRecord.city`: `string | null` -> `Record<string, unknown> | null`
- `mapStrapiCv()`: `city: extractRef<CityRef>(record.city)`
- `createCv()`: `payload.city = data.cityDocumentId`
- `updateCv()`: `payload.city = data.cityDocumentId`

---

## Этап 5: Обновить Jobs service

Файл: `services/jobs.service.ts`

- `StrapiCVRecord.city`: `string | null` -> `Record<string, unknown> | null | string`
- `cvToJob()`: если city — объект, развернуть в `job.city = city.title`, `job.cityRef = cityRef`
- `buildPopulateParams()`: добавить `populate[city]` = `*`
- `buildFiltersParams()`: добавить `filters.city`:

```typescript
if (filters.city) {
  params.set("filters[city][slug][$eq]", filters.city);
}
```

- `getPremiumJobs()`, `getJobBySlug()`: добавить populate city

---

## Этап 6: Обновить формы

### 6.1 CvForm (новая вакансия) — `components/vacancy/CvForm.tsx`
- Заменить `<Input id="city">` на `<Select>` с городами
- Загружать города через `fetch('/api/strapi/cities')` в `useEffect`
- `formData.city` -> `formData.cityDocumentId`

### 6.2 CvEditForm (редактирование) — `app/company/cvs/[id]/edit/CvEditForm.tsx`
- Аналогично: input -> select
- `formData.city` -> `formData.cityDocumentId`

---

## Этап 7: Фильтрация по городу

### 7.1 search-filters.tsx
- Добавить `<select>` для города (после селекта категории)
- Принимать `cities` проп
- **Логика URL**:
  - Если выбрана категория + город -> `/categories/${category}?city=${city}`
  - Если только город -> `/cities/${city}`
  - Если только категория -> `/categories/${category}`
  - Если ничего -> `/jobs`

### 7.2 job-filters-panel.tsx
- Принимать `cities: CityRef[]` проп
- Передавать в `SearchFilters`

### 7.3 job-list.tsx
- Принимать `citySlug` проп
- Пробрасывать `filters.city` в `getJobs`
- Отображать кнопку "Сбросить город" при активном city
- `pageHref()`: учитывать `city`

### 7.4 JobFilters в types/strapi-collections.ts
```typescript
city?: string;
```

---

## Этап 8: Страница города `/cities/[slug]`

Создать `app/cities/[slug]/page.tsx` (по аналогии с `app/categories/[category]/page.tsx`):

```typescript
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    query?: string;
    type?: string;
    level?: string;
    experience?: string;
    education?: string;
    position?: string;
    page?: string;
  }>;
};
```

**generateMetadata:**
- Загрузить `getCityBySlug(slug)`
- `extractSeoMetadata({ SEO: city.SEO, fallbackTitle: city.title, ... })`

**Page:**
- Загрузить `getCityBySlug(slug)` — если null -> `notFound()`
- Загрузить `getCategories()` для фильтра
- Рендерить `JobList` с `filters: { city: slug }`
- SEO-заголовок: "Работа в [City.title] | MyJOB"
- RichText блок с `city.text`

---

## Этап 9: Sitemap

В `app/sitemap.ts`:

```typescript
async function fetchCityPages(): Promise<SitemapEntry[]> {
  // GET /cities с полями slug, updatedAt
  // Вернуть /cities/${slug}
}

export default async function sitemap() {
  return [...staticPages, ...jobPages, ...blogPages, ...categoryPages, ...companyPages, ...cityPages];
}
```

- Приоритет: 0.6
- Частота: weekly

---

## Этап 10: Скрипт миграции

Создать `scripts/seed-cities.ts`:
- Создать города из `app/data/belarus-cities.ts`
- Для каждого: title, slug, description (регион)
- Найти все CV с `city` (string), сопоставить с City по title (case-insensitive), установить relation

---

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `apps/backend/api/city/content-types/city/schema.json` | Создать |
| `apps/backend/api/cv/content-types/cv/schema.json` | Изменить city: string -> relation |
| `apps/backend/strapi-schema.ts` | Добавить CitySchema, обновить CVSchema |
| `types/strapi-collections.ts` | Добавить City, CityRef; обновить JobFilters |
| `types/cv.ts` | City -> CityRef, cityDocumentId |
| `services/cities.service.ts` | Создать |
| `services/cv.service.ts` | City как relation |
| `services/jobs.service.ts` | City populate, фильтр city.slug |
| `components/vacancy/CvForm.tsx` | Input -> Select city |
| `app/company/cvs/[id]/edit/CvEditForm.tsx` | Input -> Select city |
| `components/jobs/job-filters-panel.tsx` | Пробросить cities |
| `components/jobs/search-filters.tsx` | Селект города + логика URL |
| `components/jobs/job-list.tsx` | city фильтр, кнопка сброса |
| `app/cities/[slug]/page.tsx` | Создать |
| `app/sitemap.ts` | fetchCityPages |
| `scripts/seed-cities.ts` | Создать |
