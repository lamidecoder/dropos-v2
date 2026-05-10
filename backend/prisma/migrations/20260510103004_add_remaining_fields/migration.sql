-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "kai_brand_voices" ADD COLUMN     "sentenceLength" TEXT NOT NULL DEFAULT 'medium';

-- AlterTable
ALTER TABLE "kai_memories" ADD COLUMN     "sourceConversationId" TEXT;

-- AlterTable
ALTER TABLE "kai_morning_briefs" ADD COLUMN     "ordersLastNight" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "kai_pulse_alerts" ADD COLUMN     "actionable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "shippedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "profit_protection_rules" ADD COLUMN     "actionValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "threshold" DOUBLE PRECISION NOT NULL DEFAULT 20,
ADD COLUMN     "trigger" TEXT NOT NULL DEFAULT 'margin_drop';

-- AlterTable
ALTER TABLE "store_customers" ADD COLUMN     "country" TEXT;

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_broadcasts" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipients" INTEGER NOT NULL DEFAULT 0,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loyalty_transactions_accountId_idx" ON "loyalty_transactions"("accountId");

-- CreateIndex
CREATE INDEX "whatsapp_broadcasts_storeId_idx" ON "whatsapp_broadcasts"("storeId");

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
