-- Add announcement bar and social media links to Store
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "announcement" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "tiktok" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "stores" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
