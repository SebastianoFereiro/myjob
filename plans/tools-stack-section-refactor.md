# Refactor: ToolsStackSection — динамические данные из Strapi

## Текущее состояние

[`ToolsStackSection`](components/tools-stack-section.tsx) использует **хардкоженный** массив `directions` с 6 записями, каждая содержит иконку Lucide, название, описание и количество вакансий.

## Цель

Заменить хардкод на реальные данные из Strapi:

- Агрегировать количество вакансий по категориям через `getCategoriesWithCounts()`
- Отобразить **первые 6 категорий** по убыванию количества вакансий
- Каждая карточка должна быть **ссылаемой** — переход на `/jobs?category={slug}`
- Сохранить дизайн карточки, используя description поле из Strapi для desc

## План изменений

### 1. [`components/tools-stack-section.tsx`](components/tools-stack-section.tsx)

**Изменения:**

- Удалить хардкоженный массив `directions` и импорты Lucide-иконок
- Удалить тип `Direction` и `LucideIcon` (больше не нужны)
- Заменить `function ToolsStackSection()` на асинхронную Server Component
- Внутри:
  - Вызвать `getCategoriesWithCounts()`
  - Отсортировать по `count` (desc)
  - Взять первые 6 (`.slice(0, 6)`)
  - Смаппить в карточки

**Структура карточки (дизайн сохранён):**

```
Card (asChild или Link внутри)
  a / Link href=/jobs?category={slug}#vacancies
    div.flex.items-center.justify-between
      div.flex.items-center.gap-4
        div.icon-placeholder — кружок с первой буквой названия (bg-background/70)
        div
          h3  — {category.name}
          p   — {category.description || slug}
      div
        span — {category.count}
        span — "вакансий"
```

**Визуальные изменения:**

- Блок иконки заменён на кружок с первой буквой названия категории (сохраняет визуальный баланс)
- Название и описание — из Strapi (`name`, `description`)
- Счётчик — из Strapi (`count`)
- Вся карточка обёрнута в `Link` из `next/link` на `/jobs?category={slug}#vacancies`

### 2. [`components/pattern-placeholder.tsx`](components/pattern-placeholder.tsx)

**Изменений не требуется.** `ToolsStackSection` сам будет фетчить данные.

## Поток данных

```
Strapi /api/categories?populate=*
  → categories.service.getCategories()
  → getCategoryCounts() (из jobs.service)
  → JobCategory[] с count
  → sort by count desc
  → slice(0, 6)
  → ToolsStackSection render
```

## Зависимости

- `getCategoriesWithCounts` из [`services/categories.service.ts`](services/categories.service.ts)
- `Link` из `next/link`
- Существующие UI-компоненты: `Card` из [`components/ui/card.tsx`](components/ui/card.tsx)

## Проверка

- После рефакторинга на странице должны отображаться реальные категории из Strapi, отсортированные по убыванию количества вакансий
- Клик по карточке ведёт на `/jobs?category={slug}`
- Если Strapi недоступен — возвращается пустой массив, секция не рендерится (или пустая)
