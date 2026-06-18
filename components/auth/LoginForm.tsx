"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Заполните все поля");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: email.trim(),
        password: password.trim(),
      });

      if (authError) {
        setError(authError.message || "Неверный email или пароль");
        setLoading(false);
        return;
      }

      if (data?.user) {
        const role = (data.user as { role?: string }).role || "user";
        const redirectTo = role === "company" ? "/company/dashboard" : "/dashboard";
        // Редирект через публичный callback для избежания middleware redirect
        window.location.href = `/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      }
    } catch {
      setError("Ошибка при входе. Попробуйте позже.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
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
