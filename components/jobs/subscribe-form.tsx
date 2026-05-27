"use client";

import { Mail } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStrapiURL } from "@/lib/strapi-client";
import type { JobFilters } from "@/types/jobs";

type SubscribeFormProps = {
  filters?: JobFilters;
};

export function SubscribeForm({ filters }: SubscribeFormProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.includes("@")) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      if (process.env.NEXT_PUBLIC_STRAPI_URL) {
        await fetch(`${getStrapiURL()}/api/subscriptions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              email,
              query: filters?.query,
              location: filters?.location,
              type: filters?.type,
            },
          }),
        });
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="container pb-16">
      <div className="rounded-lg border bg-muted/40 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_360px] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Получать новые вакансии
            </h2>
            <p className="mt-2 text-muted-foreground">
              Отправим подборку по вашему запросу, когда появятся новые предложения.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="relative block">
              <span className="sr-only">Email для подписки</span>
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                className="h-10 pl-9"
                aria-invalid={status === "error"}
              />
            </label>
            <Button type="submit" disabled={status === "loading"} className="h-10 w-full">
              {status === "loading" ? "Отправляем..." : "Подписаться"}
            </Button>
            {status === "success" ? (
              <p className="text-sm text-muted-foreground">
                Готово. Подписка сохранена.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="text-sm text-destructive">
                Проверьте email и попробуйте еще раз.
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
