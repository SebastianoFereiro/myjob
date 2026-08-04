type Cta = { label: string; url: string };

// Сущности собраны через конкатенацию, чтобы не попадать под HTML-декодирование при записи.
const ENT_AMP = "&" + "amp;";
const ENT_LT = "&" + "lt;";
const ENT_GT = "&" + "gt;";
const ENT_QUOT = "&" + "quot;";
const ENT_APOS = "&#" + "039;";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, ENT_AMP)
    .replace(/</g, ENT_LT)
    .replace(/>/g, ENT_GT)
    .replace(/"/g, ENT_QUOT)
    .replace(/'/g, ENT_APOS);
}

function contentHtml(paragraphs: string[], cta?: Cta): string {
  const body = paragraphs
    .map((t) => `<p style="margin:0 0 16px;color:#27272a;font-size:15px;line-height:24px;">${t}</p>`)
    .join("");

  const button = cta
    ? `<div style="margin:24px 0;text-align:center;">
        <a href="${cta.url}" style="display:inline-block;background-color:#111827;color:#ffffff;padding:13px 28px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;">${cta.label}</a>
      </div>
      <p style="margin:0 0 16px;color:#71717a;font-size:12px;line-height:18px;">Если кнопка не работает, скопируйте ссылку в браузер:</p>
      <p style="margin:0 0 16px;color:#2563eb;font-size:12px;line-height:18px;word-break:break-all;">${cta.url}</p>`
    : "";

  return body + button;
}

function layoutHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr><td style="background-color:#111827;padding:20px 28px;">
          <div style="color:#ffffff;font-size:20px;font-weight:700;">MY<span style="color:#ff6c00;">JOB</span>.BY</div>
        </td></tr>
        <tr><td style="padding:28px;">${content}</td></tr>
        <tr><td style="padding:20px 28px;background-color:#fafafa;border-top:1px solid #e4e4e7;">
          <div style="color:#71717a;font-size:12px;line-height:18px;">© ${new Date().getFullYear()} MyJOB.by — вакансии и резюме в Беларуси</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Письмо для подтверждения email при регистрации. */
export function verificationEmailHtml(opts: { name: string; url: string }): string {
  const title = "Подтверждение email — MyJOB";
  const html = layoutHtml(
    title,
    contentHtml(
      [
        `Здравствуйте, ${escapeHtml(opts.name)}!`,
        "Спасибо за регистрацию на MyJOB.by. Подтвердите адрес электронной почты, чтобы активировать аккаунт.",
      ],
      { label: "Подтвердить email", url: opts.url },
    ),
  );
  return html;
}

export function verificationEmailText(opts: { name: string; url: string }): string {
  return [
    `Здравствуйте, ${opts.name}!`,
    "Спасибо за регистрацию на MyJOB.by. Подтвердите адрес электронной почты:",
    opts.url,
  ].join("\n\n");
}

/** Письмо для восстановления пароля. */
export function resetPasswordEmailHtml(opts: { name: string; url: string }): string {
  const title = "Восстановление пароля — MyJOB";
  const html = layoutHtml(
    title,
    contentHtml(
      [
        `Здравствуйте, ${escapeHtml(opts.name)}!`,
        "Мы получили запрос на восстановление пароля. Перейдите по ссылке ниже, чтобы задать новый пароль.",
        "Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
      ],
      { label: "Сбросить пароль", url: opts.url },
    ),
  );
  return html;
}

export function resetPasswordEmailText(opts: { name: string; url: string }): string {
  return [
    `Здравствуйте, ${opts.name}!`,
    "Мы получили запрос на восстановление пароля. Перейдите по ссылке:",
    opts.url,
    "Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.",
  ].join("\n\n");
}

/** Уведомление о заявке из контактной формы (на support@myjob.by). */
export function contactNotificationHtml(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const title = `Контактная форма: ${input.subject}`;
  const html = layoutHtml(
    title,
    contentHtml([
      `<strong>Имя:</strong> ${escapeHtml(input.name)}`,
      `<strong>Email:</strong> ${escapeHtml(input.email)}`,
      `<strong>Тема:</strong> ${escapeHtml(input.subject)}`,
      `<strong>Сообщение:</strong><br/>${escapeHtml(input.message).replace(/\n/g, "<br/>")}`,
    ]),
  );
  return html;
}

export function contactNotificationText(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return [
    `Имя: ${input.name}`,
    `Email: ${input.email}`,
    `Тема: ${input.subject}`,
    `Сообщение:\n${input.message}`,
  ].join("\n");
}
