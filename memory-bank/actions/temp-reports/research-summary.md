# Research Summary: Переход с NestJS + Radix UI на Strapi 5 + shadcn/ui

**Дата исследования:** 2026-04-27
**Цель:** Определить полный объем изменений для замены стека технологий

---

## 1. Текущий стек (что нужно заменить)

### Обнаруженные упоминания технологий:

| Технология | Файл | Строки | Тип упоминания |
|------------|------|--------|----------------|
| **NestJS** | `AGENTS.md` | 22-35, 110, 122, 150, 215, 224 | Skill, архитектура, workflow, quick reference, stack |
| **NestJS** | `.roo/skills/rules/.coding-standards.md` | 8, 41-49, 76 | Project Stack, Backend section, структура проекта |
| **NestJS** | `.instructions.md` | 8, 41-49, 76 | Project Stack, Backend section, структура проекта |
| **Radix UI** | `AGENTS.md` | 90-103, 112, 136, 218, 224 | Skill, архитектура, workflow, quick reference, stack |
| **Radix UI** | `.roo/skills/rules/.coding-standards.md` | 10, 31, 36 | Project Stack, Frontend, UI/Styling |
| **Radix UI** | `.instructions.md` | 10, 31, 36 | Project Stack, Frontend, UI/Styling |
| **TypeORM** | `AGENTS.md` | 56-69, 112, 204, 224 | Skill, архитектура, security, stack |
| **TypeORM** | `.roo/skills/rules/.coding-standards.md` | 45 | Backend section |
| **TypeORM** | `.instructions.md` | 45 | Backend section |
| **Drizzle** | `.roo/skills/rules/.coding-standards.md` | 8, 52 | Project Stack (противоречие с AGENTS.md), Database section |
| **Drizzle** | `.instructions.md` | 8, 52 | Project Stack (противоречие с AGENTS.md), Database section |

---

## 2. Файлы конфигурации, требующие изменений

### Критические файлы (обязательные к обновлению):

1. **`AGENTS.md`** (основной файл навыков и агентов)
   - Строки 22-35: Заменить секцию "NestJS Backend" на "Strapi 5 Backend"
   - Строки 56-69: Обновить "PostgreSQL & TypeORM" (Strapi использует собственный ORM)
   - Строки 90-103: Заменить "Tailwind CSS + Radix UI" на "Tailwind CSS + shadcn/ui"
   - Строка 110: Обновить диаграмму архитектуры
   - Строка 112: Обновить связь Tailwind + Radix UI → Tailwind + shadcn/ui
   - Строки 122, 150: Обновить workflow для Strapi
   - Строка 215: Quick Reference - New API (NestJS → Strapi)
   - Строка 218: Quick Reference - UI (Tailwind Radix → Tailwind shadcn)
   - Строка 224: Обновить Stack definition

2. **`.roo/skills/rules/.coding-standards.md`** (стандарты кодирования)
   - Строка 8: NestJS with Drizzle → Strapi 5
   - Строка 10: Radix UI → shadcn/ui
   - Строки 41-49: Полностью переписать секцию Backend (NestJS → Strapi)
   - Строка 45: TypeORM → убрать или заменить на Strapi ORM
   - Строки 31, 36: Radix UI → shadcn/ui
   - Строка 52: Drizzle → Strapi database layer
   - Строка 76: apps/backend/ → Strapi structure

3. **`.instructions.md`** (инструкции проекта - дублирует .coding-standards.md)
   - Аналогичные изменения как в `.coding-standards.md`

4. **`.roomodes`** (конфигурация режимов)
   - Прямых упоминаний стека не найдено, но может потребоваться обновление customInstructions для режимов

---

## 3. Навыки (skills), требующие создания/обновления

### Текущее состояние папки `.roo/skills/`:
```
.roo/skills/
├── rules/
│   └── .coding-standards.md
└── usr-session-management/
    └── SKILL.md
```

**ВАЖНО:** Файлы навыков, упомянутые в `AGENTS.md`, НЕ СУЩЕСТВУЮТ:
- `skills/nestjs-backend.md` - НЕТ
- `skills/tailwind-radix-ui.md` - НЕТ
- `skills/database-postgres.md` - НЕТ
- `skills/next-js-react.md` - НЕТ
- `skills/api-integration.md` - НЕТ
- `skills/redis-caching.md` - НЕТ

### Требуемые действия по навыкам:

1. **Создать новый навык:** `skills/strapi-backend.md`
   - Описать структуру Strapi 5 проекта
   - API endpoints (Strapi auto-generated)
   - Content types, components, zones
   - Strapi admin panel customization
   - Authentication (Strapi users & permissions plugin)
   - Plugins and middleware

2. **Создать новый навык:** `skills/shadcn-ui.md`
   - Установка shadcn/ui в Next.js проект
   - Использование компонентов (Button, Dialog, DropdownMenu и т.д.)
   - Кастомизация через Tailwind
   - Отличия от Radix UI (shadcn/ui построен на Radix, но имеет другой подход к установке)

3. **Обновить навык:** `skills/database-postgres.md` (или создать `skills/strapi-database.md`)
   - Strapi использует собственный слой работы с БД
   - Lifecycle hooks вместо TypeORM entities
   - Strapi migrations vs TypeORM migrations

4. **Обновить навык:** `skills/api-integration.md`
   - Strapi REST API или GraphQL
   - Типизированные клиенты для Strapi API
   - Работа с медиа-файлами Strapi

5. **Навык `skills/redis-caching.md`** - может остаться без изменений (Redis используется аналогично)

6. **Навык `skills/next-js-react.md`** - обновить упоминания Radix UI → shadcn/ui

---

## 4. Архитектурные изменения (Strapi 5 + Next.js 16)

### Текущая архитектура (NestJS):
```
Next.js 16 (Frontend) ←→ NestJS (Backend)
  ↓                          ↓
Tailwind + Radix UI      TypeORM + PostgreSQL
  ↓                          ↓
  API Client              REST API
  ↓                          ↓
  Cache (Redis) ←→ Cache (Redis)
```

### Новая архитектура (Strapi 5):
```
Next.js 16 (Frontend) ←→ Strapi 5 (Headless CMS)
  ↓                          ↓
Tailwind + shadcn/ui    Strapi ORM + PostgreSQL
  ↓                          ↓
  API Client              REST/GraphQL API
  ↓                          ↓
  Cache (Redis)         Strapi Cache (Redis)
```

### Ключевые отличия интеграции:

1. **Strapi 5** - это готовый headless CMS с:
   - Админ-панелью для управления контентом
   - Автогенерируемыми API endpoints
   - Системой плагинов
   - Встроенной аутентификацией и авторизацией

2. **Взаимодействие Next.js + Strapi:**
   - Использование Strapi REST API или GraphQL
   - Fetch данных в Next.js Server Components напрямую из Strapi API
   - Типизация ответов Strapi API
   - Обработка медиа-файлов (Strapi upload plugin)

3. **shadcn/ui vs Radix UI:**
   - shadcn/ui построен на примитивах Radix UI
   - Компоненты копируются в проект (не npm-пакет)
   - Больше готовых стилей из коробки
   - Проще кастомизировать через Tailwind

---

## 5. Структура проекта (предполагаемая)

### Текущая структура (из документации):
```
project/
├── apps/
│   ├── frontend/              # Next.js application
│   └── backend/               # NestJS application
├── packages/                  # Shared packages
│   └── types/                # Shared TypeScript types
└── docker-compose.yml
```

### Новая структура (Strapi 5):
```
project/
├── apps/
│   ├── frontend/              # Next.js 16 (App Router)
│   │   ├── components/ui/     # shadcn/ui components (локально)
│   │   └── lib/              # API clients for Strapi
│   └── backend/               # Strapi 5 project
│       ├── src/
│       │   ├── api/          # Content types
│       │   ├── components/  # Strapi components
│       │   ├── plugins/      # Custom plugins
│       │   └── index.ts
│       └── config/           # Strapi configuration
├── packages/
│   └── types/                # Shared TypeScript types (Strapi response types)
└── docker-compose.yml        # + Strapi service
```

---

## 6. Чек-лист изменений

### Документация:
- [ ] Обновить `AGENTS.md` (заменить NestJS → Strapi 5, Radix UI → shadcn/ui)
- [ ] Обновить `.roo/skills/rules/.coding-standards.md`
- [ ] Обновить `.instructions.md`
- [ ] Проверить `.roomodes` на необходимость обновления

### Навыки (skills):
- [ ] Создать `skills/strapi-backend.md`
- [ ] Создать `skills/shadcn-ui.md`
- [ ] Обновить `skills/database-postgres.md` (или создать `skills/strapi-database.md`)
- [ ] Обновить `skills/api-integration.md` для Strapi API
- [ ] Обновить `skills/next-js-react.md` (убрать Radix UI)

### Конфигурация проекта:
- [ ] Настроить Strapi 5 проект в `apps/backend/`
- [ ] Установить и настроить shadcn/ui в `apps/frontend/`
- [ ] Обновить `docker-compose.yml` для Strapi
- [ ] Настроить типизацию для Strapi API responses

### Интеграция:
- [ ] Настроить CORS между Next.js и Strapi
- [ ] Создать API client для Strapi в Next.js
- [ ] Настроить аутентификацию (Strapi users-permissions + Next.js)
- [ ] Миграция данных (если есть существующие)

---

## 7. Риски и замечания

1. **Противоречие в документации:** `AGENTS.md` упоминает TypeORM, а `.coding-standards.md` и `.instructions.md` упоминают Drizzle. Нужно уточнить, что использовалось на самом деле.

2. **Отсутствие файлов навыков:** Навыки упомянуты в `AGENTS.md`, но файлы не созданы. Нужно создать их с нуля.

3. **Strapi 5 специфика:** Strapi - это CMS, а не просто backend framework. Это меняет подход к разработке:
   - Контент-менеджмент через админку
   - Меньше кастомного кода backend
   - Больше настройки через конфигурацию Strapi

4. **shadcn/ui подход:** Компоненты копируются в проект, а не импортируются как библиотека. Это меняет workflow разработки UI.

5. **Отсутствие исходного кода:** В workspace нет папок `apps/` или `packages/`. Проект находится на стадии конфигурации.

---

## 8. Рекомендации

1. **Приоритет обновления документации:** Начать с `AGENTS.md`, так как он является центральным файлом навыков.

2. **Создание навыков:** Создать файлы навыков параллельно с обновлением `AGENTS.md`.

3. **Strapi vs Custom Backend:** Учесть, что Strapi ускоряет разработку контентных проектов, но может ограничивать в сложной кастомной логике (потребуются custom plugins).

4. **shadcn/ui:** Рекомендуется использовать официальный CLI `shadcn` для добавления компонентов в Next.js проект.

---

**Исследование завершено.** Подробный отчет сохранен.
