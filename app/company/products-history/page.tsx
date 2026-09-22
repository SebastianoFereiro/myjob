import { Metadata } from "next";

import { ProductHistoryControls } from "@/components/company/product-history-controls";
import { ProductHistoryList } from "@/components/company/product-history-list";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getServerSession } from "@/lib/auth-guard";
import { getCompanyProductHistory } from "@/services/product-audit.service";

export const metadata: Metadata = {
  title: "История продуктов | MyJOB",
  description:
    "История назначения Премиума и Автоподнятия по вакансиям компании",
};

const PAGE_SIZE = 10;

export default async function CompanyProductsHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession();
  const companyId = session?.user?.companyId;

  const search = (params.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  if (!companyId) {
    return (
      <DashboardLayout role="company">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              История продуктов
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Данные компании проходят проверку. История продуктов станет
              доступна после активации.
            </p>
          </div>

          <EmptyState
            title="Компания не зарегистрирована"
            description="Заполните данные компании, чтобы управлять вакансиями и продуктами."
            actionLabel="Настройки компании"
            actionHref="/company/settings"
          />
        </div>
      </DashboardLayout>
    );
  }

  const history = await getCompanyProductHistory({
    companyId,
    search,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            История продуктов
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Назначение Премиума и Автоподнятия в разрезе вакансий, хранение
            истории - 1 год.
          </p>
        </div>

        <ProductHistoryControls
          key={search}
          query={search}
          page={history.pagination.page}
          pageCount={history.pagination.pageCount}
          total={history.pagination.total}
        />

        <ProductHistoryList
          items={history.items}
          hasSearch={search.length > 0}
        />
      </div>
    </DashboardLayout>
  );
}
