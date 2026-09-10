import { MAIL_FROM, getTransporter, type MailIdentity } from "./transporter";
import {
  companyApprovedEmailHtml,
  companyApprovedEmailText,
  companyModerationRequestHtml,
  companyModerationRequestText,
  contactNotificationHtml,
  contactNotificationText,
  resetPasswordEmailHtml,
  resetPasswordEmailText,
  verificationEmailHtml,
  verificationEmailText,
} from "./templates";

type SendMailOptions = {
  identity: MailIdentity;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/** Общая обёртка отправки. Возвращает true при успехе, не бросает исключений. */
export async function sendMail({
  identity,
  to,
  subject,
  html,
  text,
  replyTo,
}: SendMailOptions): Promise<boolean> {
  try {
    const transporter = getTransporter(identity);
    await transporter.sendMail({
      from: `MyJOB <${MAIL_FROM[identity]}>`,
      to,
      subject,
      html,
      text,
      replyTo,
    });
    return true;
  } catch (err) {
    console.error(`[MAIL] Ошибка отправки "${subject}" -> ${to}:`, err);
    return false;
  }
}

/** Отправка письма подтверждения email (пользователю, от no-reply@myjob.by). */
export function sendVerificationMail(
  user: { name?: string; email: string },
  url: string,
): Promise<boolean> {
  const name = user.name?.trim() || user.email;
  return sendMail({
    identity: "no-reply",
    to: user.email,
    subject: "Подтвердите email — MyJOB",
    html: verificationEmailHtml({ name, url }),
    text: verificationEmailText({ name, url }),
  });
}

/** Отправка письма для восстановления пароля (пользователю, от no-reply@myjob.by). */
export function sendResetPasswordMail(
  user: { name?: string; email: string },
  url: string,
): Promise<boolean> {
  const name = user.name?.trim() || user.email;
  return sendMail({
    identity: "no-reply",
    to: user.email,
    subject: "Восстановление пароля — MyJOB",
    html: resetPasswordEmailHtml({ name, url }),
    text: resetPasswordEmailText({ name, url }),
  });
}

export type ContactMailInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

/** Уведомление из контактной формы на rabota@irr.by (от rabota@irr.by, Reply-To = автор). */
export async function sendContactMail(input: ContactMailInput): Promise<boolean> {
  const to = process.env.MAIL_TO_SUPPORT || "rabota@irr.by";
  return sendMail({
    identity: "support",
    to,
    subject: `Контактная форма: ${input.subject}`,
    html: contactNotificationHtml(input),
    text: contactNotificationText(input),
    replyTo: input.email,
  });
}

export type CompanyModerationMailInput = {
  companyName: string;
  companySlug: string;
  ynp: string;
  ownerEmail: string;
  documentId: string;
};

/**
 * База админки Strapi для ссылок в письмах модераторам.
 * По умолчанию — публичный https://atlantis.myjob.by. Внутренний хост вида
 * http://10.0.15.202:1337 в письмах использовать не стоит: он недоступен извне.
 * Допускается указание базы как с суффиксом /admin, так и без него.
 */
function getStrapiAdminURL(): string {
  const raw =
    process.env.STRAPI_ADMIN_URL ||
    process.env.STRAPI_URL ||
    "https://atlantis.myjob.by";
  return raw.replace(/\/+$/, "").replace(/\/admin$/, "");
}

/** Ссылка на запись компании в content-manager админки Strapi. */
export function getCompanyAdminURL(documentId: string): string {
  return `${getStrapiAdminURL()}/admin/content-manager/collection-types/api::company.company/${documentId}`;
}

/**
 * Заявка на модерацию новой компании (модераторам, от rabota@irr.by,
 * Reply-To = email владельца компании).
 */
export async function sendCompanyModerationMail(
  input: CompanyModerationMailInput,
): Promise<boolean> {
  const to =
    process.env.MAIL_TO_MODERATION ||
    process.env.MAIL_TO_SUPPORT ||
    "rabota@irr.by";

  const registeredAt = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Minsk",
  });

  const payload = {
    ...input,
    registeredAt,
    adminUrl: getCompanyAdminURL(input.documentId),
  };

  return sendMail({
    identity: "support",
    to,
    subject: `Новая компания на модерацию: ${input.companyName}`,
    html: companyModerationRequestHtml(payload),
    text: companyModerationRequestText(payload),
    replyTo: input.ownerEmail,
  });
}

/** Уведомление компании о прохождении модерации (владельцу, от no-reply@myjob.by). */
export async function sendCompanyApprovedMail(input: {
  companyName: string;
  email: string;
}): Promise<boolean> {
  const appUrl = (
    process.env.BETTER_AUTH_URL ||
    process.env.APP_URL ||
    "https://myjob.by"
  ).replace(/\/$/, "");

  const dashboardUrl = `${appUrl}/company/dashboard`;

  return sendMail({
    identity: "no-reply",
    to: input.email,
    subject: "Компания прошла модерацию — MyJOB",
    html: companyApprovedEmailHtml({
      companyName: input.companyName,
      dashboardUrl,
    }),
    text: companyApprovedEmailText({
      companyName: input.companyName,
      dashboardUrl,
    }),
  });
}
