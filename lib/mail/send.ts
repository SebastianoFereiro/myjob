import { MAIL_FROM, getTransporter, type MailIdentity } from "./transporter";
import {
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

/** Уведомление из контактной формы на support@myjob.by (от support@myjob.by, Reply-To = автор). */
export async function sendContactMail(input: ContactMailInput): Promise<boolean> {
  const to = process.env.MAIL_TO_SUPPORT || "support@myjob.by";
  return sendMail({
    identity: "support",
    to,
    subject: `Контактная форма: ${input.subject}`,
    html: contactNotificationHtml(input),
    text: contactNotificationText(input),
    replyTo: input.email,
  });
}
