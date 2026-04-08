-- ============================================================
-- KAI Complete Migration (10/10)
-- Path: database/kai-migration.sql
-- Run AFTER adding models to schema.prisma:
--   npx prisma migrate dev --name add_kai_complete
-- ============================================================

-- KAI Conversations
CREATE TABLE IF NOT EXISTS "KaiConversation" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"   TEXT NOT NULL,
    "title"     TEXT NOT NULL DEFAULT 'New Conversation',
    "pinned"    BOOLEAN NOT NULL DEFAULT false,
    "archived"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KaiMessage" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "conversationId" TEXT NOT NULL,
    "role"           TEXT NOT NULL,
    "content"        TEXT NOT NULL,
    "metadata"       JSONB,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KaiActionLog" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"        TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "actionType"     TEXT NOT NULL,
    "payload"        JSONB NOT NULL,
    "approved"       BOOLEAN NOT NULL DEFAULT false,
    "executed"       BOOLEAN NOT NULL DEFAULT false,
    "result"         JSONB,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiActionLog_pkey" PRIMARY KEY ("id")
);

-- Persistent Memory
CREATE TABLE IF NOT EXISTS "KaiMemory" (
    "id"                    TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"               TEXT NOT NULL,
    "category"              TEXT NOT NULL,
    "key"                   TEXT NOT NULL,
    "value"                 TEXT NOT NULL,
    "confidence"            DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "learnedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceConversationId"  TEXT,
    CONSTRAINT "KaiMemory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KaiMemory_storeId_key_key" UNIQUE ("storeId", "key")
);

-- Goals
CREATE TABLE IF NOT EXISTS "KaiGoal" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"      TEXT NOT NULL,
    "title"        TEXT NOT NULL,
    "description"  TEXT,
    "targetValue"  DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit"         TEXT NOT NULL,
    "deadline"     TIMESTAMP(3) NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'active',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KaiMilestone" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "goalId"      TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "achieved"    BOOLEAN NOT NULL DEFAULT false,
    "achievedAt"  TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiMilestone_pkey" PRIMARY KEY ("id")
);

-- Skills
CREATE TABLE IF NOT EXISTS "KaiSkill" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"     TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "prompt"      TEXT NOT NULL,
    "variables"   JSONB NOT NULL DEFAULT '[]',
    "icon"        TEXT,
    "usageCount"  INTEGER NOT NULL DEFAULT 0,
    "isGlobal"    BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiSkill_pkey" PRIMARY KEY ("id")
);

-- Pulse Alerts
CREATE TABLE IF NOT EXISTS "KaiPulseAlert" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"         TEXT NOT NULL,
    "type"            TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "message"         TEXT NOT NULL,
    "severity"        TEXT NOT NULL DEFAULT 'info',
    "read"            BOOLEAN NOT NULL DEFAULT false,
    "actionable"      BOOLEAN NOT NULL DEFAULT false,
    "suggestedPrompt" TEXT,
    "data"            JSONB,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiPulseAlert_pkey" PRIMARY KEY ("id")
);

-- Brand Voice
CREATE TABLE IF NOT EXISTS "KaiBrandVoice" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"        TEXT NOT NULL UNIQUE,
    "tone"           TEXT NOT NULL DEFAULT 'casual',
    "usesEmojis"     BOOLEAN NOT NULL DEFAULT true,
    "language"       TEXT NOT NULL DEFAULT 'english',
    "sentenceLength" TEXT NOT NULL DEFAULT 'medium',
    "keywords"       JSONB NOT NULL DEFAULT '[]',
    "avoidWords"     JSONB NOT NULL DEFAULT '[]',
    "sampleContent"  TEXT,
    "analyzedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiBrandVoice_pkey" PRIMARY KEY ("id")
);

-- Morning Brief
CREATE TABLE IF NOT EXISTS "KaiMorningBrief" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid(),
    "storeId"          TEXT NOT NULL,
    "date"             TEXT NOT NULL,
    "revenueLastNight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ordersLastNight"  INTEGER NOT NULL DEFAULT 0,
    "topOpportunity"   TEXT NOT NULL,
    "urgentAction"     TEXT,
    "trendAlert"       TEXT,
    "goalProgress"     JSONB,
    "generatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiMorningBrief_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KaiMorningBrief_storeId_date_key" UNIQUE ("storeId", "date")
);

-- Market Cache
CREATE TABLE IF NOT EXISTS "KaiMarketCache" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
    "key"       TEXT NOT NULL UNIQUE,
    "category"  TEXT NOT NULL,
    "data"      JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KaiMarketCache_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "KaiConversation" ADD CONSTRAINT "KaiConversation_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiMessage" ADD CONSTRAINT "KaiMessage_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "KaiConversation"("id") ON DELETE CASCADE;
ALTER TABLE "KaiMemory" ADD CONSTRAINT "KaiMemory_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiGoal" ADD CONSTRAINT "KaiGoal_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiMilestone" ADD CONSTRAINT "KaiMilestone_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "KaiGoal"("id") ON DELETE CASCADE;
ALTER TABLE "KaiSkill" ADD CONSTRAINT "KaiSkill_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiPulseAlert" ADD CONSTRAINT "KaiPulseAlert_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiBrandVoice" ADD CONSTRAINT "KaiBrandVoice_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;
ALTER TABLE "KaiMorningBrief" ADD CONSTRAINT "KaiMorningBrief_storeId_fkey"
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "KaiConversation_storeId_idx"  ON "KaiConversation"("storeId");
CREATE INDEX IF NOT EXISTS "KaiMessage_conversationId_idx" ON "KaiMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "KaiMemory_storeId_idx"         ON "KaiMemory"("storeId");
CREATE INDEX IF NOT EXISTS "KaiMemory_storeId_cat_idx"     ON "KaiMemory"("storeId", "category");
CREATE INDEX IF NOT EXISTS "KaiGoal_storeId_idx"           ON "KaiGoal"("storeId");
CREATE INDEX IF NOT EXISTS "KaiSkill_storeId_idx"          ON "KaiSkill"("storeId");
CREATE INDEX IF NOT EXISTS "KaiPulseAlert_storeId_idx"     ON "KaiPulseAlert"("storeId");
CREATE INDEX IF NOT EXISTS "KaiPulseAlert_read_idx"        ON "KaiPulseAlert"("storeId", "read");
CREATE INDEX IF NOT EXISTS "KaiMarketCache_key_idx"        ON "KaiMarketCache"("key");
CREATE INDEX IF NOT EXISTS "KaiMarketCache_expires_idx"    ON "KaiMarketCache"("expiresAt");
