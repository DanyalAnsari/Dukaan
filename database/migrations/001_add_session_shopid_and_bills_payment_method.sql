-- Migration: Add shopId to session table and paymentMethod to bills table
-- Run with: pnpm db:migrate

-- Add shopId to session table
ALTER TABLE session ADD COLUMN shop_id UUID REFERENCES shops(id);

-- Add paymentMethod to bills table
ALTER TABLE bills ADD COLUMN payment_method TEXT DEFAULT 'cash';