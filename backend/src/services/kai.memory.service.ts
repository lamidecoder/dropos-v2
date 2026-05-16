// KIRO Persistent Memory System
// Stores everything KIRO learns about a store across all conversations forever
// No vector DB needed — uses smart categorization + keyword retrieval

import prisma from "../lib/prisma";

// ── Core save/get ─────────────────────────────────────────────────────────────
export async function saveMemory(
  storeId: string,
  category: string,
  key: string,
  value: string,
  confidence = 1.0,
  conversationId?: string
): Promise<void> {
  try {
    await prisma.kaiMemory.upsert({
      where: { storeId_key: { storeId, key } },
      create: { storeId, category, key, value, confidence, sourceConversationId: conversationId },
      update: { value, confidence, lastUsed: new Date(), sourceConversationId: conversationId },
    });
  } catch {}
}

export async function getMemories(storeId: string, category?: string) {
  return prisma.kaiMemory.findMany({
    where: { storeId, ...(category && { category }) },
    orderBy: { lastUsed: "desc" },
    take: 50,
  });
}

// ── Smart memory retrieval — finds what's relevant to the current message ──────
export async function getRelevantMemories(storeId: string, message: string): Promise<string> {
  const all = await prisma.kaiMemory.findMany({
    where: { storeId },
    orderBy: [{ confidence: "desc" }, { lastUsed: "desc" }],
    take: 100,
  });

  if (!all.length) return "";

  const msg = message.toLowerCase();
  const words = msg.split(/\W+/).filter(w => w.length > 3);

  // Score each memory by keyword relevance
  const scored = all.map(m => {
    const val = m.value.toLowerCase();
    let score = 0;

    // Category boost
    if (msg.includes("campaign") && m.category === "campaign") score += 10;
    if (msg.includes("product") && m.category === "product_discussed") score += 8;
    if (/goal|target|want to|trying to/.test(msg) && m.category === "goal") score += 10;
    if (/prefer|usually|always|style|tone/.test(msg) && m.category === "preference") score += 8;
    if (/last time|before|previous|again|same/.test(msg) && m.category !== "general") score += 6;
    if (/fail|didn't work|broken|issue/.test(msg) && m.category === "failure") score += 10;
    if (/name|who am i|my name/.test(msg) && m.category === "owner_info") score += 15;
    if (/yesterday|last week|before|continue|remember/.test(msg)) score += 5;

    // Keyword match
    for (const w of words) {
      if (val.includes(w)) score += 3;
      if (m.key.includes(w)) score += 2;
    }

    // Recency boost (last 7 days)
    const daysSince = (Date.now() - new Date(m.lastUsed).getTime()) / 86400000;
    if (daysSince < 1) score += 5;
    else if (daysSince < 7) score += 3;

    return { ...m, score };
  });

  // Take top 15 most relevant
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 15);

  if (!top.length) return "";

  const grouped: Record<string, typeof top> = {};
  for (const m of top) {
    if (!grouped[m.category]) grouped[m.category] = [];
    grouped[m.category].push(m);
  }

  const lines: string[] = ["WHAT KIRO REMEMBERS:"];
  const catLabels: Record<string, string> = {
    owner_info:        "About the owner",
    goal:              "Business goals",
    campaign:          "Campaigns",
    product_discussed: "Products discussed",
    preference:        "Owner preferences",
    business_fact:     "Business facts",
    failure:           "What didn't work",
    success:           "What worked well",
    customer_insight:  "Customer patterns",
    brand_voice:       "Brand & tone",
    seasonal_pattern:  "Seasonal patterns",
    supplier_note:     "Suppliers",
    ongoing_task:      "Ongoing tasks",
    decision:          "Decisions made",
  };

  for (const [cat, mems] of Object.entries(grouped)) {
    lines.push(`${catLabels[cat] || cat}:`);
    for (const m of mems.slice(0, 3)) {
      lines.push(`  ${m.value}`);
    }
  }

  return lines.join("\n");
}

// ── Full memory context for the system prompt ─────────────────────────────────
export async function getMemoryContext(storeId: string): Promise<string> {
  return getRelevantMemories(storeId, "");
}

// ── Conversation summarization — called after each conversation ───────────────
export async function summarizeAndSaveConversation(
  storeId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>,
  apiKey: string
): Promise<void> {
  if (messages.length < 2) return;

  const transcript = messages
    .slice(-20)
    .map(m => `${m.role === "user" ? "Owner" : "KIRO"}: ${m.content.slice(0, 300)}`)
    .join("\n");

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{
          role: "user",
          content: `You are extracting memory from a business conversation. Return ONLY a JSON object.

CONVERSATION:
${transcript}

Extract and return this JSON (all fields required, use null if not found):
{
  "summary": "2-3 sentence summary of what was discussed and decided",
  "ownerName": "owner's name if mentioned, else null",
  "productsDiscussed": ["product names mentioned"],
  "decisionsMAde": ["decisions made in this conversation"],
  "goalsExpressed": ["goals or targets the owner mentioned"],
  "campaignsLaunched": ["any campaigns, promos or discounts created"],
  "preferences": ["owner preferences revealed (tone, style, pricing approach)"],
  "failedActions": ["anything that failed or didn't work"],
  "ongoingTasks": ["tasks left unfinished or to follow up on"],
  "businessFacts": ["important facts about the business revealed"],
  "customerInsights": ["insights about their customers"]
}

Return raw JSON only. No markdown.`,
        }],
      }),
    });

    if (!response.ok) return;
    const data: any = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const extracted = JSON.parse(text.replace(/```json|```/g, "").trim());

    const now = Date.now().toString(36);

    // Save conversation summary
    if (extracted.summary) {
      await saveMemory(storeId, "conversation_summary", `conv_${conversationId.slice(-8)}`,
        `[${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short" })}] ${extracted.summary}`,
        0.95, conversationId);
    }

    // Save owner name
    if (extracted.ownerName) {
      await saveMemory(storeId, "owner_info", "owner_name",
        `Owner's name is ${extracted.ownerName}`, 1.0, conversationId);
    }

    // Save products discussed
    for (const p of (extracted.productsDiscussed || []).slice(0, 5)) {
      await saveMemory(storeId, "product_discussed", `prod_${p.toLowerCase().replace(/\W+/g,"_")}`,
        `Discussed product: ${p}`, 0.8, conversationId);
    }

    // Save decisions
    for (const d of (extracted.decisionsMAde || []).slice(0, 3)) {
      await saveMemory(storeId, "decision", `dec_${now}_${Math.random().toString(36).slice(2,5)}`,
        d, 0.9, conversationId);
    }

    // Save goals
    for (const g of (extracted.goalsExpressed || []).slice(0, 3)) {
      await saveMemory(storeId, "goal", `goal_${now}_${Math.random().toString(36).slice(2,5)}`,
        g, 0.85, conversationId);
    }

    // Save campaigns
    for (const c of (extracted.campaignsLaunched || []).slice(0, 3)) {
      await saveMemory(storeId, "campaign", `camp_${now}_${Math.random().toString(36).slice(2,5)}`,
        c, 0.95, conversationId);
    }

    // Save preferences
    for (const p of (extracted.preferences || []).slice(0, 3)) {
      await saveMemory(storeId, "preference", `pref_${now}_${Math.random().toString(36).slice(2,5)}`,
        p, 0.85, conversationId);
    }

    // Save failed actions
    for (const f of (extracted.failedActions || []).slice(0, 2)) {
      await saveMemory(storeId, "failure", `fail_${now}_${Math.random().toString(36).slice(2,5)}`,
        f, 0.9, conversationId);
    }

    // Save ongoing tasks
    for (const t of (extracted.ongoingTasks || []).slice(0, 3)) {
      await saveMemory(storeId, "ongoing_task", `task_${now}_${Math.random().toString(36).slice(2,5)}`,
        t, 0.9, conversationId);
    }

    // Save business facts
    for (const b of (extracted.businessFacts || []).slice(0, 3)) {
      await saveMemory(storeId, "business_fact", `fact_${now}_${Math.random().toString(36).slice(2,5)}`,
        b, 0.85, conversationId);
    }

    // Save customer insights
    for (const ci of (extracted.customerInsights || []).slice(0, 2)) {
      await saveMemory(storeId, "customer_insight", `cust_${now}_${Math.random().toString(36).slice(2,5)}`,
        ci, 0.8, conversationId);
    }

  } catch (e: any) {
    console.error("[Memory] Summarization failed:", e.message?.slice(0, 100));
  }
}

// ── Real-time memory extraction from single exchange ─────────────────────────
export async function extractMemoriesFromConversation(
  storeId: string,
  userMessage: string,
  kaiResponse: string,
  conversationId: string,
  apiKey: string
): Promise<void> {
  // Quick extraction from single message — lightweight version
  const lower = userMessage.toLowerCase();

  // Owner name
  const nameMatch = userMessage.match(/(?:my name is|call me|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) {
    await saveMemory(storeId, "owner_info", "owner_name",
      `Owner's name is ${nameMatch[1]}`, 1.0, conversationId);
  }

  // Price preference
  if (/always price|usually sell|i sell.*for|my margin|i charge/i.test(lower)) {
    await saveMemory(storeId, "preference", `pricing_${Date.now().toString(36)}`,
      `Pricing preference: ${userMessage.slice(0, 150)}`, 0.8, conversationId);
  }

  // Goal mentioned
  if (/i want to|my goal|trying to|target.*₦|want.*sales|want.*revenue/i.test(lower)) {
    await saveMemory(storeId, "goal", `goal_${Date.now().toString(36)}`,
      userMessage.slice(0, 200), 0.8, conversationId);
  }

  // Campaign created (from KIRO response)
  if (/created.*coupon|launched.*sale|discount.*code|promo.*live/i.test(kaiResponse.toLowerCase())) {
    await saveMemory(storeId, "campaign", `camp_${Date.now().toString(36)}`,
      `Campaign: ${kaiResponse.slice(0, 200)}`, 0.9, conversationId);
  }

  // Preference revealed
  if (/i prefer|i like|i don't like|i hate|i love|for me.*works/i.test(lower)) {
    await saveMemory(storeId, "preference", `pref_${Date.now().toString(36)}`,
      userMessage.slice(0, 150), 0.75, conversationId);
  }
}

// ── Build rich cross-session context ─────────────────────────────────────────
export async function buildCrossSessionContext(
  storeId: string,
  userId: string,
  currentConvId: string,
  currentMessage: string
): Promise<string> {
  try {
    // Get recent conversation summaries
    const summaryMems = await prisma.kaiMemory.findMany({
      where: { storeId, category: "conversation_summary" },
      orderBy: { lastUsed: "desc" },
      take: 5,
    });

    // Get ongoing tasks
    const tasks = await prisma.kaiMemory.findMany({
      where: { storeId, category: "ongoing_task" },
      orderBy: { lastUsed: "desc" },
      take: 3,
    });

    // Get recent conversations (last messages)
    const recentConvs = await prisma.kaiConversation.findMany({
      where: { storeId, userId, archived: false, id: { not: currentConvId } },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { messages: { orderBy: { createdAt: "desc" }, take: 2 } },
    });

    const lines: string[] = [];

    if (summaryMems.length) {
      lines.push("RECENT SESSIONS:");
      for (const s of summaryMems.slice(0, 3)) {
        lines.push(`  ${s.value}`);
      }
    }

    if (tasks.length) {
      lines.push("UNFINISHED TASKS:");
      for (const t of tasks) {
        lines.push(`  ${t.value}`);
      }
    }

    if (recentConvs.length && !summaryMems.length) {
      lines.push("RECENT CONVERSATIONS:");
      for (const rc of recentConvs) {
        const lastMsg = rc.messages[0];
        if (lastMsg) {
          const ago = Math.round((Date.now() - new Date(rc.updatedAt).getTime()) / 60000);
          const timeStr = ago < 60 ? `${ago}m ago` : ago < 1440 ? `${Math.round(ago/60)}h ago` : `${Math.round(ago/1440)}d ago`;
          lines.push(`  [${timeStr}] ${rc.title}: "${lastMsg.content.slice(0, 100)}"`);
        }
      }
    }

    return lines.join("\n");
  } catch {
    return "";
  }
}

// ── Existing exports (compatibility) ─────────────────────────────────────────
export async function touchMemory(storeId: string, key: string): Promise<void> {
  await prisma.kaiMemory.updateMany({ where: { storeId, key }, data: { lastUsed: new Date() } });
}

export async function deleteMemory(storeId: string, key: string): Promise<void> {
  await prisma.kaiMemory.deleteMany({ where: { storeId, key } });
}

export async function getActiveGoals(storeId: string) {
  return prisma.kaiGoal.findMany({
    where: { storeId, status: "active" },
    orderBy: { deadline: "asc" },
    take: 3,
  });
}

export async function updateGoalProgress(goalId: string, currentValue: number): Promise<void> {
  const goal = await prisma.kaiGoal.findUnique({ where: { id: goalId } });
  if (!goal) return;
  const newStatus = currentValue >= goal.targetValue ? "achieved"
    : new Date() > goal.deadline ? "behind" : "active";
  await prisma.kaiGoal.update({
    where: { id: goalId },
    data: { currentValue, status: newStatus, updatedAt: new Date() },
  });
}

export async function getBrandVoice(storeId: string) {
  return prisma.kaiBrandVoice.findUnique({ where: { storeId } });
}

export async function analyzeBrandVoice(storeId: string, sampleContent: string, apiKey: string): Promise<void> {
  if (!sampleContent || sampleContent.length < 50) return;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{ role: "user", content: `Analyze this writing style. Return ONLY JSON:\n"${sampleContent.slice(0,500)}"\n\nReturn: {"tone":"casual","usesEmojis":true,"language":"english","sentenceLength":"short","keywords":[],"avoidWords":[]}\n\nRaw JSON only.` }],
      }),
    });
    if (!response.ok) return;
    const data: any = await response.json();
    const voice = JSON.parse(data.content?.[0]?.text?.replace(/```json|```/g, "").trim() || "{}");
    await prisma.kaiBrandVoice.upsert({
      where: { storeId },
      create: { storeId, tone: voice.tone || "casual", usesEmojis: voice.usesEmojis ?? true, language: voice.language || "english", sentenceLength: voice.sentenceLength || "medium", keywords: voice.keywords || [], avoidWords: voice.avoidWords || [], sampleContent: sampleContent.slice(0,500) },
      update: { tone: voice.tone || "casual", usesEmojis: voice.usesEmojis ?? true, language: voice.language || "english", sentenceLength: voice.sentenceLength || "medium", keywords: voice.keywords || [], avoidWords: voice.avoidWords || [], sampleContent: sampleContent.slice(0,500), updatedAt: new Date() },
    });
  } catch {}
}
