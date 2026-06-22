'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { JobCategory } from '@/types/jobs';
import { getCategories } from '@/services/categories.service';

export function CategoriesDropdown() {
  const [categories, setCategories] = useState<JobCategory[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        console.log('Failed to load categories');
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-muted-foreground hover:text-primary px-3 py-1.5 text-base font-medium hover:bg-transparent">
          Направления
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full md:w-[640px] p-4">
        {/* Mobile: stacked list */}
        <div className="md:hidden flex flex-col gap-2">
          {categories.map((category) => (
            <DropdownMenuItem key={category.slug} asChild>
              <Link href={`/categories/${category.slug}`} className="w-full cursor-pointer">
                {category.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        {/* Tablet+: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="flex flex-col gap-4 rounded-lg p-3 transition-colors hover:bg-accent"
            >
              <span className="font-medium text-sm">{category.name}</span>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CategoriesMobileDropdown() {
  const [categories, setCategories] = useState<JobCategory[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <div key={category.slug} className="px-2 py-1.5">
          <Link
            href={`/categories/${category.slug}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {category.name}
          </Link>
        </div>
      ))}
    </>
  );
}
