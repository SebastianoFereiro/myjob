import { Metadata } from "next";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsForm } from "@/components/auth/SettingsForm";

export const metadata: Metadata = {
  title: "Настройки профиля | MyJOB",
  description: "Управляйте настройками вашего профиля",
};

export default function SettingsPage() {
  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Настройки профиля
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управляйте данными вашего аккаунта.
          </p>
        </div>

        <SettingsForm />
      </div>
    </DashboardLayout>
  );
}