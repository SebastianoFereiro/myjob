'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { authClient } from '@/lib/auth-client';

type SubmitResumeLinkProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Умная ссылка «Разместить резюме»:
 * - неавторизованный пользователь -> /auth/login
 * - авторизованный -> личный кабинет (резюме размещается только из личного кабинета)
 */
export function SubmitResumeLink({ children, className }: SubmitResumeLinkProps) {
  const { data: session } = authClient.useSession();
  // Флаг mounted гарантирует совпадение серверного и первого клиентского рендера,
  // иначе href меняется при гидратации -> React hydration error.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const href = mounted && session ? '/dashboard' : '/auth/login';

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
