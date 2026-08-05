'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

type TagFilterProps = {
  tags: string[];
  basePath: string;
};

export function TagFilter({ tags, basePath }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');

  const handleTagClick = useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (activeTag === tag) {
        params.delete('tag');
      } else {
        params.set('tag', tag);
      }

      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    },
    [router, searchParams, activeTag, basePath]
  );

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => {
        const isActive = activeTag === tag;

        return (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={cn(
              'whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none transition-colors sm:px-3 sm:py-1.5 sm:text-xs',
              isActive
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-background text-foreground hover:bg-muted'
            )}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
