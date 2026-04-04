// ============================================================
// KAI — Memory Service
// Path: backend/src/services/kai.memory.service.ts
// KAI remembers everything across ALL sessions forever
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Save a memory ─────────────────────────────────────────────
export async function saveMemory(
  storeId: string,
  category: string,
  key: string,
  value: string,
  confidence = 1.0,
  conversationId?: string
): Promise<void> {
  await prisma.kaiMemory.upsert({
    where: { storeId_key: { storeId, key } },
    create: {
      storeId, category, key, value, confidence,
      sourceConversationId: conversationId,
    },
    update: {
      value, confidence,
      lastUsed: new Date(),
      sourceConversationId: conversationId,
    },
  });
}

// ── Get all memories for a store ──────────────────────────────
export async function getMemories(storeId: string, category?: string) {
  return prisma.kaiMemory.findMany({
    where: { storeId, ...(category && { category }) },
    orderBy: { lastUsed: "desc" },
    take: 50,
  });
}

// ── Get memories as context string for prompt ─────────────────
export async function getMemoryContext(storeId: string): Promise<string> {
  const memories = await prisma.kaiMemory.findMany({
    where: { storeId },
    orderBy: [{ confidence: "desc" }, { lastUsed: "desc" }],
    take: 30,
  });

  if (memories.length === 0) return "";

  const grouped: Record<string, typeof memories> = {};
  for (const m of memories) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const lines: string[] = ["PERSISTENT MEMORY (KAI knows this about this store):"];
  for (const [cat, mems] of Object.entries(grouped)) {
    lines.push(`[${cat.replace(/_/g, " ").toUpperCase()}]`);
    for (const m of mems) {
      lines.push(`  - ${m.value}`);
    }
  }

  return lines.join("\n");
}

// ── Extract and save memories from conversation ───────────────
export async function extractMemoriesFromConversation(
  storeId: string,
  userMessage: string,
  kaiResponse: string,
  conversationId: string,
  apiKey: string
): Promise<void> {
  // Use Claude Haiku (cheap) to extract memories
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Extract business facts worth remembering from this conversation.
Return ONLY a JSON array. Empty array if nothing worth remembering.

User said: "${userMessage.slice(0, 500)}"
KAI responded: "${kaiResponse.slice(0, 300)}"

Extract memories like:
- Business facts (what they sell, where they are, target market)
- Owner preferences (what they like/dislike, how they communicate)
- Goals they mentioned
- Patterns they revealed (best selling day, typical customer etc)
- Supplier notes
- What didn't work for them

Format: [{"category":"business_fact","key":"unique_key","value":"what to remember","confidence":0.9}]
Categories: business_fact, owner_preference, goal, seasonal_pattern, supplier_note, customer_insight, brand_voice, failure, success

Return [] if nothing important to remember. Return raw JSON only.`,
      }],
    }),
  });

  if (!response.ok) return;

  const data: any = await response.json();
  const text = data.content?.[0]?.text || "[]";

  try {
    const memories = JSON.parse(text.replace(/```json|```/g, "").trim());
    if (!Array.isArray(memories)) return;

    for (const m of memories) {
      if (m.category && m.key && m.value) {
        await saveMemory(storeId, m.category, m.key, m.value, m.confidence || 0.8, conversationId);
      }
    }
  } catch {}
}

// ── Mark memory as used ───────────────────────────────────────
export async function touchMemory(storeId: string, key: string): Promise<void> {
  await prisma.kaiMemory.updateMany({
    where: { storeId, key },
    data: { lastUsed: new Date() },
  });
}

// ── Delete a memory ───────────────────────────────────────────
export async function deleteMemory(storeId: string, key: string): Promise<void> {
  await prisma.kaiMemory.deleteMany({ where: { storeId, key } });
}

// ── Get goals for context ─────────────────────────────────────
export async function getActiveGoals(storeId: string) {
  return prisma.kaiGoal.findMany({
    where: { storeId, status: "active" },
    include: { milestones: true },
    orderBy: { deadline: "asc" },
    take: 3,
  });
}

// ── Update goal progress ──────────────────────────────────────
export async function updateGoalProgress(goalId: string, currentValue: number): Promise<void> {
  const goal = await prisma.kaiGoal.findUnique({
    where: { id: goalId },
    include: { milestones: true },
  });
  if (!goal) return;

  const newStatus = currentValue >= goal.targetValue ? "achieved"
    : new Date() > goal.deadline ? "behind"
    : "active";

  await prisma.kaiGoal.update({
    where: { id: goalId },
    data: { currentValue, status: newStatus, updatedAt: new Date() },
  });

  // Mark milestones achieved
  for (const milestone of goal.milestones) {
    if (!milestone.achieved && currentValue >= milestone.targetValue) {
      await prisma.kaiMilestone.update({
        where: { id: milestone.id },
        data: { achieved: true, achievedAt: new Date() },
      });
    }
  }
}

// ── Get brand voice ───────────────────────────────────────────
export async function getBrandVoice(storeId: string) {
  return prisma.kaiBrandVoice.findUnique({ where: { storeId } });
}

// ── Analyze and save brand voice ──────────────────────────────
export async function analyzeBrandVoice(
  storeId: string,
  sampleContent: string,
  apiKey: string
): Promise<void> {
  if (!sampleContent || sampleContent.length < 50) return;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Analyze this business owner's writing style and return ONLY JSON:

"${sampleContent.slice(0, 1000)}"

Return: {"tone":"formal|casual|energetic|warm|professional","usesEmojis":true|false,"language":"english|pidgin|yoruba|igbo|hausa","sentenceLength":"short|medium|long","keywords":["word1","word2"],"avoidWords":[]}

Raw JSON only.`,
      }],
    }),
  });

  if (!response.ok) return;
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";

  try {
    const voice = JSON.parse(text.replace(/```json|```/g, "").trim());
    await prisma.kaiBrandVoice.upsert({
      where: { storeId },
      create: {
        storeId,
        tone: voice.tone || "casual",
        usesEmojis: voice.usesEmojis ?? true,
        language: voice.language || "english",
        sentenceLength: voice.sentenceLength || "medium",
        keywords: voice.keywords || [],
        avoidWords: voice.avoidWords || [],
        sampleContent: sampleContent.slice(0, 500),
      },
      update: {
        tone: voice.tone || "casual",
        usesEmojis: voice.usesEmojis ?? true,
        language: voice.language || "english",
        sentenceLength: voice.sentenceLength || "medium",
        keywords: voice.keywords || [],
        avoidWords: voice.avoidWords || [],
        sampleContent: sampleContent.slice(0, 500),
        updatedAt: new Date(),
      },
    });
  } catch {}
}
