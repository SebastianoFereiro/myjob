# Дополнение к плану: Cron публикации/снятия + PremiumSection с кнопкой

## 1. Cron: auto-publish/unpublish

**Файл:** [`app/api/cron/auto-push/route.ts`](app/api/cron/auto-push/route.ts)

Добавить в существующий cron handler три стадии:

1. **Auto-publish** — найти CV где `datetime_start <= now` И `publishedAt == null` И `isActive == true` → `PUT { publishedAt: now }`
2. **Auto-unpublish** — найти CV где `datetime_finish < now` И `isActive == true` → `PUT { isActive: false }`
3. **Auto-push** — существующая логика (обновление `publishedAt` для `push_from/push_to`)

Результат: JSON с секциями `autoPublished`, `autoUnpublished`, `autoPushed`.

## 2. PremiumSection Client Component

**Новый файл:** [`components/jobs/premium-section.tsx`](components/jobs/premium-section.tsx)

Client Component (`'use client'`):
- Принимает проп `jobs: Job[]` (все premium вакансии)
- Показывает первые 6 карточек
- Кнопка "Показать ещё X вакансий" (или "Свернуть") под списком
- Использует `useState` для `showAll`

```tsx
'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { JobCard } from './job-card';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/jobs';

const INITIAL_COUNT = 6;

export function PremiumSection({ jobs }: { jobs: Job[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? jobs : jobs.slice(0, INITIAL_COUNT);
  const hiddenCount = jobs.length - INITIAL_COUNT;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-amber-600">Премиум вакансии</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map(job => <JobCard key={job.id} job={job} isPremium />)}
      </div>
      {hiddenCount > 0 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll(prev => !prev)}>
            {showAll ? 'Свернуть' : `Показать ещё ${hiddenCount} вакансий`}
          </Button>
        </div>
      )}
    </div>
  );
}
```

**Обновление:** [`components/jobs/job-list.tsx`](components/jobs/job-list.tsx) — заменить inline premium-секцию на `<PremiumSection jobs={premiumJobs} />`.

## 3. Файлы для изменений

| Файл | Действие |
|------|----------|
| [`app/api/cron/auto-push/route.ts`](app/api/cron/auto-push/route.ts) | Добавить auto-publish по datetime_start и auto-unpublish по datetime_finish |
| [`components/jobs/premium-section.tsx`](components/jobs/premium-section.tsx) | **НОВЫЙ** — Client Component с кнопкой "Показать ещё" |
| [`components/jobs/job-list.tsx`](components/jobs/job-list.tsx) | Заменить inline premium секцию на PremiumSection |
