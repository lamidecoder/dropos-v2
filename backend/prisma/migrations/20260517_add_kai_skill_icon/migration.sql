-- Add icon field to kai_skills table
ALTER TABLE "kai_skills" ADD COLUMN IF NOT EXISTS "icon" TEXT DEFAULT '⚡';
