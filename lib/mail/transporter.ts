import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

/**
 * Идентификатор почтового ящика-отправителя.
 * - "no-reply" — транзакционные письма пользователям (верификация, сброс пароля)
 * - "support"  — письма из контактной формы (на support@myjob.by)
 */
export type MailIdentity = "no-reply" | "support";

export const MAIL_FROM: Record<MailIdentity, string> = {
  "no-reply": process.env.SMTP_USER_NO_REPLY || "no-reply@myjob.by",
  support: process.env.SMTP_USER_SUPPORT || "support@myjob.by",
};

const smtpConfig = {
  host: process.env.SMTP_HOST || "mail.myjob.by",
  port: Number(process.env.SMTP_PORT || 587),
  // secure:false + requireTLS:true => STARTTLS (Stalwart)
  secure: process.env.SMTP_SECURE === "true",
  requireTLS: process.env.SMTP_STARTTLS !== "false",
};

const transportCache = new Map<MailIdentity, Transporter>();

/** Лениво создаёт и кеширует nodemailer-транспортер для конкретного отправителя. */
export function getTransporter(identity: MailIdentity): Transporter {
  const cached = transportCache.get(identity);
  if (cached) return cached;

  const pass =
    identity === "no-reply"
      ? process.env.SMTP_PASS_NO_REPLY
      : process.env.SMTP_PASS_SUPPORT;

  const transporter = nodemailer.createTransport({
    ...smtpConfig,
    auth: {
      user: MAIL_FROM[identity],
      pass,
    },
  });

  transportCache.set(identity, transporter);
  return transporter;
}
