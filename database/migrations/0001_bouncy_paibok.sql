ALTER TYPE "public"."bill_status" ADD VALUE 'draft';--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "status" SET DEFAULT 'draft';