import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Новый пароль | MyJOB",
  description: "Задайте новый пароль для входа",
};

export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <AuthLayout
      title="Новый пароль"
      subtitle="Придумайте новый пароль для входа"
      mode="login"
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
