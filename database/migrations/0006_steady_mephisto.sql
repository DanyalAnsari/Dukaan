ALTER TABLE "bills" RENAME COLUMN "user_id" TO "created_by_user_id";--> statement-breakpoint
ALTER TABLE "payments" RENAME COLUMN "user_id" TO "recorded_by_user_id";--> statement-breakpoint
ALTER TABLE "bills" DROP CONSTRAINT "bills_user_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_customers_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "bills_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shops" ADD CONSTRAINT "shops_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shop_organization_idx" ON "shops" USING btree ("organization_id");