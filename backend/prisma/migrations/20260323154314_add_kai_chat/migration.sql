-- CreateTable
CREATE TABLE "kai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "action" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kai_conversations_userId_idx" ON "kai_conversations"("userId");

-- CreateIndex
CREATE INDEX "kai_messages_conversationId_idx" ON "kai_messages"("conversationId");

-- AddForeignKey
ALTER TABLE "kai_conversations" ADD CONSTRAINT "kai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kai_messages" ADD CONSTRAINT "kai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "kai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
