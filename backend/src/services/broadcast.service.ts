// ============================================================
// WhatsApp Broadcast Scheduler — Complete Service
// Path: backend/src/services/broadcast.service.ts
// ============================================================
import { PrismaClient } from "@prisma/client";
import { sendBroadcast } from "./whatsapp.service";

const prisma = new PrismaClient();

// ── Get audience for a store ──────────────────────────────────
export async function getAudience(storeId: string, segment: string) {
  let where: any = { storeId };

  if (segment === "vip") {
    where.loyaltyAccounts = { some: { tier: { in: ["gold", "vip"] } } };
  } else if (segment === "repeat") {
    where.orders = { some: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } } };
  } else if (segment === "recent_30") {
    const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    where.orders = { some: { createdAt: { gte: d } } };
  }

  const customers = await prisma.customer.findMany({
    where,
    select: { id: true, name: true, phone: true, email: true },
  });

  return customers.filter(c => c.phone);
}

// ── Create broadcast ──────────────────────────────────────────
export async function createBroadcast(storeId: string, data: {
  message: string;
  segment: string;
  scheduledAt?: string;
}) {
  const audience = await getAudience(storeId, data.segment);

  const broadcast = await prisma.whatsappBroadcast.create({
    data: {
      storeId,
      message: data.message,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      status: data.scheduledAt ? "scheduled" : "draft",
      recipientCount: audience.length,
    },
  });

  return { broadcast, recipientCount: audience.length, preview: audience.slice(0, 3) };
}

// ── Send broadcast now ────────────────────────────────────────
export async function sendBroadcastNow(broadcastId: string): Promise<{
  sent: number; failed: number;
}> {
  const broadcast = await prisma.whatsappBroadcast.findUnique({
    where: { id: broadcastId },
    include: { store: { select: { id: true } } },
  });
  if (!broadcast) throw new Error("Broadcast not found");

  const customers = await prisma.customer.findMany({
    where: { storeId: broadcast.storeId },
    select: { phone: true },
  });

  const numbers = customers.map(c => c.phone).filter(Boolean) as string[];
  const result = await sendBroadcast({
    numbers,
    message: broadcast.message,
    storeId: broadcast.storeId,
    broadcastId,
  });

  await prisma.whatsappBroadcast.update({
    where: { id: broadcastId },
    data: { status: "sent", sentAt: new Date(), sentCount: result.sent },
  });

  return result;
}

// ── Get broadcasts for store ──────────────────────────────────
export async function getBroadcasts(storeId: string) {
  return prisma.whatsappBroadcast.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ── KAI-generated broadcast message ──────────────────────────
export async function generateBroadcastMessage(params: {
  storeId: string;
  type: string;  // "flash_sale" | "new_arrival" | "payday" | "custom"
  productName?: string;
  discount?: string;
  apiKey: string;
}): Promise<string> {
  const { type, productName, discount, apiKey } = params;

  const store = await prisma.store.findUnique({
    where: { id: params.storeId },
    select: { name: true, country: true },
  });

  const prompts: Record<string, string> = {
    flash_sale: `Write a WhatsApp broadcast for a flash sale at ${store?.name}. ${discount ? `${discount} off.` : ""} ${productName ? `Product: ${productName}.` : ""} Nigerian market, payday awareness, casual tone with emojis. Max 120 words. No asterisks.`,
    new_arrival: `Write a WhatsApp broadcast announcing new arrivals at ${store?.name}. ${productName ? `Product: ${productName}.` : ""} Create excitement, urgency, FOMO. Nigerian market, casual emojis. Max 100 words.`,
    payday: `Write a payday special WhatsApp broadcast for ${store?.name}. ${discount ? `${discount} off everything.` : ""} It's payday weekend, customers have money. Make them want to spend it here. Max 100 words.`,
    win_back: `Write a WhatsApp win-back message for ${store?.name}. Customer hasn't ordered in a while. Offer 10% discount code COMEBACK10. Warm, personal, not pushy. Max 80 words.`,
    custom: `Write a WhatsApp broadcast for ${store?.name}. ${productName || "General promotion"}. Nigerian market, engaging, emojis. Max 100 words.`,
  };

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
      messages: [{ role: "user", content: prompts[type] || prompts.custom }],
    }),
  });

  if (!response.ok) throw new Error("Generation failed");
  const data: any = await response.json();
  return data.content?.[0]?.text?.trim() || "";
}
