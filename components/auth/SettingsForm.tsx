"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export function SettingsForm() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!name.trim()) {
      setProfileError("Имя не может быть пустым");
      return;
    }

    setProfileLoading(true);

    try {
      await authClient.updateUser({ name: name.trim() });
      setProfileSuccess("Имя успешно обновлено");
      refetch();
    } catch {
      setProfileError("Не удалось обновить имя");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Заполните все поля");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Новый пароль должен быть не менее 8 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    setPasswordLoading(true);

    try {
      await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess("Пароль успешно обновлён");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Не удалось обновить пароль. Проверьте текущий пароль.");
    } finally {
      setPasswordLoading(false);
    }
  }

  if (!user) {
    return (
      <p className="text-muted-foreground">Загрузка данных пользователя...</p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Info */}
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h2 className="text-lg font-semibold">Основная информация</h2>
        <Separator />

        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email нельзя изменить
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Имя / Название</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {profileError && (
          <p className="text-sm text-destructive">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="text-sm text-emerald-600">{profileSuccess}</p>
        )}

        <Button type="submit" disabled={profileLoading}>
          {profileLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </form>

      {/* Password Change */}
      <form onSubmit={handleUpdatePassword} className="space-y-4">
        <h2 className="text-lg font-semibold">Смена пароля</h2>
        <Separator />

        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Текущий пароль</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Новый пароль</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 8 символов"
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите новый пароль</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}
        {passwordSuccess && (
          <p className="text-sm text-emerald-600">{passwordSuccess}</p>
        )}

        <Button type="submit" disabled={passwordLoading}>
          {passwordLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Обновление...
            </>
          ) : (
            "Обновить пароль"
          )}
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">
          Опасная зона
        </h2>
        <Separator />

        <p className="text-sm text-muted-foreground">
          Удаление аккаунта приведёт к безвозвратному удалению всех данных.
        </p>
        <Button variant="destructive" disabled>
          Удалить аккаунт (скоро)
        </Button>
      </div>
    </div>
  );
}