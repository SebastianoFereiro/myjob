import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageCount, total, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Всего: {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(page <= 1 && 'opacity-50 cursor-not-allowed')}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline ml-1">Назад</span>
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
            let pageNum: number;

            if (pageCount <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= pageCount - 2) {
              pageNum = pageCount - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-w-9',
                  pageNum === page && 'pointer-events-none',
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={cn(page >= pageCount && 'opacity-50 cursor-not-allowed')}
        >
          <span className="hidden sm:inline mr-1">Вперед</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
