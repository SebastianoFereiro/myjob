"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";

export function LoginForm() {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError("");
    clearErrors();

    // Валидация zod v4 напрямую, без резолвер-адаптеров
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") {
          setError(key as keyof LoginInput, { type: issue.code, message: issue.message });
        }
      }
      return;
    }

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
      });

      if (authError) {
        setServerError(translateAuthError(authError));
        return;
      }

      if (data?.user) {
        const role = (data.user as { role?: string }).role || "user";
        const redirectTo = role === "company" ? "/company/dashboard" : "/dashboard";
        // Редирект через публичный callback для избежания middleware redirect
        window.location.href = `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      }
    } catch {
      setServerError("Ошибка при входе. Попробуйте позже.");
    }
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

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Забыли пароль?
        </Link>
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Вход...
          </>
        ) : (
          "Войти"
        )}
      </Button>
    </form>
  );
}
