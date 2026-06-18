import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Building2, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CvForm } from '@/components/vacancy/CvForm';
import { fetchAPI } from '@/lib/strapi-client';
import { requireRole } from '@/lib/auth-guard';
import type { CompanyRef } from '@/types/cv';

export const metadata: Metadata = {
  title: 'Создание вакансии | MyJOB',
  description: 'Создайте новую вакансию для вашей компании',
};

type StrapiCompanyRecord = {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
  [key: string]: unknown;
};

export default async function NewCvPage() {
  const session = await requireRole('company');

  if (!session.user.companyId) {
    return (
      <DashboardLayout role="company">
        <CompanyNotReadyState />
      </DashboardLayout>
    );
  }

  // Загружаем данные компании на сервере (минуя Strapi proxy)
  let companyData: StrapiCompanyRecord | null = null;
  let fetchError = false;

  try {
    const res = await fetchAPI<{ data: StrapiCompanyRecord }>(
      `/companies/${session.user.companyId}`,
    );

    if (res?.data) {
      companyData = res.data;
    } else {
      fetchError = true;
    }
  } catch {
    fetchError = true;
  }

  if (fetchError || !companyData) {
    return (
      <DashboardLayout role="company">
        <CompanyNotReadyState />
      </DashboardLayout>
    );
  }

  if (companyData.isActive === false) {
    return (
      <DashboardLayout role="company">
        <CompanyInactiveState />
      </DashboardLayout>
    );
  }

  const company: CompanyRef = {
    id: companyData.id ?? 0,
    documentId: companyData.documentId ?? session.user.companyId,
    name: companyData.name ?? '',
    slug: companyData.slug ?? '',
  };

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/company/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Создание вакансии</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Заполните форму, чтобы опубликовать новую вакансию.
            </p>
          </div>
        </div>

        <CvForm company={company} />
      </div>
    </DashboardLayout>
  );
}

function CompanyNotReadyState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/company/dashboard">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Создание вакансии</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Заполните форму, чтобы опубликовать новую вакансию.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Компания не зарегистрирована</CardTitle>
              <CardDescription>
                Для создания вакансии необходимо зарегистрировать компанию
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Ожидает регистрации</p>
              <p>
                Компания будет создана после регистрации на сайте.
                Обратитесь к администратору или зарегистрируйтесь заново с ролью «Компания».
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CompanyInactiveState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/company/dashboard">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Создание вакансии</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Заполните форму, чтобы опубликовать новую вакансию.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Компания ожидает активации</CardTitle>
              <CardDescription>
                Ваша компания зарегистрирована и проходит проверку данных
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Ожидает активации</p>
              <p>
                Компания будет активирована после проверки данных администратором.
                Как только компания будет активирована, вы сможете создавать вакансии.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
