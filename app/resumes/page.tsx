import type { Metadata } from 'next';

import { Footer } from '@/components/footer';
import Header from '@/components/header';
import { ResumeList } from '@/components/resume/resume-list';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Резюме соискателей | MyJOB',
  description: 'Каталог резюме соискателей MyJOB: должность, город, зарплата и навыки.',
  robots: { index: false, follow: false },
};

type ResumesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

function normalizePage(value?: string) {
  const page = value ? parseInt(value, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ResumesPage({ searchParams }: ResumesPageProps) {
  const params = await searchParams;
  const page = normalizePage(params.page);

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/30">
        <section className="border-b bg-background">
          <div className="container px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Резюме соискателей
              </h1>
              <p className="mt-3 text-muted-foreground">
                Каталог резюме с указанием должности, города, зарплаты и навыков кандидатов.
              </p>
            </div>
          </div>
        </section>

        <section className="container px-4 py-8 sm:px-6 lg:px-8">
          <ResumeList page={page} />
        </section>
      </main>
      <Footer />
    </>
  );
}
