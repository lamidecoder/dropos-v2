-- ============================================================
-- Priority 1-3 Features — DB additions
-- Add these if not already in schema
-- ============================================================

-- WhatsApp Broadcast Schedule
CREATE TABLE IF NOT EXISTS "WhatsappBroadcast" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"     TEXT NOT NULL,
    "message"     TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "sentAt"      TIMESTAMP(3),
    "status"      TEXT NOT NULL DEFAULT 'draft',
    "recipientCount" INTEGER DEFAULT 0,
    "openCount"   INTEGER DEFAULT 0,
    "orderCount"  INTEGER DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsappBroadcast_pkey" PRIMARY KEY ("id")
);

-- Achievement unlocks per store
CREATE TABLE IF NOT EXISTS "StoreAchievement" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"     TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreAchievement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StoreAchievement_unique" UNIQUE ("storeId", "achievementId")
);

-- Review requests sent
CREATE TABLE IF NOT EXISTS "ReviewRequest" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId"    TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId"    TEXT NOT NULL,
    "sentAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewLeft" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- Price A/B Tests
CREATE TABLE IF NOT EXISTS "PriceTest" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"     TEXT NOT NULL,
    "productId"   TEXT NOT NULL,
    "priceA"      DOUBLE PRECISION NOT NULL,
    "priceB"      DOUBLE PRECISION NOT NULL,
    "visitsA"     INTEGER NOT NULL DEFAULT 0,
    "visitsB"     INTEGER NOT NULL DEFAULT 0,
    "ordersA"     INTEGER NOT NULL DEFAULT 0,
    "ordersB"     INTEGER NOT NULL DEFAULT 0,
    "winner"      TEXT,
    "status"      TEXT NOT NULL DEFAULT 'active',
    "startedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt"     TIMESTAMP(3),
    CONSTRAINT "PriceTest_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "WhatsappBroadcast_storeId_idx" ON "WhatsappBroadcast"("storeId");
CREATE INDEX IF NOT EXISTS "StoreAchievement_storeId_idx" ON "StoreAchievement"("storeId");
CREATE INDEX IF NOT EXISTS "ReviewRequest_storeId_idx" ON "ReviewRequest"("storeId");
CREATE INDEX IF NOT EXISTS "PriceTest_storeId_idx" ON "PriceTest"("storeId");
