"use client";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils";
import { CategoriesDropdown, CategoriesMobileDropdown } from "@/components/categories-dropdown";

export type NavigationSection = {
  name: string;
  slug: string;
};

import { navigationItems } from "@/app/data/navigation";

type HeaderProps = {
  navigationData?: NavigationSection[];
  className?: string;
};

const Header = ({ navigationData = navigationItems, className }: HeaderProps) => {
  return (
    <header
      className={cn("bg-background sticky top-0 z-50 h-16 border-b", className)}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/">
          <img src="/images/logo-by.png" alt="Logo" className="w-auto" />
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
             </NavigationMenuList>
        </NavigationMenu>

        {/* Login Button */}
        {/* <Button className="rounded-lg max-md:hidden" asChild>
          <a href="#">Login</a>
        </Button> */}

        {/* Navigation for small screens */}
        <div className="flex gap-4 md:hidden">
          {/* <Button className="rounded-lg" asChild>
            <a href="#">Login</a>
          </Button> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MenuIcon />
                <span className="sr-only">Меню</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {navigationData.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                  <Link href={item.slug}>{item.name}</Link>
                </DropdownMenuItem>
              ))}
              <div className="border-t my-1">
                <CategoriesMobileDropdown />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
