ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" text;--> statement-breakpoint
-- Better-Auth 1.7: идентичность аккаунта привязана к issuer.
-- Backfill существующих credential-аккаунтов (без этого вход по паролю возвращает 401).
UPDATE "account" SET "issuer" = 'local:credential' WHERE "provider_id" = 'credential' AND "issuer" IS NULL;
