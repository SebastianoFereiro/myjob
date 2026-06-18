# План: Защита роутов dashboard / company / resume

## 1. Проблема

Сейчас все роуты `/dashboard/*`, `/company/*` и `/resume/submit` доступны без аутентификации.
`DashboardLayout` (Client Component) вызывает `authClient.useSession()`, но **не редиректит** при отсутствии сессии — просто показывает `"Пользователь"` вместо имени.

## 2. Инвентарь защищаемых роутов

| Путь                           | Роль    | Описание                |
| ------------------------------ | ------- | ----------------------- |
| `/dashboard`                   | user    | Список резюме           |
| `/dashboard/resume/[id]/edit`  | user    | Редактирование резюме   |
| `/dashboard/settings`          | user    | Настройки профиля       |
| `/resume/submit`               | user    | Создание резюме         |
| `/company/dashboard`           | company | Дашборд вакансий        |
| `/company/vacancies/new`       | company | Создание вакансии       |
| `/company/vacancies/[id]/edit` | company | Редактирование вакансии |
| `/company/settings`            | company | Настройки компании      |
| `/company/applicants`          | company | Отклики                 |

## 3. Архитектура защиты (3 слоя)

```mermaid
flowchart TD
    A[Request] --> B{middleware.ts}
    B -->|Protected route, no session| C[Redirect /auth/login]
    B -->|Public route| D[NextResponse.next]
    B -->|Protected route, has session| E[Server Layout]

    E --> F{app/dashboard/layout.tsx}
    E --> G{app/company/layout.tsx}

    F -->|no session / wrong role| H[Redirect /auth/login]
    F -->|session + role=user| I[Render DashboardLayout]

    G -->|no session / wrong role| J[Redirect /auth/login or /dashboard]
    G -->|session + role=company| K[Render DashboardLayout]

    I --> L[Client-side DashboardLayout]
    K --> L

    L --> M{useSession()}
    M -->|no session| N[Redirect /auth/login]
    M -->|has session| O[Render UI]
```

### Слой 1: Middleware (`middleware.ts`)

- Проверяет наличие сессии через `auth.api.getSession({ headers })` или парсинг cookie
- Редиректит на `/auth/login?callbackUrl=...` если сессии нет
- Пропускает публичные роуты: `/`, `/auth/*`, `/blog/*`, `/jobs/*`, `/categories/*`, `/companies/*`, `/contacts/*`, `/api/*`, `/_next/*`, `/favicon.ico`, `/images/*`
- **`/resume` пропускается, НО `/resume/submit` — защищён** (явная проверка в middleware)
- **Не проверяет роль** (это ответственность Server Layout)

### Слой 2: Server Layout (`app/dashboard/layout.tsx`, `app/company/layout.tsx`, `app/resume/submit/layout.tsx`)

- Server Component — вызывается ДО Client Component
- Использует `auth.api.getSession()` для проверки сессии и роли
- `/dashboard/*` — только `role === "user"`
- `/company/*` — только `role === "company"`
- `/resume/submit` — только `role === "user"`
- Редиректит при несоответствии роли

### Слой 3: Client-side fallback (`DashboardLayout`)

- `useSession()` показывает спиннер пока грузится сессия
- Если после загрузки сессии нет — редирект на `/auth/login`
- Страховка на случай если middleware/layout не сработали (например, при мутации кэша)

## 4. Пошаговый план реализации

### Шаг 1: `lib/auth-guard.ts`

Хелперы для серверной проверки аутентификации:

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/auth';

export async function getServerSession() {
  const h = await headers();
  return auth.api.getSession({ headers: h });
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) redirect('/auth/login');
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect(role === 'company' ? '/dashboard' : '/company/dashboard');
  }
  return session;
}
```

### Шаг 2: `middleware.ts` (корень проекта)

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/auth',
  '/blog',
  '/jobs',
  '/categories',
  '/companies',
  '/contacts',
  '/api',
  '/_next',
  '/favicon.ico',
  '/images',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (publicRoutes.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // /resume/* is public EXCEPT /resume/submit
  if (pathname.startsWith('/resume') && pathname !== '/resume/submit') {
    return NextResponse.next();
  }

  // Check protected routes
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/company') ||
    pathname === '/resume/submit'
  ) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
```

### Шаг 3: `app/dashboard/layout.tsx`

```typescript
import { requireRole } from '@/lib/auth-guard';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('user');
  return <>{children}</>;
}
```

### Шаг 4: `app/company/layout.tsx`

```typescript
import { requireRole } from '@/lib/auth-guard';

export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('company');
  return <>{children}</>;
}
```

### Шаг 5: `app/resume/submit/layout.tsx`

```typescript
import { requireRole } from '@/lib/auth-guard';

export default async function SubmitResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('user');
  return <>{children}</>;
}
```

### Шаг 6: Обновить `DashboardLayout` (Client Component)

Добавить:

- Состояние загрузки (`useSession().isPending`)
- Редирект при отсутствии сессии после загрузки
- `useEffect` с проверкой

```typescript
const { data: session, isPending } = authClient.useSession();

useEffect(() => {
  if (!isPending && !session) {
    router.push('/auth/login');
  }
}, [isPending, session, router]);

if (isPending) return <LoadingSkeleton />;
if (!session) return null; // редирект сработает в useEffect
```

## 5. Что НЕ входит в этот план

- Защита API роутов (`/api/strapi/...`) — они проксируют запросы к Strapi, auth там свой
- RBAC на уровне данных (какие резюме/вакансии видит конкретный user/company) — это отдельная задача
- Rate limiting — уже настроен в `better-auth`

## 6. Риски

1. **Edge Runtime**: `auth.api.getSession()` может не работать в middleware если используется Drizzle adapter с PostgreSQL (не-edge). Возможное решение: использовать `better-auth/cookies` для парсинга JWT напрямую, без обращения к БД.
2. **Next.js 15 async headers**: `headers()` — асинхронный, нужно `await`
3. **React 19**: все Server Components асинхронные по умолчанию — должно работать
4. **Cache**: после редиректа может потребоваться `router.refresh()` чтобы сбросить кэш
