"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import type { CompanyPublic } from "@/services/companies.service";

interface CompanySettingsFormProps {
  company?: CompanyPublic;
}

export function CompanySettingsForm({ company: initialCompany }: CompanySettingsFormProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [company, setCompany] = useState<CompanyPublic | null>(initialCompany ?? null);
  const [loadingCompany, setLoadingCompany] = useState(!initialCompany);
  if (loadingCompany) return <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  if (!company) return <p className="text-center text-muted-foreground py-8">Данные компании не найдены</p>;

  const [name, setName] = useState(initialCompany?.name || "");
  const [description, setDescription] = useState(initialCompany?.description || "");
  const [siteUrl, setSiteUrl] = useState(initialCompany?.siteUrl || "");
  const [address, setAddress] = useState(initialCompany?.location || initialCompany?.address || "");
  const [phone, setPhone] = useState(initialCompany?.phone || "");
  const [email, setEmail] = useState(initialCompany?.email || "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (initialCompany) return;
    const companyId = (session?.user as { companyId?: string } | undefined)?.companyId;
    if (!companyId) {
      setLoadingCompany(false);
      return;
    }
    fetch(`/api/strapi/companies/${companyId}`)
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setSiteUrl(data.siteUrl || "");
        setAddress(data.location || data.address || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
      })
      .catch(() => {})
      .finally(() => setLoadingCompany(false));
  }, [initialCompany, session]);

  function resetForm() {
    if (!company) return;
    setName(company.name || "");
    setDescription(company.description || "");
    setSiteUrl(company.siteUrl || "");
    setAddress(company.location || company.address || "");
    setPhone(company.phone || "");
    setEmail(company.email || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Название компании обязательно");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/company/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          siteUrl: siteUrl.trim() || undefined,
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Не удалось обновить данные");
      }

      // Обновляем user.name в сессии better-auth, чтобы DashboardLayout подхватил новое название
      await authClient.updateUser({ name: name.trim() });

      setSuccess("Данные компании успешно обновлены");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при сохранении");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Основная информация</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          УНП отображается и не может быть изменен.
        </p>
      </div>
      <Separator />

      <div className="grid max-w-lg gap-6">
        {/* УНП — read-only */}
        <div className="space-y-2">
          <Label htmlFor="ynp">УНП</Label>
          <Input
            id="ynp"
            value={company.ynp || ""}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            УНП нельзя изменить. Для изменения обратитесь в поддержку.
          </p>
        </div>

        {/* Название */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Название компании <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        {/* Описание */}
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
        </div>

        {/* Сайт */}
        <div className="space-y-2">
          <Label htmlFor="siteUrl">Веб-сайт</Label>
          <Input
            id="siteUrl"
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        {/* Адрес */}
        <div className="space-y-2">
          <Label htmlFor="address">Адрес</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={300}
            placeholder="Минск, Беларусь"
          />
        </div>

        {/* Телефон */}
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+375 29 123-45-67"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="company@example.com"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Сохранение...
            </>
          ) : (
            "Сохранить"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={loading}
        >
          Сбросить
        </Button>
      </div>
    </form>
  );
}
