"use client";

import { useState } from "react";
import { BriefcaseBusiness, Loader2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/types/auth";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [ynp, setYnp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Заполните все поля");
      return;
    }

    if (password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (role === "company" && !ynp.trim()) {
      setError("Укажите УНП компании");
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({ role } as any),
      });

      if (authError) {
        setError(authError.message || "Ошибка при регистрации");
        setLoading(false);
        return;
      }

      // Создаём компанию в фоне (не блокируем редирект)
      if (role === "company") {
        fetch("/api/company/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            ynp: ynp.trim(),
          }),
        }).catch(() => {});
      }

      // Редирект через публичный callback для избежания middleware redirect
      const redirectTo = role === "company" ? "/company/dashboard" : "/dashboard";
      window.location.href = `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
    } catch {
      setError("Ошибка при регистрации. Попробуйте позже.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("user")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
            role === "user"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <User className={`size-6 ${role === "user" ? "text-primary" : "text-muted-foreground"}`} />
          <span
            className={`text-sm font-medium ${
              role === "user" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Соискатель
          </span>
          <span className="text-xs text-muted-foreground">
            Ищу работу
          </span>
        </button>

        <button
          type="button"
          onClick={() => setRole("company")}
          className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
            role === "company"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <BriefcaseBusiness
            className={`size-6 ${role === "company" ? "text-primary" : "text-muted-foreground"}`}
          />
          <span
            className={`text-sm font-medium ${
              role === "company" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Компания
          </span>
          <span className="text-xs text-muted-foreground">
            Размещаю вакансии
          </span>
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          {role === "company" ? "Название компании" : "Имя и фамилия"}
        </Label>
        <Input
          id="name"
          placeholder={
            role === "company" ? "ООО Моя Компания" : "Иван Иванов"
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {role === "company" && (
        <div className="space-y-2">
          <Label htmlFor="ynp">
            УНП (учётный номер плательщика) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ynp"
            placeholder="123456789"
            value={ynp}
            onChange={(e) => setYnp(e.target.value)}
            required
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground">
            Компания будет активирована после проверки данных
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="Минимум 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
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
