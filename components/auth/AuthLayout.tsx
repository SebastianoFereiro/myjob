'use client';

import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  mode: 'login' | 'register';
}

export function AuthLayout({ children, title, subtitle, mode }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Image src="/images/logo-by.png" alt="MyJOB" width={161} height={26} className="mx-auto h-8 w-auto" />
          </Link>
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}

          <div className="mt-6">{children}</div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Войти
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
