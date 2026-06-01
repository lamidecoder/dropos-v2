-- Add Paystack keys and WhatsApp to stores
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackPublicKey"  TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "paystackSecretKey"  TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "whatsappPhone"      TEXT;

-- Add missing social fields from earlier migration if not present
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "announcement" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "instagram"    TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "tiktok"       TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "facebook"     TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "twitter"      TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "templateId"   TEXT;
