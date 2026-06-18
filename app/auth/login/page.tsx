import { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Вход | MyJOB",
  description: "Войдите в свой аккаунт на MyJOB",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Вход в аккаунт"
      subtitle="Войдите, чтобы управлять резюме или вакансиями"
      mode="login"
    >
      <LoginForm />
    </AuthLayout>
  );
}