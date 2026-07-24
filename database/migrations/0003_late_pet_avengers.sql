CREATE TABLE "stock_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"adjustment_qty" integer NOT NULL,
	"reason" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bills" DROP CONSTRAINT "bills_created_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_recorded_by_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "shops" DROP CONSTRAINT "shops_organization_id_organization_id_fk";
--> statement-breakpoint
DROP INDEX "shop_organization_idx";--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_adjustment_shop_idx" ON "stock_adjustments" USING btree ("shop_id");--> statement-breakpoint
CREATE INDEX "stock_adjustment_product_idx" ON "stock_adjustments" USING btree ("product_id");--> statement-breakpoint
ALTER TABLE "bills" DROP COLUMN "created_by_user_id";--> statement-breakpoint
ALTER TABLE "payments" DROP COLUMN "recorded_by_user_id";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "shops" DROP COLUMN "bills_this_month";