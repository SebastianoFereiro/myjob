import { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Восстановление пароля | MyJOB",
  description: "Восстановите доступ к аккаунту",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Введите email, и мы отправим инструкцию по восстановлению"
      mode="login"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}