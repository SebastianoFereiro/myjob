import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { getCategories } from "@/services/categories.service";
import { JobList } from "@/components/jobs/job-list";
import type { JobFilters } from "@/types/jobs";
import Header from "@/components/header";
import { navigationItems } from "@/app/data/navigation";
import { Footer } from "@/components/footer";

type Props = {
  params: Promise<{
    category: string;
  }>;
};

async function getCategoryName(categorySlug: string): Promise<string | null> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  return category?.name || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categoryName = await getCategoryName(category);

  if (!categoryName) {
    return {
      title: "Категория не найдена",
    };
  }

  return {
    title: `${categoryName} - Резюме и вакансии | MyJOB`,
    description: `Профессионалы и вакансии в категории "${categoryName}". Найди свою идеальную работу на MyJOB.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const categoryName = await getCategoryName(category);

  if (!categoryName) {
    notFound();
  }

  const filters: JobFilters = {
    category,
  };

  return (
      <>
     <Header navigationData={navigationItems} />
    <main className="min-h-screen bg-background">
      <JobList filters={filters} basePath="/categories" contained={true} />
    </main>
    <Footer />
    </>
  );
}
