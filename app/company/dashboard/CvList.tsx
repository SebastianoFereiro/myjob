'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Edit, Eye, FilePlus, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { EmptyState } from '@/components/dashboard/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { authClient } from '@/lib/auth-client';
import { getCvsByUserId, softDeleteCv } from '@/services/cv.service';
import type { CvVacancy } from '@/types/cv';

const employmentLabels: Record<string, string> = {
  'Полная занятость': 'Полная занятость',
  'Частичная занятость': 'Частичная занятость',
  'Проектная работа': 'Проектная работа',
  Стажировка: 'Стажировка',
  Удаленно: 'Удаленно',
};

function formatSalary(vacancy: CvVacancy) {
  if (!vacancy.salaryFrom && !vacancy.salaryTo) {
    return 'По договоренности';
  }

  if (vacancy.salaryFrom && vacancy.salaryTo) {
    return `${vacancy.salaryFrom}-${vacancy.salaryTo} ${vacancy.currency}`;
  }

  return vacancy.salaryFrom
    ? `от ${vacancy.salaryFrom} ${vacancy.currency}`
    : `до ${vacancy.salaryTo} ${vacancy.currency}`;
}

export function CvList() {
  const { data: session } = authClient.useSession();
  const [vacancies, setVacancies] = useState<CvVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [total, setTotal] = useState(0);

  const userId = session?.user?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadCvs() {
      if (!userId) return;

      try {
        setLoading(true);
        const data = await getCvsByUserId(page);
        if (!cancelled) {
          setVacancies(data.vacancies);
          setPageCount(data.pagination.pageCount);
          setTotal(data.pagination.total);
        }
      } catch {
        if (!cancelled) {
          setError('Не удалось загрузить вакансии');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCvs();

    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  async function handleDelete(documentId: string) {
    if (!confirm('Вы уверены, что хотите архивировать эту вакансию?')) return;

    try {
      await softDeleteCv(documentId);
      setVacancies((prev) => prev.filter((v) => v.documentId !== documentId));
    } catch {
      alert('Не удалось архивировать вакансию');
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

  if (vacancies.length === 0) {
    return (
      <EmptyState
        title="У вас ещё нет вакансий"
        description="Создайте первую вакансию, чтобы найти лучших кандидатов."
        actionLabel="Создать вакансию"
        actionHref="/company/cvs/new"
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total > 0 && `Всего вакансий: ${total}`}
        </p>
        <Button asChild className="w-full sm:w-auto shadow-sm">
          <Link href="/company/cvs/new">
            <FilePlus className="mr-2 size-4" />
            Новая вакансия
          </Link>
        </Button>
      </div>

      {vacancies.map((vacancy) => (
        <Card key={vacancy.documentId} className="shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="p-3 sm:p-5">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-[15px] leading-snug font-semibold sm:text-lg">
                  {vacancy.title}
                </CardTitle>
                <Badge
                  variant={vacancy.isActive ? 'secondary' : 'outline'}
                  className="shrink-0 rounded-full text-[11px] px-2.5 py-0"
                >
                  {vacancy.isActive ? 'Активна' : 'Архив'}
                </Badge>
              </div>
              <p className="text-[13px] text-muted-foreground leading-snug truncate">
                {vacancy.company?.name || 'Без компании'}
                {vacancy.position ? <span className="max-sm:hidden"> — {vacancy.position}</span> : null}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="rounded-full text-[11px] px-2 py-0 font-normal">
                  {employmentLabels[vacancy.employmentType] || vacancy.employmentType}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-3 pb-0 sm:px-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              {vacancy.location && (
                <span className="text-foreground/70">{vacancy.location}</span>
              )}
              <span className="font-medium text-foreground/80">{formatSalary(vacancy)}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5 shrink-0" />
                {new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}
              </span>
              {vacancy.deadline && (
                <span className="inline-flex items-center gap-1">
                  до {new Date(vacancy.deadline).toLocaleDateString('ru-RU')}
                </span>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t bg-background px-3 py-2.5 sm:px-5 sm:py-3">
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 sm:h-9 sm:px-3">
                <Link href={`/company/cvs/${vacancy.documentId}/edit`}>
                  <Edit className="size-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Редактировать</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 sm:h-9 sm:px-3">
                <Link
                  href={`/jobs/${vacancy.slug}-${vacancy.strapiId || vacancy.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="size-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Просмотр</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10 sm:h-9 sm:px-3"
                onClick={() => handleDelete(vacancy.documentId)}
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
