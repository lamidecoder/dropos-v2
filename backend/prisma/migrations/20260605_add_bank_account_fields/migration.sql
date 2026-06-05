-- Add missing columns to stores table
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "bankName"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "bankCode"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "accountNumber"     TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "accountName"       TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackSubCode"   TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackPublicKey" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackSecretKey" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "announcement"      TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "instagram"         TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "tiktok"            TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "facebook"          TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "twitter"           TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "templateId"        TEXT;
