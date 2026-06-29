# План интеграции Premium и Авто-поднятие вакансий

## 1. Общая концепция

Вводятся два платных продукта для работодателей:

- **Закрепление вакансии (Premium)** — вакансия отображается в закреплённой зоне с премиум-значком. Поля в Strapi: `premium_from`, `premium_to` (datetime).
- **Авто-поднятие вакансии (Auto-push)** — автоматическое обновление `publishedAt` по заданному расписанию. Поля в Strapi: `push_from`, `push_to` (datetime). Cron-задача раз в день обновляет `publishedAt`.

## 2. Текущая архитектура

```
Strapi Collection "cvs" (только schema.json, нет в strapi-schema.ts)
  ├── Стандартные поля: title, slug, description, requirements, conditions, salaryFrom, ...
  ├── Relations: company (M:1), category (M:1)
  └── Системные: createdAt, updatedAt, publishedAt

Frontend Types: types/cv.ts → CvVacancy, types/strapi-collections.ts → Job
Services: services/cv.service.ts, services/jobs.service.ts
Components: job-card.tsx, job-list.tsx, job-details.tsx, CvForm.tsx, CvEditForm.tsx
API Proxy: app/api/strapi/[...path]/route.ts
```

## 3. Схема данных (Strapi CV Collection)

Поля для добавления в Strapi (через admin panel или content-type builder):

| Поле | Тип | Описание |
|------|-----|----------|
| `premium_from` | datetime | Начало периода премиум-закрепления |
| `premium_to` | datetime | Окончание периода премиум-закрепления |
| `push_from` | datetime | Начало периода авто-поднятия |
| `push_to` | datetime | Окончание периода авто-поднятия |

## 4. Последовательность изменений

### Шаг 1: `apps/backend/strapi-schema.ts` — добавить схему CV

Сейчас в файле есть `VacancySchema` (не используется), но нет `CVSchema`. Нужно добавить описание CV-коллекции с новыми полями.

**Файл:** [`apps/backend/strapi-schema.ts`](apps/backend/strapi-schema.ts)

Добавить новую секцию `CVSchema` (или `VacancyCVSchema`) с атрибутами:
- Все существующие поля из текущей Strapi CV (title, slug, position, description, requirements, conditions, salaryFrom, salaryTo, currency, employmentType, location, city, level_job, experience_job, education_job, deadline, datetime_start, datetime_finish, sortOrder, isActive, userId)
- Новые поля: `premium_from` (datetime), `premium_to` (datetime), `push_from` (datetime), `push_to` (datetime)
- Relations: company (M:1), category (M:1)

### Шаг 2: `types/cv.ts` и `types/strapi-collections.ts` — обновить типы

**Файл:** [`types/cv.ts`](types/cv.ts)

Добавить в интерфейс `CvVacancy`:
```typescript
premium_from?: string | null;
premium_to?: string | null;
push_from?: string | null;
push_to?: string | null;
```

Добавить в `CvVacancyFormData` (опционально):
```typescript
premium_from?: string;
premium_to?: string;
push_from?: string;
push_to?: string;
```

**Файл:** [`types/strapi-collections.ts`](types/strapi-collections.ts)

Добавить в интерфейс `Job`:
```typescript
premium_from?: string | null;
premium_to?: string | null;
push_from?: string | null;
push_to?: string | null;
isPremium?: boolean;
```

### Шаг 3: `services/cv.service.ts` — обновить StrapiCvRecord и mapStrapiCv

**Файл:** [`services/cv.service.ts`](services/cv.service.ts)

1. Добавить поля `premium_from`, `premium_to`, `push_from`, `push_to` в `StrapiCvRecord`
2. Обновить `mapStrapiCv()` — добавить маппинг полей
3. Обновить `updateCv()` — добавить передачу новых полей в payload

### Шаг 4: `services/jobs.service.ts` — обновить StrapiCVRecord и cvToJob

**Файл:** [`services/jobs.service.ts`](services/jobs.service.ts)

1. Добавить премиум-поля в `StrapiCVRecord`
2. Обновить `cvToJob()` — маппинг с вычислением `isPremium`:
   ```typescript
   const now = new Date().toISOString();
   const isPremium = !!(record.premium_from && record.premium_to 
     && record.premium_from <= now && record.premium_to >= now);
   ```

### Шаг 5: API route для cron-задачи авто-поднятия

**Новый файл:** `app/api/cron/auto-push/route.ts`

```
GET /api/cron/auto-push
```

Логика:
1. Получить текущую дату/время
2. Запросить Strapi: `GET /api/cvs?filters[push_from][$lte]=now&filters[push_to][$gte]=now&filters[isActive][$eq]=true`
3. Для каждой найденной вакансии: `PUT /api/cvs/{documentId}` с `publishedAt: new Date().toISOString()`
4. Вернуть JSON-ответ с количеством обновлённых вакансий

**Важно:**
- Использовать `process.env.STRAPI_API_WRITE_TOKEN` для мутаций
- Добавить защиту через `Authorization: Bearer CRON_SECRET` (query param или header)

**Конфигурация cron (внешняя):**
На сервере настроить вызов `curl https://myjob.by/api/cron/auto-push` ежедневно в 8:00 UTC+3.

### Шаг 6: Логика сортировки premium + regular

**Файл:** [`services/cv.service.ts`](services/cv.service.ts) — `getAllCvs()`

Изменить стратегию сортировки с одного запроса на два этапа:

**Вариант A (2 запроса):**
1. Запрос 1: premium-вакансии (фильтр `premium_from[$lte]=now&premium_to[$gte]=now`, сортировка `premium_from:desc`)
2. Запрос 2: regular-вакансии (фильтр `premium_from[$null]=true OR premium_to[$lt]=now`, сортировка `publishedAt:desc`)
3. Объединить: `[...premium, ...regular]`

**Вариант B (1 запрос с пост-сортировкой):**
1. Получить все вакансии с сортировкой `publishedAt:desc`
2. В `mapStrapiCv()`/`cvToJob()` вычислить `isPremium`
3. На клиенте/в компоненте разделить на две группы

**Рекомендация:** Вариант A — более чистый для API, premium всегда сверху независимо от пагинации. Вариант B — проще, но premium могут "уехать" на 2-ю страницу.

**Итоговое решение:** Вариант A.
- `getPremiumCvs()` — отдельная функция для premium
- `getAllCvs()` — возвращает только regular (с фильтром `$or: [{premium_from: $null}, {premium_to: $lt: now}]`)
- На уровне `job-list.tsx` — объединяются два результата

Также для [`services/jobs.service.ts`](services/jobs.service.ts) аналогично:
- `getPremiumJobs()` — новая функция (либо расширение `getJobs()`)
- `getJobs()` — исключает premium (чтобы не было дублирования)

### Шаг 7: Разделение выдачи в job-list.tsx

**Файл:** [`components/jobs/job-list.tsx`](components/jobs/job-list.tsx)

- Выполнить два параллельных запроса: `getJobs(filters)` и `getPremiumJobs(filters)`
- Отобразить premium-зону (с заголовком "Премиум вакансии" и премиум-карточками)
- Отобразить regular-зону (обычный список)
- Premium-зона может показываться первой, до обычных вакансий

```tsx
// Схема компонента:
{premiumJobs.length > 0 && (
  <section className="mb-8">
    <h2 className="...">Премиум вакансии</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {premiumJobs.map(job => <JobCard key={job.id} job={job} isPremium />)}
    </div>
  </section>
)}

{/* Regular vacancies */}
<section>
  {jobs.map(job => <JobCard key={job.id} job={job} />)}
</section>
```

### Шаг 8: Premium-badge в job-card.tsx

**Файл:** [`components/jobs/job-card.tsx`](components/jobs/job-card.tsx)

- Добавить проп `isPremium?: boolean`
- При `isPremium = true`:
  - Показать бейдж "Premium" (золотой/синий) в заголовке карточки
  - Можно добавить границу/обводку другого цвета
  - Добавить иконку звезды или Sparkles

### Шаг 9: Формы (опционально — в зависимости от бизнес-логики)

Если premium/push поля управляются через админ-панель Strapi (а не через фронтенд-формы), этот шаг пропускается.

Если нужно управлять через фронтенд:
- [`components/vacancy/CvForm.tsx`](components/vacancy/CvForm.tsx) — добавить поля `premium_from`, `premium_to`, `push_from`, `push_to` (date input)
- [`app/company/cvs/[id]/edit/CvEditForm.tsx`](app/company/cvs/[id]/edit/CvEditForm.tsx) — аналогично

**Рекомендация:** Оставить управление премиум/авто-поднятием через Strapi Admin Panel + внешнюю платёжную систему. Формы создания/редактирования вакансий не трогать.

### Шаг 10: Детальная страница вакансии

**Файл:** [`app/jobs/[slug]/page.tsx`](app/jobs/[slug]/page.tsx)

- Добавить индикатор "Premium" рядом с названием вакансии (если `job.isPremium` или `job.premium_from` активен)
- Показывать даты премиум-периода

## 5. Схема потока данных

```mermaid
graph TD
    A[Strapi Admin Panel] -->|Установка premium_from/premium_to| B[(PostgreSQL - cvs table)]
    A -->|Установка push_from/push_to| B
    C[Cron: 8:00 UTC+3] -->|GET /api/cron/auto-push| D[Next.js Route Handler]
    D -->|GET /api/cvs?filters[push_from][$lte]=now| B
    D -->|PUT /api/cvs/{id} publishedAt=now| B
    E[Next.js RSC: jobs/page] -->|getPremiumJobs| B
    E -->|getJobs not-premium| B
    E -->|Premium section + Regular section| F[JobList Server Component]
    F --> G[JobCard premium+badge]
    F --> H[JobCard regular]
```

## 6. Риски и замечания

1. **Strapi 5 Document Service API:** При использовании PUT через Strapi API для обновления `publishedAt`, Strapi может перезаписывать поле через сервис публикации. Нужно тестировать.
2. **Пагинация premium:** Premium-вакансий обычно мало (до 10), поэтому отдельная пагинация не нужна. Если много — добавить пагинацию для premium-секции.
3. **Кеширование:** Тег `["cv"]` используется в `fetchAPI`. При обновлении через cron, тег не инвалидируется автоматически. Нужно либо использовать `revalidate: 0` для premium-запросов, либо добавить revalidation hook.
4. **Безопасность cron:** Маршрут `/api/cron/auto-push` должен быть защищён secret-ключом.
5. **Пересечение premium и push:** Если у вакансии одновременно активен premium и auto-push, она должна отображаться в premium-зоне и при этом её `publishedAt` будет обновляться кроном.

## 7. Файлы для изменений

| Файл | Действие |
|------|----------|
| `apps/backend/strapi-schema.ts` | Добавить CVSchema с новыми полями |
| `types/cv.ts` | Добавить premium_from/to, push_from/to в CvVacancy (и опционально form) |
| `types/strapi-collections.ts` | Добавить поля в Job |
| `services/cv.service.ts` | Обновить StrapiCvRecord, mapStrapiCv, updateCv |
| `services/jobs.service.ts` | Обновить StrapiCVRecord, cvToJob, добавить getPremiumJobs |
| `components/jobs/job-list.tsx` | Разделить на premium + regular секции |
| `components/jobs/job-card.tsx` | Добавить isPremium проп + premium badge |
| `app/api/cron/auto-push/route.ts` | **НОВЫЙ** — cron handler |
| `app/jobs/[slug]/page.tsx` | Premium индикатор на детальной странице |
