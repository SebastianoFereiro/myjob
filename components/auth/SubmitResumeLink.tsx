'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

import { authClient } from '@/lib/auth-client';

type SubmitResumeLinkProps = {
  children: React.ReactNode;
  className?: string;
};

// Сессия и хранилище не дают событий подписки: снимок читается один раз,
// а значение меняется только после монтирования на клиенте.
function subscribe() {
  return () => {};
}

/**
 * Умная ссылка «Разместить резюме»:
 * - неавторизованный пользователь -> /auth/login
 * - авторизованный -> личный кабинет (резюме размещается только из личного кабинета)
 */
export function SubmitResumeLink({ children, className }: SubmitResumeLinkProps) {
  const { data: session } = authClient.useSession();
  // false на сервере и при гидратации, true после монтирования на клиенте,
  // иначе href меняется между SSR и клиентом -> React hydration error.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const href = mounted && session ? '/dashboard' : '/auth/login';

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
