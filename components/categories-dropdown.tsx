"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JobCategory } from "@/types/jobs";
import { getCategories } from "@/services/categories.service";

export function CategoriesDropdown() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);



//   if (isLoading || categories.length === 0) {
//     return null;
//   }
  console.log('cat', categories)

    useEffect(() => {
    async function loadCategories() {
      try {
       
        const data = await getCategories();
        console.log("Loaded categories:", data);
        setCategories(data);
      } catch {
        console.log("Failed to load categories");
        setCategories([]);
      } finally {
        setIsLoading(false);
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
      <DropdownMenuContent className="w-48">
        {categories.map((category) => (
          <DropdownMenuItem key={category.slug} asChild>
            <Link
              href={`/${category.slug}`}
              className="w-full cursor-pointer"
            >
              {category.name}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CategoriesMobileDropdown() {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
    
        const data = await getCategories();
        setCategories(data);
      } catch {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (isLoading || categories.length === 0) {
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
