-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "fulfillmentStatus" TEXT NOT NULL DEFAULT 'UNFULFILLED',
ADD COLUMN     "tax" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "stockQuantity" INTEGER;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "loyaltyEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "themeSettings" JSONB;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_memories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ttl" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target" DOUBLE PRECISION,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'NGN',
    "deadline" TIMESTAMP(3),
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_market_cache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kai_market_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_pulse_alerts" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kai_pulse_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_morning_briefs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "kai_morning_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_brand_voices" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'friendly',
    "style" TEXT NOT NULL DEFAULT 'conversational',
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_brand_voices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_accounts" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_requests" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kai_memories_userId_key_key" ON "kai_memories"("userId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "kai_market_cache_key_key" ON "kai_market_cache"("key");

-- CreateIndex
CREATE INDEX "kai_pulse_alerts_storeId_idx" ON "kai_pulse_alerts"("storeId");

-- CreateIndex
CREATE INDEX "kai_pulse_alerts_userId_idx" ON "kai_pulse_alerts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kai_brand_voices_storeId_key" ON "kai_brand_voices"("storeId");

-- CreateIndex
CREATE INDEX "kai_skills_userId_idx" ON "kai_skills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_accounts_storeId_customerId_key" ON "loyalty_accounts"("storeId", "customerId");

-- CreateIndex
CREATE UNIQUE INDEX "review_requests_orderId_key" ON "review_requests"("orderId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
