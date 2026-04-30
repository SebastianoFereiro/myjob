# Tech Context

## Текущий стек технологий (обновлено 2026-04-27)

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4+
- **UI Components:** shadcn/ui (built on Radix UI primitives)
- **Language:** TypeScript (strict mode)
- **State Management:** React hooks, SWR/React Query (для клиентских компонентов)

### Backend
- **CMS:** Strapi 5 (Headless CMS)
- **ORM:** Strapi ORM (автоматическая генерация схемы БД)
- **Database:** PostgreSQL
- **Cache:** Redis (кеширование запросов, сессии)
- **API:** REST API (автогенерируемые endpoints), GraphQL (опционально)
- **Authentication:** Users-permissions plugin (JWT)

### Архитектура
```
Next.js 16 (Frontend) ←→ Strapi 5 (Headless CMS)
  ↓                          ↓
Tailwind + shadcn/ui    Strapi ORM + PostgreSQL
  ↓                          ↓
  API Client              REST/GraphQL API
  ↓                          ↓
  Cache (Redis)         Strapi Cache (Redis)
```

### Ключевые изменения (2026-04-27)
1. **NestJS → Strapi 5**: Переход на Headless CMS для ускорения разработки контентных функций
2. **Radix UI → shadcn/ui**: Переход на готовые стилизованные компоненты, которые копируются в проект
3. **TypeORM/Drizzle → Strapi ORM**: Использование встроенного слоя Strapi для работы с БД
4. **Сохранение**: Next.js 16, PostgreSQL, Redis, Tailwind CSS

### Project Structure
```
project/
├── apps/
│   ├── frontend/              # Next.js application
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── styles/
│   │   └── public/
│   └── backend/               # Strapi 5 project
│       ├── src/
│       │   ├── api/          # Content types
│       │   ├── components/  # Strapi components
│       │   ├── plugins/      # Custom plugins
│       │   └── index.ts
│       └── config/           # Strapi configuration
├── packages/                  # Shared packages
│   └── types/                # Shared TypeScript types
└── docker-compose.yml        # Local development setup
```

### Навыки (Skills)
- `skills/strapi-backend.md` - документация по Strapi 5
- `skills/shadcn-ui.md` - документация по shadcn/ui
- `skills/strapi-database.md` - работа с Strapi ORM и PostgreSQL
- `skills/api-integration.md` - интеграция с Strapi API
- `skills/next-js-react.md` - Next.js 16 + React + shadcn/ui
- `skills/redis-caching.md` - кеширование в Redis

### Стандарты кода
- Язык комментариев: Русский (согласно AGENTS.md)
- Naming Conventions: kebab-case (files), PascalCase (components), camelCase (functions)
- TypeScript strict mode
- Доступность (WCAG) для UI компонентов

---

## Главная страница вакансий (создана 2026-04-27)

### Описание
Реализована главная страница сайта с вакансиями, включающая:
- Баннер (Server Component)
- Поиск и фильтры (Client Component с URL-параметрами)
- Список вакансий с пагинацией (Server Component)
- Форма подписки (Client Component с валидацией)

### Структура файлов
```
app/
├── page.tsx                    # Главная страница (Server Component)
components/
├── Banner.tsx                  # Баннер (Server Component)
├── jobs/
    ├── SearchFilters.tsx       # Поиск и фильтры (Client Component)
    ├── JobList.tsx             # Список вакансий (Server Component)
    ├── SubscribeForm.tsx       # Форма подписки (Client Component)
    └── JobPageClient.tsx      # Клиентская обертка (не используется в текущей реализации)
```

### Технические решения
1. **Server/Client Components**: Страница `page.tsx` — Server Component, интерактивные элементы вынесены в Client Components
2. **URL-параметры**: Поиск и фильтры используют `useSearchParams` из `next/navigation` для сохранения состояния в URL
3. **Моковые данные**: Пока API Strapi не настроен, используются моковые данные в `JobList.tsx`
4. **Валидация**: Форма подписки имеет клиентскую валидацию email через регулярное выражение
5. **Адаптивность**: Используются Tailwind классы для мобильной и десктопной версий

### Используемые технологии на странице
- **Tailwind CSS**: Для всех стилей (gradient, grid, flexbox, responsive classes)
- **TypeScript**: Строгая типизация пропсов и состояний
- **React Hooks**: useState, useEffect, useCallback в клиентских компонентах
- **Next.js Navigation**: useSearchParams, useRouter, usePathname для работы с URL

### Статус
- ✅ Баннер реализован
- ✅ Поиск и фильтры работают с URL-параметрами
- ✅ Список вакансий с пагинацией (на моковых данных)
- ✅ Форма подписки с валидацией
- ⏳ Ожидается подключение к API Strapi
- ⏳ Ожидается добавление тестов (нужны devDependencies: jest, @testing-library/react)
