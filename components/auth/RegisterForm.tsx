"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { BriefcaseBusiness, Loader2, Mail, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth";

// true => после регистрации показать экран «Проверьте почту» вместо входа
const REQUIRE_EMAIL_VERIFICATION =
  process.env.NEXT_PUBLIC_AUTH_REQUIRE_EMAIL_VERIFICATION === "true";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [verificationPending, setVerificationPending] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      ynp: "",
      consent: false,
    },
  });

  const role = watch("role");

  async function onSubmit(values: RegisterInput) {
    setError("");

    try {
      const { error: authError } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({ role: values.role } as any),
      });

      if (authError) {
        setError(translateAuthError(authError));
        return;
      }

      // Создаём компанию в фоне (не блокируем следующий шаг)
      if (values.role === "company") {
        fetch("/api/company/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            ynp: values.ynp?.trim() || "",
          }),
        }).catch(() => {});
      }

      if (REQUIRE_EMAIL_VERIFICATION) {
        setVerificationPending(values.email);
        return;
      }

      // Редирект через публичный callback для избежания middleware redirect
      const redirectTo = values.role === "company" ? "/company/dashboard" : "/dashboard";
      window.location.href = `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
    } catch {
      setError("Ошибка при регистрации. Попробуйте позже.");
    }
  }

  if (verificationPending) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>

        <h2 className="text-lg font-semibold">Проверьте почту</h2>

        <p className="text-sm leading-6 text-muted-foreground">
          Мы отправили письмо для подтверждения email на{" "}
          <span className="font-medium text-foreground">{verificationPending}</span>. Перейдите по
          ссылке из письма, чтобы активировать аккаунт.
        </p>

        <p className="text-xs text-muted-foreground">Не пришло письмо? Проверьте папку «Спам».</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Тип аккаунта */}
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-3">
            {(["user", "company"] as const).map((value) => {
              const active = field.value === value;
              const Icon = value === "user" ? User : BriefcaseBusiness;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => field.onChange(value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon
                    className={`size-6 ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {value === "user" ? "Соискатель" : "Компания"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {value === "user" ? "Ищу работу" : "Размещаю вакансии"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="name">{role === "company" ? "Название компании" : "Имя и фамилия"}</Label>
        <Input
          id="name"
          placeholder={role === "company" ? "ООО Моя Компания" : "Иван Иванов"}
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      {role === "company" && (
        <div className="space-y-2">
          <Label htmlFor="ynp">
            УНП (учётный номер плательщика) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ynp"
            placeholder="123456789"
            maxLength={20}
            {...register("ynp")}
            aria-invalid={!!errors.ynp}
          />
          {errors.ynp ? (
            <p className="text-sm text-destructive">{errors.ynp.message}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Компания будет активирована после проверки данных
            </p>
          )}
        </div>
      )}

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
          placeholder="Минимум 8 символов"
          autoComplete="new-password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register("confirmPassword")}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <Controller
          control={control}
          name="consent"
          render={({ field }) => (
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="consent"
                className="text-xs leading-5 text-muted-foreground cursor-pointer"
              >
                Я даю согласие на{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  обработку персональных данных
                </Link>
              </Label>
            </div>
          )}
        />
      </div>
      {errors.consent && <p className="text-sm text-destructive">{errors.consent.message}</p>}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Регистрация...
          </>
        ) : (
          "Создать аккаунт"
        )}
      </Button>
    </form>
  );
}
