# Blueprint: E-mail уведомления о модерации компании

Статус: реализовано 2026-09-10. Таблица `company_moderation_notice` создана в БД (Postgres), сборка `pnpm build` проходит, роут `/api/cron/company-moderation` зарегистрирован. Осталось настроить внешний вызов cron раз в час и при необходимости задать `MAIL_TO_MODERATION` и `STRAPI_ADMIN_URL`.

## 1. Цель

1. При регистрации компании отправлять письмо модератору на `rabota@irr.by` с данными зарегистрированной компании, отметкой о необходимости модерации и ссылкой на запись в админке Strapi.
2. После прохождения модерации, то есть при `isActive: true` в Strapi, отправить компании-владельцу уведомление об успешном прохождении модерации.
3. Не менять схему Strapi: факт прохождения модерации определяется по полю `isActive`, состояние модерации и признак отправки хранятся в Postgres-таблице `company_moderation_notice`.
4. Уведомление о прохождении модерации отправляется ровно один раз: cron раз в 1 час берёт из таблицы записи со статусом `pending` и проверяет соответствующую компанию в Strapi.

## 2. Ключевые решения

| Решение | Значение |
| --- | --- |
| Точка отправки письма модератору | `app/api/company/register/route.ts`, шаг 5, после привязки `companyId` к пользователю |
| Отправитель письма модератору | identity `support` = `rabota@irr.by`, `to` = `MAIL_TO_MODERATION` или `rabota@irr.by` (MAIL_TO_SUPPORT не используется, там support@myjob.by), `Reply-To` = email владельца |
| Детект прохождения модерации | Cron-роут в Next.js раз в 1 час по образцу `app/api/cron/auto-push/route.ts`: берёт `pending`-записи из `company_moderation_notice` и проверяет `isActive` каждой компании в Strapi |
| Идемпотентность | Статус записи `pending` переводится в `notified` только после успешной отправки письма, повторный запуск cron обрабатывает лишь `pending` |
| Источник списка компаний для проверки | Только таблица `company_moderation_notice`: компании без записи не опрашиваются и писем не получают |
| Отправитель письма компании | identity `no-reply` = `no-reply@myjob.by` |
| Email владельца | Better-Auth `user` по `companyId`, fallback `email` из записи компании в Strapi |
| Схема Strapi | Не изменяется |
| Ошибки почты | Не влияют на успех регистрации, обёртка `sendMail` уже возвращает `false` без исключений |

## 3. Архитектура

```mermaid
graph TD
  R[RegisterForm] --> API[app/api/company/register]
  API --> SP[Strapi companies isActive false]
  API --> DB[Postgres Better-Auth]
  API --> NOTE[company_moderation_notice status pending]
  API --> M1[sendCompanyModerationMail]
  M1 --> MT[rabota@irr.by]
  M1 --> ADM[Strapi Admin ссылка на запись]
  CRON[app/api/cron/company-moderation запуск раз в 1 час] --> NOTE
  NOTE --> PEND[pending записи]
  PEND --> CHK[GET company documentId в Strapi]
  CHK --> Q{isActive true}
  Q -->|да| M2[sendCompanyApprovedMail]
  Q -->|нет| WAIT[остаётся pending до следующего запуска]
  M2 --> OWN[Email владельца компании]
  M2 --> UPD[status notified уведомление отправлено один раз]
  ML[lib/mail send.ts] --> TR[transporter.ts nodemailer]
  TPL[lib/mail templates.ts] --> ML
  M1 --> ML
  M2 --> ML
```

## 4. Файлы: изменить

- `lib/mail/templates.ts` — добавить `companyModerationRequestHtml/Text` и `companyApprovedHtml/Text` на базе существующих `layoutHtml` и `contentHtml`.
- `lib/mail/send.ts` — добавить `sendCompanyModerationMail(input)` и `sendCompanyApprovedMail(input)` через общую обёртку `sendMail`.
- `app/api/company/register/route.ts` — в `POST /api/company/register`:
  - при создании компании писать `email` владельца в данные Strapi, сейчас отправляются только `name`, `slug`, `ynp`, `isActive`;
  - после привязки `companyId` создать запись `company_moderation_notice` со статусом `pending` и данными компании и владельца;
  - затем вызвать `sendCompanyModerationMail` в `try/catch`, результат залогировать, ответ клиенту не менять;
  - сбой SMTP или записи в таблицу не отменяет регистрацию, но логируется для разбора.
- `memory-bank/progress.md`, `memory-bank/techContext.md` — зафиксировать фичу.
- `plans/email-smtp-forms-plan.md` — дополнить перечень env-переменных при необходимости.

## 5. Файлы: создать

- `lib/db/schema/notifications.ts` — таблица `company_moderation_notice`: `id`, `company_id` уникальный, `company_name`, `owner_email`, `status` со значениями `pending` и `notified`, `notified_at`, `created_at`. Drizzle-конфиг уже покрывает `lib/db/schema/*.ts`.
- `lib/db/migrations/0001_*.sql` — миграция, генерируется `drizzle-kit generate`.
- `app/api/cron/company-moderation/route.ts` — GET-роут, рассчитанный на запуск раз в 1 час:
  - `authCheck` по `CRON_SECRET`, как в `app/api/cron/auto-push/route.ts`;
  - выборка `pending`-записей из `company_moderation_notice` через `db` Drizzle, лимит 100;
  - для каждой записи запрос `GET /companies/{documentId}` через `fetchAPI` и проверка `isActive === true`;
  - при подтверждённой модерации: поиск владельца в `user` по `companyId` для актуального email, отправка `sendCompanyApprovedMail`, затем `UPDATE` записи в статус `notified` с `notified_at`;
  - при ошибке отправки запись остаётся `pending` и будет повторена на следующем запуске, повторного письма после успешной отправки не будет;
  - ответ-сводка `{ ok, checked, sent, pending, errors }`.
- `scripts/test-company-mails.ts` — ручная проверка обоих писем на тестовый адрес, по образцу `scripts/test-smtp.ts`.

## 6. Содержимое писем

### 6.1 Письмо модератору

Тема: `Новая компания на модерацию: {name}`

Тело: название, slug, УНП, email владельца, documentId, дата и время регистрации, статус `isActive: false`, пометка о необходимости проверить данные УНП и активировать компанию, CTA-кнопка «Открыть в админке Strapi».

Ссылка: `${STRAPI_ADMIN_URL || getStrapiURL()}/admin/content-manager/collection-types/api::company.company/${documentId}`

### 6.2 Письмо компании о прохождении модерации

Тема: `Компания прошла модерацию — MyJOB`

Тело: обращение по названию компании, сообщение об успешном прохождении модерации и активации аккаунта, возможность публиковать вакансии, CTA-кнопка «Перейти в кабинет» на `${APP_URL}/company/dashboard`.

## 7. Переменные окружения

```dotenv
# Получатель уведомлений о новых компаниях. Если не задано, письмо уходит на rabota@irr.by
MAIL_TO_MODERATION=rabota@irr.by

# База админки Strapi для ссылок в письме, по умолчанию STRAPI_URL.
# Публичная админка прод: https://atlantis.myjob.by/admin/
# Внутренний адрес прод-Strapi http://10.0.15.202:1337 в письмах не использовать,
# он недоступен извне. Значение можно указывать как с суффиксом /admin, так и без.
STRAPI_ADMIN_URL=https://atlantis.myjob.by

# Секрет для cron-роутов, уже используется в /api/cron/auto-push
CRON_SECRET=cronsecret
```

### 7.1 Расписание cron

Проверка модерации запускается раз в час только в рабочие часы: с 09:00 до 18:00, с понедельника по пятницу. Строка crontab:

```cron
0 9-18 * * 1-5 curl -s "http://localhost:3000/api/cron/company-moderation?secret=cronsecret"
```

Значение `secret` должно совпадать с `CRON_SECRET`. За пределами рабочего окна роут не вызывается, поэтому письма компании не уходят ночью и в выходные.

## 8. Порядок реализации

1. Шаблоны писем в `lib/mail/templates.ts`.
2. Отправщики в `lib/mail/send.ts`.
3. Drizzle-таблица `company_moderation_notice` и миграция.
4. Регистрация: запись `email` компании в Strapi, создание `pending`-записи и вызов письма модератору в `app/api/company/register/route.ts`.
5. Cron-роут `app/api/cron/company-moderation/route.ts` с проверкой Strapi и однократной отправкой.
6. Расписание запуска cron раз в 1 час.
7. Скрипт ручной проверки `scripts/test-company-mails.ts`.
8. Env и документация, обновление `memory-bank`.
9. `pnpm lint`, `pnpm build`, ручная проверка писем и повторного запуска cron.

## 9. Замечания и риски

- Cron запускается раз в 1 час внешним планировщиком, расписание задаётся на стороне хостинга или в конфиге cron и меняется без правок кода.
- Registration flow не должен падать при недоступном SMTP: письмо отправляется после успешной привязки `companyId`, результат игнорируется для статуса ответа.
- Однократность обеспечивается переходом `pending` в `notified` только после успешного `sendMail`, поэтому сбой SMTP приводит к повторной попытке через час, а не к повторному письму.
- Записи со статусом `pending` по компаниям, которые так и не прошли модерацию, опрашиваются бессрочно. При необходимости ограничить окно проверки по возрасту записи или закрывать их вручную.
- Ссылка на админку Strapi предполагает стандартный content-manager путь `api::company.company`; проверить фактический UID коллекции Companies в развёрнутом Strapi.
- Отклонение компании в письме не предусмотрено, только успешная модерация.
- Секреты SMTP и `CRON_SECRET` не коммитить, использовать только `.env`.
