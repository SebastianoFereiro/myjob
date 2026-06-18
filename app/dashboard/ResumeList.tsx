'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Edit, FilePlus, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { EmptyState } from '@/components/dashboard/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { authClient } from '@/lib/auth-client';
import { getResumesByUserId, deleteResume } from '@/services/resume.service';
import type { Resume } from '@/types/resume';

export function ResumeList() {
  const { data: session } = authClient.useSession();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);

  const userId = session?.user?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadResumes() {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await getResumesByUserId(userId, page);
        if (!cancelled) {
          setResumes(data.resumes);
          setPageCount(data.pagination.pageCount);
          setTotal(data.pagination.total);
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить резюме');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResumes();

    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  async function handleDelete(documentId: string) {
    if (!confirm('Вы уверены, что хотите удалить это резюме?')) return;

    try {
      await deleteResume(documentId);
      setResumes((prev) => prev.filter((r) => r.documentId !== documentId));
    } catch {
      alert('Не удалось удалить резюме');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        title="У вас ещё нет резюме"
        description="Создайте первое резюме, чтобы работодатели могли вас найти."
        actionLabel="Создать резюме"
        actionHref="/resume/submit"
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total > 0 && `Всего резюме: ${total}`}
        </p>
        <Button asChild className="w-full sm:w-auto shadow-sm">
          <Link href="/resume/submit">
            <FilePlus className="mr-2 size-4" />
            Новое резюме
          </Link>
        </Button>
      </div>

      {resumes.map((resume) => (
        <Card key={resume.documentId} className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="p-3 sm:p-5">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-[15px] leading-snug font-semibold sm:text-lg">
                  {resume.position || resume.title}
                </CardTitle>
                <Badge
                  variant={resume.isPublished ? 'secondary' : 'outline'}
                  className="shrink-0 rounded-full text-[11px] px-2.5 py-0"
                >
                  {resume.isPublished ? 'Опубликовано' : 'Черновик'}
                </Badge>
              </div>
              <p className="text-[13px] text-muted-foreground leading-snug">
                {resume.firstName} {resume.lastName}
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-0 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {resume.location && (
                <span className="text-foreground/70">{resume.location}</span>
              )}
              {resume.salary && (
                <span className="font-medium text-foreground/80">
                  {resume.salary} {resume.currency}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5 shrink-0" />
                Обновлено {new Date(resume.updatedAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-background px-3 py-2.5 sm:px-5 sm:py-3">
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 sm:h-9 sm:px-3">
                <Link href={`/dashboard/resume/${resume.documentId}/edit`}>
                  <Edit className="size-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Редактировать</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 sm:h-9 sm:px-3"
                onClick={() => handleDelete(resume.documentId)}
              >
                <Trash2 className="size-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Удалить</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      <Pagination
        page={page}
        pageCount={pageCount}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
