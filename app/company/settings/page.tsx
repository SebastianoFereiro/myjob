import { Metadata } from "next";
import Link from "next/link";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompanySettingsForm } from "@/components/company/CompanySettingsForm";
import { requireRole } from "@/lib/auth-guard";
import { getCompanyByDocumentId } from "@/services/companies.service";

export const metadata: Metadata = {
  title: "Настройки компании | MyJOB",
  description: "Управляйте настройками вашей компании",
};

export default async function CompanySettingsPage() {
  const session = await requireRole("company");
  const companyId = session.user.companyId;

  if (!companyId) {
    return (
      <DashboardLayout role="company">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Настройки компании
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Управляйте данными вашей компании.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <h2 className="text-lg font-semibold">
              Компания не зарегистрирована
            </h2>
            <p className="mt-2 text-sm">
              Данные проходят проверку. Вакансии и настройки станут доступны
              после активации компании администратором.
            </p>
            <p className="mt-1 text-sm">
              Если вы ещё не регистрировали компанию —{" "}
              <Link
                href="/company/dashboard"
                className="font-medium underline underline-offset-4 hover:text-amber-900 dark:hover:text-amber-100"
              >
                создайте её
              </Link>
              .
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const company = await getCompanyByDocumentId(companyId);

  if (!company) {
    return (
      <DashboardLayout role="company">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Настройки компании
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Управляйте данными вашей компании.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
            <h2 className="text-lg font-semibold">Компания не найдена</h2>
            <p className="mt-2 text-sm">
              Запись о компании отсутствует в системе. Возможно, она была
              удалена. Обратитесь в поддержку.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="company">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Настройки компании
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управляйте данными вашей компании.
          </p>
        </div>

        <CompanySettingsForm company={company} />
      </div>
    </DashboardLayout>
  );
}
