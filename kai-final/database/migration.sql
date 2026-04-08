-- ============================================================
-- KAI FINAL — All new DB tables
-- Run: npx prisma migrate dev --name kai_final
-- ============================================================

-- Review Requests
CREATE TABLE IF NOT EXISTS "ReviewRequest" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
    "orderId"    TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storeId"    TEXT NOT NULL,
    "sentAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewLeft" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReviewRequest_pkey" PRIMARY KEY ("id")
);

-- Price Test (A/B)
CREATE TABLE IF NOT EXISTS "PriceTest" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"   TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceA"    DOUBLE PRECISION NOT NULL,
    "priceB"    DOUBLE PRECISION NOT NULL,
    "visitsA"   INTEGER DEFAULT 0,
    "visitsB"   INTEGER DEFAULT 0,
    "ordersA"   INTEGER DEFAULT 0,
    "ordersB"   INTEGER DEFAULT 0,
    "winner"    TEXT,
    "status"    TEXT DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt"   TIMESTAMP(3),
    CONSTRAINT "PriceTest_pkey" PRIMARY KEY ("id")
);

-- WhatsApp Broadcasts
CREATE TABLE IF NOT EXISTS "WhatsappBroadcast" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"        TEXT NOT NULL,
    "message"        TEXT NOT NULL,
    "scheduledAt"    TIMESTAMP(3),
    "sentAt"         TIMESTAMP(3),
    "status"         TEXT DEFAULT 'draft',
    "recipientCount" INTEGER DEFAULT 0,
    "sentCount"      INTEGER DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WhatsappBroadcast_pkey" PRIMARY KEY ("id")
);

-- Loyalty Accounts
CREATE TABLE IF NOT EXISTS "LoyaltyAccount" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "customerId"    TEXT NOT NULL,
    "storeId"       TEXT NOT NULL,
    "points"        INTEGER NOT NULL DEFAULT 0,
    "totalEarned"   INTEGER NOT NULL DEFAULT 0,
    "totalRedeemed" INTEGER NOT NULL DEFAULT 0,
    "tier"          TEXT NOT NULL DEFAULT 'bronze',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyAccount_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LoyaltyAccount_customer_store" UNIQUE ("customerId", "storeId")
);

-- Loyalty Transactions
CREATE TABLE IF NOT EXISTS "LoyaltyTransaction" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "accountId"   TEXT NOT NULL,
    "type"        TEXT NOT NULL,
    "points"      INTEGER NOT NULL,
    "description" TEXT,
    "orderId"     TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- Store Achievements
CREATE TABLE IF NOT EXISTS "StoreAchievement" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"       TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreAchievement_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StoreAchievement_unique" UNIQUE ("storeId", "achievementId")
);

-- Foreign keys
ALTER TABLE "ReviewRequest" ADD CONSTRAINT "ReviewRequest_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE;
ALTER TABLE "LoyaltyAccount" ADD CONSTRAINT "LoyaltyAccount_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "LoyaltyAccount"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "ReviewRequest_storeId_idx"     ON "ReviewRequest"("storeId");
CREATE INDEX IF NOT EXISTS "ReviewRequest_orderId_idx"     ON "ReviewRequest"("orderId");
CREATE INDEX IF NOT EXISTS "PriceTest_storeId_idx"         ON "PriceTest"("storeId");
CREATE INDEX IF NOT EXISTS "WhatsappBroadcast_storeId_idx" ON "WhatsappBroadcast"("storeId");
CREATE INDEX IF NOT EXISTS "LoyaltyAccount_storeId_idx"    ON "LoyaltyAccount"("storeId");
CREATE INDEX IF NOT EXISTS "StoreAchievement_storeId_idx"  ON "StoreAchievement"("storeId");
