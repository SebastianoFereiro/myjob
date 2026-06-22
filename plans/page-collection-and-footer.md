# Plan: Strapi Page Collection + Dynamic Footer

## 1. Schema — коллекция Page в Strapi

### Компоненты Dynamic Zone

Перед созданием коллекции `Page`, создать компоненты в Strapi Admin:

**page.hero** — Hero-блок
- `title` (string, required)
- `subtitle` (text)
- `image` (media, single)

**page.rich-text** — Текстовый блок
- `content` (richtext, required)

**page.faq** — FAQ / Вопрос-ответ
- `title` (string) — заголовок секции
- `items` (JSON) — массив `[{question, answer}]`

**page.contact-info** — Контактная информация
- `email` (string)
- `phone` (string)
- `address` (string)
- `work_hours` (string)

**page.pricing-table** — Таблица тарифов
- `title` (string)
- `items` (JSON) — массив `[{name, price, period, features[], highlighted, button_text, button_url}]`

**page.team** — Команда
- `title` (string)
- `members` (JSON) — массив `[{name, role, bio, photo_url}]`

**page.cta** — CTA / Призыв к действию
- `title` (string)
- `description` (text)
- `button_text` (string)
- `button_url` (string)

### Коллекция Page

```json
{
  "collectionName": "pages",
  "info": {
    "singularName": "page",
    "pluralName": "pages",
    "displayName": "Page",
    "description": "Статические страницы сайта с динамическими блоками"
  },
  "options": { "draftAndPublish": true },
  "attributes": {
    "title":        { "type": "string", "required": true, "maxLength": 200 },
    "slug":         { "type": "uid", "targetField": "title", "required": true },
    "meta_description": { "type": "text", "maxLength": 320 },
    "blocks": {
      "type": "dynamiczone",
      "components": [
        "page.hero", "page.rich-text", "page.faq",
        "page.contact-info", "page.pricing-table",
        "page.team", "page.cta"
      ]
    },
    "footer_group": {
      "type": "enumeration",
      "enum": ["seekers", "employers", "company", "bottom", "none"],
      "required": true, "default": "none"
    },
    "footer_order": { "type": "integer", "min": 0 },
    "footer_label": { "type": "string", "maxLength": 100 }
  }
}
```

---

## 2. Файлы для создания (в code mode)

### apps/backend/schemas/page.schema.json
Полный JSON схемы (как выше) — для ручного импорта или справки.

### apps/backend/strapi-schema.ts
Добавить `PageSchema` экспорт (TypeScript-описание).

### types/strapi-collections.ts
Добавить типы:
- `PageBlock` — union всех блоков
- `PageHeroBlock`, `PageRichTextBlock`, `PageFaqBlock`, `PageContactInfoBlock`, `PagePricingTableBlock`, `PageTeamBlock`, `PageCtaBlock`
- `Page` интерфейс

### services/pages.service.ts
- `getPageBySlug(slug): Promise<Page | null>`
- `getFooterPages(): Promise<Page[]>` — pages where `footer_group != 'none'`, sorted by `footer_group` + `footer_order`

### scripts/seed-pages.ts
Полный скрипт для POST запросов в Strapi. Содержимое:

**Страница: about (О проекте)**
- slug: about
- blocks: hero + rich-text + team + cta
- content: миссия, описание платформы, команда, ЧП МедиаШарм
- footer_group: company, footer_order: 0, footer_label: О проекте

**Страница: help (Помощь)**
- slug: help
- blocks: hero + faq + contact-info
- content: FAQ по использованию платформы
- footer_group: seekers, footer_order: 3, footer_label: Советы по поиску

**Страница: pricing (Тарифы)**
- slug: pricing
- blocks: hero + pricing-table + cta
- content: тарифные планы для работодателей
- footer_group: employers, footer_order: 2, footer_label: Тарифы

**Страница: terms (Пользовательское соглашение)**
- slug: terms
- blocks: rich-text
- content: полный текст соглашения с реквизитами ЧП МедиаШарм
- footer_group: bottom, footer_order: 0, footer_label: Пользовательское соглашение

**Страница: privacy (Политика конфиденциальности)**
- slug: privacy
- blocks: rich-text
- content: полный текст политики
- footer_group: bottom, footer_order: 1, footer_label: Политика конфиденциальности

**Страницы для footer (без своего URL, только ссылки):**
- slug: find-job → footer_group: seekers, order: 0, label: Найти работу, href: /jobs
- slug: submit-resume → footer_group: seekers, order: 1, label: Разместить резюме, href: /resume/submit
- slug: professions → footer_group: seekers, order: 2, label: Каталог профессий, href: /categories
- slug: post-vacancy → footer_group: employers, order: 0, label: Разместить вакансию, href: /company/dashboard
- slug: find-candidates → footer_group: employers, order: 1, label: Найти кандидатов, href: /companies
- slug: support → footer_group: employers, order: 3, label: Поддержка, href: /contacts
- slug: companies → footer_group: company, order: 1, label: Компании, href: /companies
- slug: contacts → footer_group: company, order: 2, label: Контакты, href: /contacts
- slug: help-main → footer_group: company, order: 3, label: Помощь, href: /help

### Страницы Next.js
```
app/about/page.tsx
app/help/page.tsx
app/pricing/page.tsx
app/terms/page.tsx
app/privacy/page.tsx
```

Каждая — async Server Component, фетчит через `getPageBySlug`, рендерит блоки.

### components/footer.tsx
- Убрать defaultColumns
- Принимать columns через props (фетчинг в layout или page)
- Либо сделать async component с прямым вызовом getFooterPages()

---

## 3. Юридическая информация (ЧП МедиаШарм)

Реквизиты для страниц terms и privacy:
- Полное наименование: Частное предприятие "МедиаШарм"
- УНП: (уточнить)
- Юридический адрес: (уточнить)
- Email: (уточнить)
- Телефон: (уточнить)

---

## 4. Этапы реализации

| Шаг | Действие | Файлы |
|-----|----------|-------|
| 1 | schema.json | `apps/backend/schemas/page.schema.json` |
| 2 | strapi-schema.ts — PageSchema | `apps/backend/strapi-schema.ts` |
| 3 | types/strapi-collections.ts — Page + блоки | `types/strapi-collections.ts` |
| 4 | services/pages.service.ts | `services/pages.service.ts` |
| 5 | scripts/seed-pages.ts | `scripts/seed-pages.ts` |
| 6 | Страницы: about, help, pricing, terms, privacy | `app/{about,help,pricing,terms,privacy}/page.tsx` |
| 7 | Обновить Footer | `components/footer.tsx` |
| 8 | Обновить navigation.ts | `app/data/navigation.ts` |
