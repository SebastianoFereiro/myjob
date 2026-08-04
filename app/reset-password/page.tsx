import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Новый пароль | MyJOB",
  description: "Задайте новый пароль для входа",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthLayout
      title="Новый пароль"
      subtitle="Придумайте новый пароль для входа"
      mode="login"
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Отсутствует токен сброса пароля. Перейдите по ссылке из письма.
        </p>
      )}
    </AuthLayout>
  );
}
