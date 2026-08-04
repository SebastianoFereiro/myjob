"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";

import { contactSchema, type ContactInput } from "@/lib/schemas/auth";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black";
const labelClass = "mb-2 block text-sm font-medium";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactInput) {
    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: { message?: string } }
        | null;

      if (!res.ok) {
        setStatus("error");
        setError(data?.error?.message || "Не удалось отправить сообщение. Попробуйте позже.");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setError("Ошибка соединения. Попробуйте позже.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-emerald-800">Сообщение отправлено</h3>
        <p className="mt-2 text-sm text-emerald-700">Спасибо! Мы ответим в течение 24 часов.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-emerald-800 underline underline-offset-2"
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Ваше имя
          </label>
          <input
            id="contact-name"
            type="text"
            placeholder="Введите имя"
            className={inputClass}
            {...register("name")}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={labelClass}>
          Тема
        </label>
        <input
          id="contact-subject"
          type="text"
          placeholder="Например: Размещение вакансии"
          className={inputClass}
          {...register("subject")}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          Сообщение
        </label>
        <textarea
          id="contact-message"
          rows={6}
          placeholder="Введите сообщение..."
          className="w-full rounded-2xl border bg-zinc-50 p-4 outline-none transition focus:border-black"
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-medium text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Отправить сообщение
          </>
        )}
      </button>
    </form>
  );
}
