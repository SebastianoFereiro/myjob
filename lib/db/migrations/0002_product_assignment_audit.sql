CREATE TYPE "public"."product_audit_event_type" AS ENUM('activated', 'deactivated', 'expired');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('premium', 'auto_boost');--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE TABLE "product_assignment_audit" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"company_id" text NOT NULL,
	"vacancy_id" text NOT NULL,
	"vacancy_title" text DEFAULT '' NOT NULL,
	"vacancy_slug" text,
	"product_type" "product_type" NOT NULL,
	"event_type" "product_audit_event_type" NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_assignment_audit_id_created_at_pk" PRIMARY KEY("id","created_at")
) PARTITION BY RANGE ("created_at");--> statement-breakpoint
-- Партиции на текущий месяц и 2 месяца вперёд (UTC).
-- Дальнейшее создание и удаление выполняет крон обслуживания (lib/db/partitions.ts).
DO $$
DECLARE
	current_month date := date_trunc('month', (now() AT TIME ZONE 'UTC'))::date;
	offset_months int;
	part_name text;
	range_from timestamptz;
	range_to timestamptz;
BEGIN
	FOR offset_months IN 0..2 LOOP
		range_from := (current_month + (offset_months || ' month')::interval) AT TIME ZONE 'UTC';
		range_to := (current_month + ((offset_months + 1) || ' month')::interval) AT TIME ZONE 'UTC';
		part_name := 'product_assignment_audit_' || to_char(range_from AT TIME ZONE 'UTC', 'YYYY_MM');
		EXECUTE format(
			'CREATE TABLE IF NOT EXISTS %I PARTITION OF product_assignment_audit FOR VALUES FROM (%L) TO (%L)',
			part_name, range_from, range_to
		);
	END LOOP;
END $$;--> statement-breakpoint
CREATE INDEX "paa_company_created_idx" ON "product_assignment_audit" USING btree ("company_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "paa_company_vacancy_created_idx" ON "product_assignment_audit" USING btree ("company_id","vacancy_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "paa_vacancy_product_created_idx" ON "product_assignment_audit" USING btree ("vacancy_id","product_type","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "paa_vacancy_title_trgm_idx" ON "product_assignment_audit" USING gin ("vacancy_title" gin_trgm_ops);
