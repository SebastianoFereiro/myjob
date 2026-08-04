/**
 * Dev-скрипт проверки SMTP-подключения (Stalwart v0.16, mail.myjob.by).
 *
 * Запуск:
 *   node --env-file=.env --import tsx scripts/test-smtp.ts [email]
 *
 * По умолчанию письма уходят на support@myjob.by (SMOKE-TEST).
 */
import { sendContactMail, sendResetPasswordMail, sendVerificationMail } from "../lib/mail/send";

async function main() {
  const to = process.argv[2] || process.env.SMTP_USER_SUPPORT || "support@myjob.by";

  console.log(`[SMTP] Тест на адрес: ${to}`);

  const verification = await sendVerificationMail(
    { name: "Тест MyJOB", email: to },
    "https://myjob.by/verify-email?token=test-token",
  );
  console.log(`[SMTP] verification email: ${verification ? "OK" : "FAIL"}`);

  const reset = await sendResetPasswordMail(
    { name: "Тест MyJOB", email: to },
    "https://myjob.by/reset-password/test-token?callbackURL=%2Fauth%2Flogin",
  );
  console.log(`[SMTP] reset password email: ${reset ? "OK" : "FAIL"}`);

  const contact = await sendContactMail({
    name: "Тест MyJOB",
    email: to,
    subject: "Тест контактной формы",
    message: "Проверка отправки через Stalwart SMTP.",
  });
  console.log(`[SMTP] contact email: ${contact ? "OK" : "FAIL"}`);

  if (!verification || !reset || !contact) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[SMTP] Ошибка:", err);
  process.exit(1);
});
