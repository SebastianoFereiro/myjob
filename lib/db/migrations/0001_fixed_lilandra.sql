CREATE TABLE "company_moderation_notice" (
	"id" text PRIMARY KEY NOT NULL,
	"company_id" text NOT NULL,
	"company_name" text NOT NULL,
	"owner_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_moderation_notice_company_id_unique" UNIQUE("company_id")
);
