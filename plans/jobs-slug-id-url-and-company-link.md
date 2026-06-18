# План: URL slug+id для вакансий + кнопка "Просмотреть компанию" + актуализация полей

## Текущее состояние

- URL карточки вакансии: `/jobs/{slug}` (например `/jobs/frontend-razrabotchik`)
- В карточке вакансии нет кнопки перехода на компанию
- В детальной странице вакансии название компании — обычный текст без ссылки
- Категория отображается в виде фильтр-ссылки (пилл), а не Badge

## Целевое состояние

1. URL: `/jobs/{slug}-{id}` где `id` — числовой Strapi record ID
2. Карточка: две кнопки в ряд `[Открыть вакансию] [Просмотреть компанию]`
3. Детальная страница: ссылка на компанию (текст названия + кнопка в сайдбаре)
4. Категория в карточке — через `Badge` компонент
5. Обновить все ссылки на вакансии

---

## Ключевое решение: `{id}` — числовой record.id, не documentId

Strapi 5 возвращает в каждой записи:

- `id: number` — первичный ключ БД (число)
- `documentId: string` — UUID для Document Service API

URL использует числовой `id`: `/jobs/frontend-razrabotchik-42`

Парсинг: `params.slug.split('-')` → последний сегмент = `id` (число)

---

## Изменения по файлам

### 1. [`services/jobs.service.ts`](services/jobs.service.ts) — 2 изменения

**a) `cvToJob()` — изменить приоритет id** (строка 204):

Сейчас:

```typescript
const id = String(record.documentId || record.id || record.slug || record.title);
```

Поменять на:

```typescript
const id = String(record.id ?? record.documentId ?? record.slug ?? record.title);
```

Теперь `Job.id` будет числовым ID из Strapi (как строка). `Job.documentId` остаётся отдельно.

**b) Добавить `getJobById()`** — поиск по числовому id через фильтр:

```typescript
export async function getJobById(id: string | number) {
  if (!id) return null;
  try {
    const params = buildPopulateParams();
    params.set('filters[id][$eq]', String(id));
    const response = await fetchAPI<StrapiListResponse<StrapiCVRecord>>(
      `${CV_ENDPOINT}?${params.toString()}`,
      { next: { revalidate: 1, tags: ['cv'] } }
    );
    const record = response.data[0];
    if (!record) return null;
    return cvToJob(unwrapStrapiRecord(record));
  } catch {
    return null;
  }
}
```

`getJobBySlug()` остаётся для обратной совместимости.

### 2. [`app/jobs/[slug]/page.tsx`](app/jobs/%5Bslug%5D/page.tsx) — парсинг slug+id

**Импорт:** `getJobBySlug` → `getJobById`

**Парсинг в `generateMetadata` и `JobDetailsPage`:**

```typescript
const rawSlug = params.slug; // "frontend-razrabotchik-42"
const parts = rawSlug.split('-');
const id = parts.pop()!; // "42" (последний сегмент)
const job = await getJobById(id);
```

### 3. [`app/jobs/[slug]/page.tsx`](app/jobs/%5Bslug%5D/page.tsx) — ссылка на компанию

**a) Текст названия компании** (строка 125-129) — заменить на `Link`:

```tsx
<Link
  href={`/companies/${job.company.slug}`}
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline"
>
  <Building2 className="size-4" />
  {job.company.name}
</Link>
```

**b) Кнопка в сайдбаре** — добавить под блоком "Информация":

```tsx
<div className="mt-5">
  <Button variant="outline" className="w-full" asChild>
    <Link href={`/companies/${job.company.slug}`}>
      <Building2 className="mr-2 size-4" />
      Просмотреть компанию
    </Link>
  </Button>
</div>
```

### 4. [`components/jobs/job-card.tsx`](components/jobs/job-card.tsx) — 3 изменения

**a) URL кнопки:** `/jobs/${job.slug}-${job.id}`

**b) Кнопка "Просмотреть компанию":**

```tsx
<CardContent className="space-y-4">
  {/* ... существующий контент ... */}

  <div className="flex gap-2">
    <Button asChild className="flex-1">
      <a href={`/jobs/${job.slug}-${job.id}`}>Открыть вакансию</a>
    </Button>
    <Button variant="outline" asChild className="flex-1">
      <a href={`/companies/${job.company.slug}`}>Просмотреть компанию</a>
    </Button>
  </div>
</CardContent>
```

**c) Категория — заменить фильтр-ссылку на Badge:**

```tsx
<div className="flex flex-wrap gap-2">
  {categories.map((cat) => (
    <Badge key={cat.slug} variant="secondary" className="rounded-full">
      {cat.name}
    </Badge>
  ))}
</div>
```

### 5. [`app/companies/[slug]/page.tsx`](app/companies/%5Bslug%5D/page.tsx) — ссылки

Строка 175: `href={`/jobs/${job.slug}`}` → `href={`/jobs/${job.slug}-${job.id}`}`

### 6. [`app/company/dashboard/CvList.tsx`](app/company/dashboard/CvList.tsx) — ссылка

Строка 168: `href={`/jobs/${vacancy.slug}`}` → `href={`/jobs/${vacancy.slug}-${vacancy.id}`}`

---

## Последовательность

| Шаг | Файл                               | Изменение                                     |
| --- | ---------------------------------- | --------------------------------------------- |
| 1   | `services/jobs.service.ts`         | Приоритет id в cvToJob + getJobById()         |
| 2   | `app/jobs/[slug]/page.tsx`         | Парсинг slug+id, getJobById                   |
| 3   | `app/jobs/[slug]/page.tsx`         | Ссылка на компанию + кнопка в сайдбаре        |
| 4   | `components/jobs/job-card.tsx`     | URL slug+id, кнопка компании, Badge категории |
| 5   | `app/companies/[slug]/page.tsx`    | Ссылки /jobs/{slug} → /jobs/{slug}-{id}       |
| 6   | `app/company/dashboard/CvList.tsx` | Ссылка /jobs/{slug} → /jobs/{slug}-{id}       |

---

## Проверка: числовой id доступен в данных

- `StrapiCVRecord.id` в [`services/jobs.service.ts:59`](services/jobs.service.ts:59) — `string | number`
- `CvVacancy.id` в [`types/cv.ts:57`](types/cv.ts:57) — `string`
- После смены приоритета в `cvToJob()`, `Job.id` будет содержать числовой id, а `Job.documentId` — строковый UUID

---

Утверждаешь? Если да — переключаюсь в Code mode.
