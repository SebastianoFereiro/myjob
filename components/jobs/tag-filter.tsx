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
    [router, searchParams, activeTag, basePath],
  );

  if (tags.length === 0) return null;

  return (
    <section className="container py-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={cn(
                'inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border bg-background text-foreground hover:bg-muted',
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
