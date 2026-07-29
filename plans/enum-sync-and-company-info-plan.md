# План: Единый источник enum-опций + Информационный блок компании

## 1. Проблема

### 1.1. Enum'ы размазаны по проекту

Тип занятости (`employmentType`) определён в **5+ местах**:

| Файл | Строка | Что содержит |
|------|--------|-------------|
| `apps/backend/strapi-schema.ts` | 185 | Enum Vacancy: `['full-time', 'part-time', 'contract', 'internship', 'remote']` |
| `apps/backend/strapi-schema.ts` | 480 | Enum Resume: `['Полный день', 'Гибридный формат', 'Удаленный формат', 'Контракт']` |
| `apps/backend/strapi-schema.ts` | 686 | CV: `type: 'string'` (вообще не enum!) |
| `types/strapi-collections.ts` | 67 | `EmploymentType = 'full-time' \| 'part-time' \| ...` |
| `types/cv.ts` | 4 | `CvEmploymentType = 'Полная занятость' \| 'Частичная занятость' \| ...` |
| `types/resume.ts` | 3 | `EmploymentType = 'Полный день' \| 'Гибридный формат' \| ...` |
| `services/jobs.service.ts` | 178 | `employmentTypeMap` (ru -> en) |
| `services/jobs.service.ts` | 317 | `employmentTypeReverseMap` (en -> ru) |
| `components/jobs/search-filters.tsx` | 20 | `employmentOptions` массив для select |
| `app/companies/[slug]/page.tsx` | 205 | switch/case для отображения |

Аналогичная ситуация с `levelOptions`, `experienceOptions`, `educationOptions`.

### 1.2. CV.employmentType — `string`, не enum

В Strapi схема CV коллекции использует `type: 'string'` для `employmentType`, `level_job`, `experience_job`, `education_job`. Это значит:
- Админ может ввести любое значение
- Нет валидации на уровне Strapi
- Нельзя получить список допустимых значений через Content-Type API

### 1.3. Компания: нет ynp и address в сайдбаре

Поля `ynp` (УНП) и `address` уже маппятся в `companies.service.ts` в типы `StrapiCompanyRecord` и `CompanyPublic`, но не отображаются на странице компании.

---

## 2. Решение: Два направления

### Направление A: Единый источник enum-опций

Создать файл `lib/enum-options.ts` — единственный Source of Truth для всех enum-опций.

```typescript
// lib/enum-options.ts
// Единственный источник истины для enum-опций во всём проекте.

// === CV / Vacancy employment types (используется в CV коллекции) ===
export interface EnumOption {
  value: string;    // машинное значение (en)
  label: string;    // человеческое значение (ru)
}

export const EMPLOYMENT_OPTIONS: EnumOption[] = [
  { value: 'full-time',   label: 'Полная занятость' },
  { value: 'part-time',   label: 'Частичная занятость' },
  { value: 'contract',    label: 'Проектная работа' },
  { value: 'internship',  label: 'Стажировка' },
  { value: 'remote',      label: 'Удаленно' },
] as const;

export const LEVEL_OPTIONS: EnumOption[] = [
  { value: 'top',         label: 'Топ-менеджмент' },
  { value: 'middle',      label: 'Руководители среднего звена' },
  { value: 'specialist',  label: 'Специалисты' },
  { value: 'worker',      label: 'Рабочий персонал' },
  { value: 'junior',      label: 'Начинающие специалисты' },
  { value: 'intern',      label: 'Стажеры' },
] as const;

export const EXPERIENCE_OPTIONS: EnumOption[] = [
  { value: 'none',        label: 'Нет опыта' },
  { value: '1-3',         label: 'От 1 года до 3 лет' },
  { value: '3-5',         label: 'От 3 до 5 лет' },
  { value: '5+',          label: 'Более 5 лет' },
] as const;

export const EDUCATION_OPTIONS: EnumOption[] = [
  { value: 'none',            label: 'Не требуется' },
  { value: 'basic',           label: 'Базовое' },
  { value: 'secondary',       label: 'Среднее' },
  { value: 'specialized',     label: 'Средне специальное' },
  { value: 'vocational',      label: 'Профессионально-техническое' },
  { value: 'higher',          label: 'Высшее' },
] as const;

// === Resume employment types (отдельный enum) ===
export const RESUME_EMPLOYMENT_OPTIONS: EnumOption[] = [
  { value: 'full-day',     label: 'Полный день' },
  { value: 'hybrid',       label: 'Гибридный формат' },
  { value: 'remote',       label: 'Удаленный формат' },
  { value: 'contract',     label: 'Контракт' },
] as const;

// === Вспомогательные функции ===
export function getOptionLabel(options: readonly EnumOption[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function getOptionValue(options: readonly EnumOption[], label: string): string {
  return options.find((o) => o.label === label)?.value ?? label;
}

export function getOptionsMap(options: readonly EnumOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

export function getReverseOptionsMap(options: readonly EnumOption[]): Record<string, string> {
  return Object.fromEntries(options.map((o) => [o.label, o.value]));
}
```

### Направление B: Strapi Schema — CV поля в enum

Обновить `apps/backend/strapi-schema.ts`, CV коллекция:

```typescript
// Было:
employmentType: {
  type: 'string',
  required: false,
  maxLength: 100,
},

// Стало:
employmentType: {
  type: 'enumeration',
  enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
  required: false,
},
```

Аналогично для `level_job`, `experience_job`, `education_job`.

**Важно:** enum-значения должны совпадать с `value` из `lib/enum-options.ts`.

### Направление C: Company info — ynp и address

---

## 3. Пошаговый план реализации

### Step 1: Создать `lib/enum-options.ts`

- [ ] Создать файл со всеми enum-опциями (EMPLOYMENT_OPTIONS, LEVEL_OPTIONS, EXPERIENCE_OPTIONS, EDUCATION_OPTIONS, RESUME_EMPLOYMENT_OPTIONS)
- [ ] Добавить вспомогательные функции (getOptionLabel, getOptionValue, getOptionsMap, getReverseOptionsMap)

### Step 2: Обновить Strapi schema (`apps/backend/strapi-schema.ts`)

- [ ] CV.employmentType: `'string'` -> `'enumeration'` с enum из EMPLOYMENT_OPTIONS
- [ ] CV.level_job: `'string'` -> `'enumeration'` с enum из LEVEL_OPTIONS
- [ ] CV.experience_job: `'string'` -> `'enumeration'` с enum из EXPERIENCE_OPTIONS
- [ ] CV.education_job: `'string'` -> `'enumeration'` с enum из EDUCATION_OPTIONS
- [ ] CV.currency: `'string'` -> `'enumeration'` с enum `['BYN', 'USD', 'EUR']`

### Step 3: Обновить типы

- [ ] `types/cv.ts` — импортировать типы из `lib/enum-options.ts` вместо хардкода:

```typescript
import type { EMPLOYMENT_OPTIONS, LEVEL_OPTIONS, EXPERIENCE_OPTIONS, EDUCATION_OPTIONS } from '@/lib/enum-options';

export type CvEmploymentType = (typeof EMPLOYMENT_OPTIONS)[number]['value'];
export type CvLevelJob = (typeof LEVEL_OPTIONS)[number]['value'];
export type CvExperienceJob = (typeof EXPERIENCE_OPTIONS)[number]['value'];
export type CvEducationJob = (typeof EDUCATION_OPTIONS)[number]['value'];
```

- [ ] `types/resume.ts` — аналогично для RESUME_EMPLOYMENT_OPTIONS
- [ ] `types/strapi-collections.ts` — EmploymentType вывести из EMPLOYMENT_OPTIONS

### Step 4: Обновить сервисы

- [ ] `services/jobs.service.ts`:
  - Удалить `employmentTypeMap` (строка 178)
  - Удалить `employmentTypeReverseMap` (строка 317)
  - Удалить `normalizeEmploymentType` функцию
  - Заменить на импорт из `lib/enum-options.ts`:

```typescript
import { getOptionLabel, getOptionsMap, getReverseOptionsMap } from '@/lib/enum-options';
import { EMPLOYMENT_OPTIONS } from '@/lib/enum-options';

// Вместо normalizeEmploymentType:
function normalizeEmploymentType(value?: string | null): EmploymentType {
  if (!value) return 'full-time';
  const map = getReverseOptionsMap(EMPLOYMENT_OPTIONS);
  return (map[value] as EmploymentType) ?? 'full-time';
}

// Вместо employmentTypeReverseMap[filters.type]:
const reverseMap = getOptionsMap(EMPLOYMENT_OPTIONS);
params.set('filters[employmentType][$eq]', reverseMap[filters.type as EmploymentType] || filters.type);
```

### Step 5: Обновить компоненты

- [ ] `components/jobs/search-filters.tsx` — заменить `employmentOptions` на импорт из `lib/enum-options.ts`:

```typescript
import { EMPLOYMENT_OPTIONS } from '@/lib/enum-options';

// Было:
const employmentOptions: Array<{ value: EmploymentType | ''; label: string }> = [
  { value: '', label: 'Любой формат' },
  { value: 'full-time', label: 'Полная занятость' },
  ...
];

// Стало:
import { EMPLOYMENT_OPTIONS } from '@/lib/enum-options';
// employmentOptions для select строится как:
// [{ value: '', label: 'Любой формат' }, ...EMPLOYMENT_OPTIONS]
```

- [ ] `app/companies/[slug]/page.tsx` — заменить switch/case на `getOptionLabel`:

```typescript
import { getOptionLabel, EMPLOYMENT_OPTIONS } from '@/lib/enum-options';

// Было (строка 205-213):
{job.employmentType === 'full-time' ? 'Полная занятость' : ...}

// Стало:
{getOptionLabel(EMPLOYMENT_OPTIONS, job.employmentType)}
```

### Step 6: Обновить сайдбар компании

- [ ] `app/companies/[slug]/page.tsx` — добавить ynp и address в блок "Информация" (после siteUrl, до location):

```tsx
{/* Сайдбар: информация */}
{company.ynp && (
  <div className="flex items-start gap-3">
    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">УНП</p>
      <p className="font-medium">{company.ynp}</p>
    </div>
  </div>
)}
{company.address && (
  <div className="flex items-start gap-3">
    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
    <div>
      <p className="text-sm text-muted-foreground">Адрес</p>
      <p className="font-medium">{company.address}</p>
    </div>
  </div>
)}
```

- [ ] Убедиться, что `address` есть в Strapi CompanySchema. Если нет — добавить:

```typescript
// В apps/backend/strapi-schema.ts, CompanySchema.attributes:
address: {
  type: 'string',
  required: false,
  maxLength: 300,
},
```

### Step 7: Синхронизация с Strapi

- [ ] После обновления strapi-schema.ts — применить изменения в админке Strapi:
  - CV: employmentType, level_job, experience_job, education_job, currency — пересоздать поля как enumeration
  - Company: добавить поле address (если нет)

---

## 4. Схема зависимостей

```mermaid
flowchart TD
    A[lib/enum-options.ts<br/>Единый источник] --> B[types/cv.ts]
    A --> C[types/resume.ts]
    A --> D[types/strapi-collections.ts]
    A --> E[services/jobs.service.ts]
    A --> F[components/jobs/search-filters.tsx]
    A --> G[app/companies/[slug]/page.tsx]

    H[apps/backend/strapi-schema.ts<br/>CV поля: string -> enumeration] --> I[Strapi Admin]
    I --> J[Валидация на уровне Strapi]
    I --> K[Content-Type API]

    L[Company: add address field] --> M[companies.service.ts]
    M --> N[app/companies/[slug]/page.tsx<br/>сайдбар]
```

## 5. Порядок выполнения

```
Step 1: lib/enum-options.ts (создать)
Step 2: apps/backend/strapi-schema.ts (обновить CV enum'ы)
Step 3: types/cv.ts, types/resume.ts, types/strapi-collections.ts (обновить)
Step 4: services/jobs.service.ts (убрать хардкод)
Step 5: components/jobs/search-filters.tsx (импорт из enum-options)
Step 6: app/companies/[slug]/page.tsx (сайдбар + employmentType)
Step 7: Синхронизация с админкой Strapi
```

Каждый шаг атомарен и может быть выполнен независимо.
