import { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Регистрация | MyJOB",
  description:
    "Зарегистрируйтесь на MyJOB как соискатель или компания",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Выберите тип аккаунта и заполните форму"
      mode="register"
    >
      <RegisterForm />
    </AuthLayout>
  );
}