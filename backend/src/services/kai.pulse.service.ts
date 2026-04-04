// ============================================================
// KAI — Pulse Service
// Path: backend/src/services/kai.pulse.service.ts
// Runs 24/7 in background, surfaces insights before owner asks
// ============================================================
import { PrismaClient } from "@prisma/client";
import { getStoreContext } from "./kai.service";

const prisma = new PrismaClient();

// ── Create a pulse alert ──────────────────────────────────────
async function createAlert(
  storeId: string,
  type: string,
  title: string,
  message: string,
  severity: "info" | "warning" | "critical" | "opportunity",
  suggestedPrompt?: string,
  data?: any
): Promise<void> {
  // Don't duplicate alerts of same type within 6 hours
  const recent = await prisma.kaiPulseAlert.findFirst({
    where: {
      storeId, type,
      createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    },
  });
  if (recent) return;

  await prisma.kaiPulseAlert.create({
    data: {
      storeId, type, title, message, severity,
      actionable: !!suggestedPrompt,
      suggestedPrompt,
      data,
    },
  });
}

// ── Analyze a single store ────────────────────────────────────
export async function analyzeStore(storeId: string): Promise<void> {
  try {
    const ctx = await getStoreContext(storeId);

    // 1. Unfulfilled orders > 48 hours
    if (ctx.pendingOrders > 0) {
      const oldOrders = await prisma.order.findMany({
        where: {
          storeId,
          status: { in: ["PENDING", "PROCESSING"] },
          createdAt: { lte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        take: 5,
      });
      if (oldOrders.length > 0) {
        await createAlert(storeId,
          "unfulfilled_orders",
          `${oldOrders.length} orders waiting over 48 hours`,
          `You have ${oldOrders.length} orders that haven't been shipped in over 2 days. Customers are waiting. Let me help you fulfill them now.`,
          "warning",
          `Help me fulfill my ${oldOrders.length} overdue orders`,
          { count: oldOrders.length }
        );
      }
    }

    // 2. Conversion rate drop
    const last7Days = await prisma.order.count({
      where: {
        storeId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    });
    const prev7Days = await prisma.order.count({
      where: {
        storeId,
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    });
    if (prev7Days > 0 && last7Days < prev7Days * 0.6) {
      const drop = Math.round((1 - last7Days / prev7Days) * 100);
      await createAlert(storeId,
        "conversion_drop",
        `Sales dropped ${drop}% this week`,
        `Your sales are down ${drop}% compared to last week. Something changed. Let me diagnose what's happening and suggest fixes.`,
        "critical",
        "My sales dropped this week — diagnose what's wrong and help me fix it",
        { drop, last7Days, prev7Days }
      );
    }

    // 3. Critical low stock
    const criticalStock = await prisma.product.findMany({
      where: { storeId, stockQuantity: { lte: 2, gt: 0 } },
      select: { name: true, stockQuantity: true },
      take: 5,
    });
    if (criticalStock.length > 0) {
      await createAlert(storeId,
        "low_stock_critical",
        `${criticalStock.length} products almost out of stock`,
        `${criticalStock.map(p => p.name).join(", ")} — all have 2 or fewer units left. You'll miss sales if you don't reorder now.`,
        "warning",
        `Show me my critical low stock products and help me reorder`,
        { products: criticalStock }
      );
    }

    // 4. Revenue milestone approaching
    const goals = await prisma.kaiGoal.findMany({
      where: { storeId, status: "active" },
    });
    for (const goal of goals) {
      const progress = (goal.currentValue / goal.targetValue) * 100;
      if (progress >= 80 && progress < 100) {
        const remaining = goal.targetValue - goal.currentValue;
        await createAlert(storeId,
          "revenue_goal",
          `${Math.round(progress)}% toward your goal!`,
          `You're ${Math.round(progress)}% toward "${goal.title}". Only ${goal.unit === "NGN" ? "₦" : ""}${remaining.toLocaleString()} ${goal.unit} left to reach it. Let's push!`,
          "opportunity",
          `I'm close to my goal — what should I do right now to hit it?`,
          { goal: goal.title, progress, remaining }
        );
      }
    }

    // 5. Revenue opportunity - no sales today but it's afternoon
    const hour = new Date().getHours();
    if (hour >= 14 && ctx.revenueToday === 0 && ctx.totalProducts > 0) {
      await createAlert(storeId,
        "pricing_opportunity",
        "No sales yet today — let's change that",
        "It's already afternoon and no orders today. A quick WhatsApp broadcast or flash sale could turn this around. Want me to set one up?",
        "opportunity",
        "Help me get a sale today — create a flash sale or WhatsApp broadcast",
        {}
      );
    }

  } catch (err) {
    console.error(`KAI Pulse analysis error for store ${storeId}:`, err);
  }
}

// ── Analyze all stores (called by cron job) ───────────────────
export async function runPulseForAllStores(): Promise<void> {
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  // Process in batches of 10 to avoid overload
  const batchSize = 10;
  for (let i = 0; i < stores.length; i += batchSize) {
    const batch = stores.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(s => analyzeStore(s.id)));
  }
}

// ── Get unread alerts for a store ────────────────────────────
export async function getUnreadAlerts(storeId: string) {
  return prisma.kaiPulseAlert.findMany({
    where: { storeId, read: false },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" },
    ],
    take: 10,
  });
}

// ── Mark alert as read ────────────────────────────────────────
export async function markAlertRead(alertId: string): Promise<void> {
  await prisma.kaiPulseAlert.update({
    where: { id: alertId },
    data: { read: true },
  });
}

// ── Generate morning brief ────────────────────────────────────
export async function generateMorningBrief(storeId: string, apiKey: string): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  // Check if already generated today
  const existing = await prisma.kaiMorningBrief.findUnique({
    where: { storeId_date: { storeId, date: today } },
  });
  if (existing) return existing.topOpportunity;

  const ctx = await getStoreContext(storeId);
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const overnightOrders = await prisma.order.count({
    where: {
      storeId,
      createdAt: { gte: midnight },
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
    },
  });

  const overnightRevenue = await prisma.order.aggregate({
    where: {
      storeId,
      createdAt: { gte: midnight },
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
    },
    _sum: { total: true },
  });

  const revenueAmt = Number(overnightRevenue._sum.total || 0);
  const sym = ctx.currency === "NGN" ? "₦" : ctx.currency === "GBP" ? "£" : "$";

  // Generate opportunity using Claude
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: `Store: ${ctx.storeName}, Country: ${ctx.country}
Overnight: ${overnightOrders} orders, ${sym}${revenueAmt.toLocaleString()} revenue
Pending orders: ${ctx.pendingOrders}, Low stock: ${ctx.lowStockCount}
Products: ${ctx.totalProducts}

Write ONE sentence opportunity for today (no asterisks, no markdown, max 25 words). 
Make it specific and actionable for a Nigerian/African seller.`,
      }],
    }),
  });

  let opportunity = "Focus on fulfilling pending orders and restocking low inventory today.";
  if (response.ok) {
    const data: any = await response.json();
    opportunity = data.content?.[0]?.text?.trim() || opportunity;
  }

  await prisma.kaiMorningBrief.create({
    data: {
      storeId, date: today,
      revenueLastNight: revenueAmt,
      ordersLastNight: overnightOrders,
      topOpportunity: opportunity,
      urgentAction: ctx.pendingOrders > 0 ? `${ctx.pendingOrders} orders need fulfilling` : undefined,
    },
  });

  // Also create a pulse alert for morning brief
  await createAlert(storeId,
    "morning_brief",
    `Good morning — here's your ${today} brief`,
    `${overnightOrders > 0 ? `${overnightOrders} orders came in overnight (${sym}${revenueAmt.toLocaleString()}). ` : ""}${opportunity}`,
    "info",
    "Give me my full morning brief for today",
    { date: today, orders: overnightOrders, revenue: revenueAmt }
  );

  return opportunity;
}
