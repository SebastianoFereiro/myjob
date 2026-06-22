'use client';

import { useState } from 'react';
import { BriefcaseBusiness, LogOut, MenuIcon, User, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { CategoriesDropdown, CategoriesMobileDropdown } from '@/components/categories-dropdown';

export type NavigationSection = {
  name: string;
  slug: string;
};

import { navigationItems } from '@/app/data/navigation';

type HeaderProps = {
  navigationData?: NavigationSection[];
  className?: string;
};

const Header = ({ navigationData = navigationItems, className }: HeaderProps) => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user as
    | { id: string; role?: string; email?: string; name?: string; image?: string | null }
    | undefined;
  const isAuthenticated = !!user;
  const isCompany = user?.role === 'company';

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  const showAuthLink = isAuthenticated;
  const authLinkName = isCompany ? 'Мои вакансии' : 'Мои резюме';
  const authLinkHref = isCompany ? '/company/dashboard' : '/dashboard';

  return (
    <header className={cn('bg-background sticky top-0 z-50 h-16 border-b', className)}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/">
          <Image src="/images/logo-by.png" alt="Logo" width={161} height={26} className="w-auto" />
        </Link>

        {/* Navigation */}
        <NavigationMenu className="max-md:hidden">
          <NavigationMenuList className="flex-wrap justify-start gap-0">
            <NavigationMenuItem>
              <CategoriesDropdown />
            </NavigationMenuItem>

            {navigationData.map((navItem) => (
              <NavigationMenuItem key={navItem.name}>
                <NavigationMenuLink
                  href={navItem.slug}
                  className="text-muted-foreground hover:text-primary px-3 py-1.5 text-base! font-medium hover:bg-transparent"
                >
                  {navItem.name}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem
              className={cn(!showAuthLink && 'hidden')}
            >
              <NavigationMenuLink
                href={authLinkHref}
                className="text-muted-foreground hover:text-primary px-3 py-1.5 text-base! font-medium hover:bg-transparent"
              >
                {authLinkName}
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Section */}
        <div className="flex items-center gap-2 max-md:hidden">
          {isPending ? null : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <UserCircle className="size-5" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link
                    href={isCompany ? '/company/dashboard' : '/dashboard'}
                    className="flex items-center gap-2"
                  >
                    {isCompany ? (
                      <BriefcaseBusiness className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                    {isCompany ? 'Мои вакансии' : 'Мои резюме'}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="size-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Регистрация</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex gap-4 md:hidden">
          {isPending ? null : isAuthenticated ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href={isCompany ? '/company/dashboard' : '/dashboard'}>
                <UserCircle className="size-5" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login" className="text-sm">
                Войти
              </Link>
            </Button>
          )}

          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
                <span className="sr-only">Меню</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {navigationData.map((item) => (
                <DropdownMenuItem key={item.slug} asChild>
                  <Link href={item.slug}>{item.name}</Link>
                </DropdownMenuItem>
              ))}

              {isAuthenticated && (
                <DropdownMenuItem asChild>
                  <Link
                    href={isCompany ? '/company/dashboard' : '/dashboard'}
                    className="flex items-center gap-2"
                  >
                    {isCompany ? (
                      <BriefcaseBusiness className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                    {isCompany ? 'Мои вакансии' : 'Мои резюме'}
                  </Link>
                </DropdownMenuItem>
              )}

              <div className="border-t my-1">
                <CategoriesMobileDropdown />
              </div>

              {isAuthenticated ? (
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive"
                >
                  <LogOut className="size-4" />
                  Выйти
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth/register" className="flex items-center gap-2">
                    <User className="size-4" />
                    Регистрация
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
