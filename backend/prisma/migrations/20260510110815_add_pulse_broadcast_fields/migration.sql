-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "usageLimit" INTEGER;

-- AlterTable
ALTER TABLE "kai_brand_voices" ADD COLUMN     "sampleContent" TEXT;

-- AlterTable
ALTER TABLE "kai_conversations" ADD COLUMN     "storeId" TEXT;

-- AlterTable
ALTER TABLE "kai_memories" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "kai_morning_briefs" ADD COLUMN     "urgentAction" TEXT;

-- AlterTable
ALTER TABLE "kai_pulse_alerts" ADD COLUMN     "suggestedPrompt" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "whatsapp_broadcasts" ADD COLUMN     "recipientCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "sentCount" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "whatsapp_broadcasts" ADD CONSTRAINT "whatsapp_broadcasts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
