# shadcn/ui Components Skill

## Установка в Next.js проект
- Инициализация: `npx shadcn@latest init`
- Настройка tailwind.config.ts
- Добавление компонентов: `npx shadcn@latest add button`

## Использование компонентов
- Button, Dialog, DropdownMenu, Input, Select, Card, etc.
- Импорт из `@/components/ui/`
- Кастомизация через className

## Отличия от Radix UI
- Компоненты копируются в проект (не npm package)
- Готовые стили из коробки
- Проще кастомизировать через Tailwind
- Построен на Radix UI primitives

## CVA (Class Variance Authority)
- Создание вариантов компонентов
- buttonVariants, cardVariants и т.д.

## Dark Mode
- Настройка через next-themes
- ThemeProvider
- Переключатель темы

## Доступность (Accessibility)
- Все компоненты соответствуют стандартам WAI-ARIA
- Клавиатурная навигация
- Скринридеры

## Примеры использования
```tsx
import { Button } from "@/components/ui/button"

export function MyComponent() {
  return (
    <Button variant="outline" size="lg">
      Нажми меня
    </Button>
  )
}
```

## Интеграция с формами
- Использование с react-hook-form
- Валидация с zod
- Стилизация ошибок
