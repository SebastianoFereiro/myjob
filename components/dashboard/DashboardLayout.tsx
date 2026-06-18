'use client';

import { useEffect } from 'react';
import { Loader2, LogOut, Menu, Settings, UserCircle } from 'lucide-react';
import { BriefcaseBusiness, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'user' | 'company';
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

function SidebarContent({
  navItems,
  user,
  isCompany,
  hasCompany,
  pathname,
  onSignOut,
}: {
  navItems: NavItem[];
  user: { name?: string | null } | undefined;
  isCompany: boolean;
  hasCompany: boolean;
  pathname: string;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-full flex-col py-4">
      <div className="flex items-center gap-3 border-b px-4 pb-4">
        <UserCircle className="size-10 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name || 'Пользователь'}</p>
          <p className="truncate text-xs text-muted-foreground">
            {isCompany ? 'Компания' : 'Соискатель'}
          </p>
        </div>
      </div>

      {isCompany && !hasCompany && (
        <div className="mx-3 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">Компания не зарегистрирована</p>
          <p className="mt-0.5">
            Данные проходят проверку. Вакансии станут доступны после активации.
          </p>
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Выйти
        </button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/auth/login');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return null;

  const isCompany = role === 'company';
  const hasCompany = !!(user as { companyId?: string } | null)?.companyId;

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  const userNavItems: NavItem[] = [
    { name: 'Мои резюме', href: '/dashboard', icon: FileText },
    { name: 'Настройки', href: '/dashboard/settings', icon: Settings },
  ];

  const companyNavItems: NavItem[] = [
    ...(hasCompany
      ? [
          { name: 'Мои вакансии', href: '/company/dashboard', icon: BriefcaseBusiness },
          { name: 'Создать вакансию', href: '/company/cvs/new', icon: BriefcaseBusiness },
        ]
      : []),
    { name: 'Настройки', href: '/company/settings', icon: Settings },
  ];

  const navItems = isCompany ? companyNavItems : userNavItems;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="md:hidden -ml-2">
                  <Menu className="size-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
                <SheetTitle className="sr-only">Навигация</SheetTitle>
                <SidebarContent
                  navItems={navItems}
                  user={user}
                  isCompany={isCompany}
                  hasCompany={hasCompany}
                  pathname={pathname}
                  onSignOut={handleSignOut}
                />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image src="/images/logo-by.png" alt="Logo" width={161} height={26} className="h-7 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name || 'Пользователь'}</span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {isCompany ? 'Компания' : 'Соискатель'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 bg-background md:sticky md:block md:self-start md:top-14 md:max-h-[calc(100vh-3.5rem)] md:overflow-y-auto">
          <SidebarContent
            navItems={navItems}
            user={user}
            isCompany={isCompany}
            hasCompany={hasCompany}
            pathname={pathname}
            onSignOut={handleSignOut}
          />
        </aside>

        <main className="flex-1 border-l">
          <div className="container py-5 md:py-8">{children}</div>
        </main>
      </div>

      <footer className="border-t bg-[color-mix(in_oklch,var(--muted)_90%,var(--foreground)_10%)]">
        <div className="container flex flex-col justify-between gap-3 py-5 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:py-4">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="size-3.5 shrink-0" />
            <span>MyJOB — платформа для поиска работы и сотрудников</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/" className="underline hover:text-primary transition-colors">
              Главная
            </Link>
            <Link href="/jobs" className="underline hover:text-primary transition-colors">
              Вакансии
            </Link>
            <Link href="/contacts" className="underline hover:text-primary transition-colors">
              Контакты
            </Link>
            <span className="text-nowrap text-muted-foreground/60">&copy; {new Date().getFullYear()} MyJOB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
