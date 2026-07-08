ALTER TABLE "charges" ALTER COLUMN "arrival_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN IF NOT EXISTS "event_id" uuid;
--> statement-breakpoint
ALTER TABLE "charges" ADD COLUMN IF NOT EXISTS "kind" text DEFAULT 'late_arrival' NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "charges" ADD CONSTRAINT "charges_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
