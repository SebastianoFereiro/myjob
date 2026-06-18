# API Integration (Strapi) Skill

## Strapi REST API
- Базовый URL: `/api/[content-type]`
- Методы: GET (список/один), POST (создание), PUT (обновление), DELETE (удаление)
- Параметры запроса:
  - `populate`: жадная загрузка связей (`?populate=*`, `?populate[0]=author&populate[1]=comments`)
  - `filters`: фильтрация (`?filters[field][$eq]=value`, `?filters[field][$contains]=text`)
  - `sort`: сортировка (`?sort[0]=field:asc`, `?sort[1]=createdAt:desc`)
  - `pagination`: пагинация (`?pagination[page]=1&pagination[pageSize]=10`)
  - `publicationState`: превью черновиков (`?publicationState=preview`)

## Strapi GraphQL API
- Настройка плагина: `npm install @strapi/plugin-graphql`
- Endpoint: `/graphql`
- Типизированные запросы с автогенерируемой схемой
- Фрагменты для переиспользования

## Типизация ответов (TypeScript)
```typescript
// Типизация ответа Strapi
export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  }[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Пример использования
interface Article {
  title: string;
  content: string;
  publishedAt: string;
}

const response: StrapiResponse<Article> = await fetch('/api/articles?populate=*');
```

## Работа с медиа-файлами
- Формат ответа медиа: `{ id, name, alternativeText, caption, width, height, formats, url }`
- Загрузка файлов: `FormData` с полем `files`
- Обработка разных форматов изображений (thumbnail, small, medium, large)

## API Client для Next.js
```typescript
// lib/strapi-client.ts
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

export async function fetchAPI<T>(path: string, options = {}): Promise<StrapiResponse<T>> {
  const requestUrl = `${STRAPI_URL}/api${path}`;
  const response = await fetch(requestUrl, options);
  const data = await response.json();
  return data;
}
```

## Обработка ошибок
- Стандартный формат ошибок Strapi: `{ error: { status, name, message, details } }`
- HTTP статусы: 200 (OK), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- Retry logic для временных ошибок
- Error boundaries в Next.js

## Аутентификация
- Users-permissions plugin
- JWT токены: получение через `/api/auth/local`, использование в заголовке `Authorization: Bearer <token>`
- Защита маршрутов на фронтенде
