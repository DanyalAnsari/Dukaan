ALTER TYPE "public"."bill_status" ADD VALUE IF NOT EXISTS 'draft';--> statement-breakpoint
ALTER TABLE "bills" ALTER COLUMN "status" SET DEFAULT 'draft';