'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = redirectTo;
    }, 300);
    return () => clearTimeout(timer);
  }, [redirectTo]);

  return null;
}
