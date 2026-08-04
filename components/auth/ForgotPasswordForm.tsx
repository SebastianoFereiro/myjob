"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setError("");
    clearErrors();

    // Валидация zod v4 напрямую, без резолвер-адаптеров
    const result = forgotPasswordSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          setFieldError(key as keyof ForgotPasswordInput, {
            type: issue.code,
            message: issue.message,
          });
        }
      }
      return;
    }

    try {
      const { error: reqError } = await authClient.requestPasswordReset({
        email: result.data.email,
        redirectTo: "/reset-password",
      });

      if (reqError) {
        console.error("[AUTH] requestPasswordReset:", reqError);
      }
      setSent(result.data.email);
    } catch {
      setError("Не удалось отправить инструкцию. Попробуйте позже.");
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <Mail className="mx-auto size-12 text-primary" />
        <h2 className="text-lg font-semibold">Письмо отправлено</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Мы отправили инструкцию по восстановлению пароля на{" "}
          <span className="font-medium text-foreground">{sent}</span>. Ссылка действительна в
          течение 1 часа.
        </p>
        <p className="text-xs text-muted-foreground">Не пришло письмо? Проверьте папку «Спам».</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Отправка...
          </>
        ) : (
          "Отправить инструкцию"
        )}
      </Button>
    </form>
  );
}
