-- AlterTable
ALTER TABLE "kai_conversations" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "store_customers" ADD COLUMN     "city" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalOrders" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "kai_action_logs" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "conversationId" TEXT,
    "actionType" TEXT NOT NULL,
    "payload" JSONB,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kai_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kai_action_logs_storeId_idx" ON "kai_action_logs"("storeId");
