/**
 * Dev-скрипт проверки писем модерации компаний.
 *
 * Запуск:
 *   node --env-file=.env --import tsx scripts/test-company-mails.ts [email]
 *
 * Без аргумента письма уходят на MAIL_TO_MODERATION или rabota@irr.by.
 */
import {
  getCompanyAdminURL,
  sendCompanyApprovedMail,
  sendCompanyModerationMail,
} from "../lib/mail/send";

async function main() {
  const to =
    process.argv[2] || process.env.MAIL_TO_MODERATION || "rabota@irr.by";

  console.log(`[MAIL] Тест писем модерации, адрес: ${to}`);
  console.log(`[MAIL] Ссылка в админку: ${getCompanyAdminURL("test-document-id")}`);

  const request = await sendCompanyModerationMail({
    companyName: "ООО Тестовая Компания",
    companySlug: "testovaya-kompaniya",
    ynp: "123456789",
    ownerEmail: to,
    documentId: "test-document-id",
  });
  console.log(`[MAIL] moderation request: ${request ? "OK" : "FAIL"}`);

  const approved = await sendCompanyApprovedMail({
    companyName: "ООО Тестовая Компания",
    email: to,
  });
  console.log(`[MAIL] company approved: ${approved ? "OK" : "FAIL"}`);

  if (!request || !approved) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("[MAIL] Ошибка:", err);
  process.exit(1);
});
