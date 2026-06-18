import { Metadata } from "next";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const metadata: Metadata = {
  title: "Отклики | MyJOB",
  description: "Просматривайте отклики на вакансии",
};

export default function ApplicantsPage() {
  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Отклики на вакансии
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Здесь будут отображаться отклики соискателей на ваши вакансии.
          </p>
        </div>

        <EmptyState
          title="Пока нет откликов"
          description="Когда соискатели начнут откликаться на ваши вакансии, они появятся здесь."
          actionLabel="Создать вакансию"
          actionHref="/company/vacancies/new"
        />
      </div>
    </DashboardLayout>
  );
}