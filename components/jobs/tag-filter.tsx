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
    <section className="container py-3 sm:py-4 px-0">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tags.map((tag) => {
          const isActive = activeTag === tag;

          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'w-full rounded-full border px-2 py-2 text-center text-xs font-medium transition-colors sm:text-sm',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </section>
  );
}
