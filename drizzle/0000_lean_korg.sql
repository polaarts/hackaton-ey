CREATE TABLE "report_evidence" (
	"report_id" uuid NOT NULL,
	"url" text NOT NULL,
	CONSTRAINT "report_evidence_report_id_url_pk" PRIMARY KEY("report_id","url")
);
--> statement-breakpoint
CREATE TABLE "report_last_known_positions" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"datetime" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "report_locations" (
	"report_id" uuid PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6)
);
--> statement-breakpoint
CREATE TABLE "report_recommended_actions" (
	"report_id" uuid NOT NULL,
	"action" text NOT NULL,
	CONSTRAINT "report_recommended_actions_report_id_action_pk" PRIMARY KEY("report_id","action")
);
--> statement-breakpoint
CREATE TABLE "report_timeline_events" (
	"report_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"address" text NOT NULL,
	"datetime" timestamp with time zone NOT NULL,
	"source" text,
	"notes" text,
	CONSTRAINT "report_timeline_events_report_id_index_pk" PRIMARY KEY("report_id","index")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"incident_datetime" timestamp with time zone NOT NULL,
	"license_plate" text,
	"vehicle_description" text,
	"image_description_raw" text,
	"confidence" numeric NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "report_evidence" ADD CONSTRAINT "report_evidence_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_last_known_positions" ADD CONSTRAINT "report_last_known_positions_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_locations" ADD CONSTRAINT "report_locations_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_recommended_actions" ADD CONSTRAINT "report_recommended_actions_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_timeline_events" ADD CONSTRAINT "report_timeline_events_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;