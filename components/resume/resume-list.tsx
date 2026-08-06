import { Button } from '@/components/ui/button';
import { ResumeCard } from '@/components/resume/resume-card';
import { getPublishedResumes } from '@/services/resume.service';

type ResumeListProps = {
  page: number;
};

export async function ResumeList({ page }: ResumeListProps) {
  const { resumes, pagination } = await getPublishedResumes(page);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Резюме соискателей</h2>
          <p className="mt-1 text-muted-foreground">Найдено резюме: {pagination.total}</p>
        </div>
      </div>

      {resumes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.documentId} resume={resume} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-background p-8 text-center">
          <h3 className="text-xl font-medium">Резюме не найдены</h3>
          <p className="mt-2 text-muted-foreground">
            Пока нет опубликованных резюме. Загляните позже.
          </p>
        </div>
      )}

      {pagination.pageCount > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" disabled={pagination.page <= 1} asChild={pagination.page > 1}>
            {pagination.page > 1 ? (
              <a href={`/resumes?page=${pagination.page - 1}`}>Назад</a>
            ) : (
              <span>Назад</span>
            )}
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {pagination.page} из {pagination.pageCount}
          </span>
          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pageCount}
            asChild={pagination.page < pagination.pageCount}
          >
            {pagination.page < pagination.pageCount ? (
              <a href={`/resumes?page=${pagination.page + 1}`}>Вперед</a>
            ) : (
              <span>Вперед</span>
            )}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
