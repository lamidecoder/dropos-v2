/*
  Warnings:

  - A unique constraint covering the columns `[storeId,key]` on the table `kai_memories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[storeId,date]` on the table `kai_morning_briefs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `kai_market_cache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "discountType" TEXT;

-- AlterTable
ALTER TABLE "kai_brand_voices" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "usesEmojis" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "kai_goals" ADD COLUMN     "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "targetValue" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "kai_market_cache" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "kai_memories" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN     "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "kai_messages" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "kai_morning_briefs" ADD COLUMN     "revenueLastNight" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "topOpportunity" TEXT;

-- AlterTable
ALTER TABLE "kai_pulse_alerts" ADD COLUMN     "severity" TEXT NOT NULL DEFAULT 'info';

-- AlterTable
ALTER TABLE "kai_skills" ADD COLUMN     "isGlobal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "loyalty_accounts" ADD COLUMN     "totalRedeemed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "carrier" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "currency" TEXT,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "review_requests" ALTER COLUMN "email" SET DEFAULT '';

-- CreateTable
CREATE TABLE "profit_protection_rules" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minMargin" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "action" TEXT NOT NULL DEFAULT 'alert',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profit_protection_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profit_protection_rules_storeId_idx" ON "profit_protection_rules"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "kai_memories_storeId_key_key" ON "kai_memories"("storeId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "kai_morning_briefs_storeId_date_key" ON "kai_morning_briefs"("storeId", "date");
