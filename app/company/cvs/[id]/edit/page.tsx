import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CvEditForm } from './CvEditForm';
import { getCvByDocumentId } from '@/services/cv.service';
import { fetchAPI } from '@/lib/strapi-client';
import type { CategoryRef } from '@/types/cv';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Редактирование вакансии | MyJOB',
};

type StrapiCategoryRecord = {
  id?: number;
  documentId?: string;
  name?: string;
  title?: string;
  slug?: string;
};

async function getCategories(): Promise<CategoryRef[]> {
  try {
    const res = await fetchAPI<{ data: StrapiCategoryRecord[] }>(
      '/categories?pagination[pageSize]=100',
    );
    return (res.data || []).map((r) => ({
      id: r.id ?? 0,
      documentId: r.documentId ?? '',
      name: r.title || r.name || '',
      slug: r.slug || '',
    }));
  } catch {
    return [];
  }
}

export default async function EditCvPage({ params }: Props) {
  const { id } = await params;
  const [cv, categories] = await Promise.all([
    getCvByDocumentId(id),
    getCategories(),
  ]);

  if (!cv) {
    notFound();
  }

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
            <h1 className="text-2xl font-semibold tracking-tight">Редактирование: {cv.title}</h1>
          </div>
        </div>

        <CvEditForm cv={cv} categories={categories} />
      </div>
    </DashboardLayout>
  );
}
