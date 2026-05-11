ALTER TABLE "events" ADD COLUMN "source" text DEFAULT 'google_calendar' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_fee_cents" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "roll_call_seen_at" timestamp with time zone;