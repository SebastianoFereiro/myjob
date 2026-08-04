import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";

export const metadata: Metadata = {
  title: "Подтверждение email | MyJOB",
  description: "Подтверждение адреса электронной почты",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; callbackURL?: string; email?: string }>;
}) {
  const { token, callbackURL, email } = await searchParams;

  return (
    <AuthLayout
      title="Подтверждение email"
      subtitle="Подтверждаем адрес электронной почты"
      mode="login"
    >
      {token ? (
        <VerifyEmailClient token={token} callbackURL={callbackURL} email={email} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Отсутствует токен подтверждения. Откройте ссылку из письма.
        </p>
      )}
    </AuthLayout>
  );
}
