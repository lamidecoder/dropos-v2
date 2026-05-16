// KIRO Store Brain — Unified Real-Time Business State
// This is the "second brain" that runs before every KIRO response.
// It answers: what just happened, what's urgent, what needs attention, what should happen next.

import prisma from "../lib/prisma";
import type { KIROBusinessContext } from "./kai.context";

export interface StoreBrain {
  // WHAT JUST HAPPENED (last 24hrs events, most recent first)
  recentEvents: Array<{
    time: string;
    event: string;
    impact: "positive" | "neutral" | "negative";
    urgent: boolean;
  }>;

  // WHAT'S BROKEN RIGHT NOW
  criticalIssues: string[];

  // WHAT WILL BREAK SOON
  predictedRisks: string[];

  // WHAT OPPORTUNITIES EXIST
  opportunities: string[];

  // BUSINESS MOMENTUM
  momentum: "accelerating" | "stable" | "decelerating" | "stalled";
  momentumReason: string;

  // ACTION LOG (what KIRO has done recently)
  recentKIROActions: Array<{
    type: string;
    result: string;
    time: string;
    success: boolean;
  }>;

  // PRIORITY SCORE per task (0-100, 100 = most urgent)
  priorityMatrix: Array<{
    score: number;
    task: string;
    impact: string;
    effort: "instant" | "minutes" | "hours";
  }>;
}

export async function buildStoreBrain(
  storeId: string,
  ctx: KIROBusinessContext
): Promise<StoreBrain> {
  const sym = ctx.currencySymbol;
  const fmt = (n: number) => `${sym}${(n || 0).toLocaleString()}`;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Pull recent KIRO action log
  let recentActions: any[] = [];
  try {
    recentActions = await (prisma.kaiActionLog as any).findMany({
      where: { storeId, createdAt: { gte: yesterday } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }) || [];
  } catch {}

  // ── Build Recent Events Timeline ──────────────────────────────────────────
  const recentEvents: StoreBrain["recentEvents"] = [];

  // Revenue events
  if (ctx.revenueToday > 0)
    recentEvents.push({ time: "today", event: `${fmt(ctx.revenueToday)} in revenue`, impact: "positive", urgent: false });

  if (ctx.ordersToday > 0)
    recentEvents.push({ time: "today", event: `${ctx.ordersToday} new order${ctx.ordersToday > 1 ? "s" : ""}`, impact: "positive", urgent: false });

  if (ctx.newCustomersThisWeek > 0)
    recentEvents.push({ time: "this week", event: `${ctx.newCustomersThisWeek} new customer${ctx.newCustomersThisWeek > 1 ? "s" : ""} acquired`, impact: "positive", urgent: false });

  // Negative events
  if (ctx.pendingOrders > 0)
    recentEvents.push({ time: "right now", event: `${ctx.pendingOrders} order${ctx.pendingOrders > 1 ? "s" : ""} waiting to be fulfilled (${fmt(ctx.unfulfilledRevenue)} at risk)`, impact: "negative", urgent: true });

  if (ctx.abandonedCarts > 0)
    recentEvents.push({ time: "this session", event: `${ctx.abandonedCarts} cart${ctx.abandonedCarts > 1 ? "s" : ""} abandoned — ${fmt(ctx.abandonedCartValue)} left on the table`, impact: "negative", urgent: ctx.abandonedCartValue > 50000 });

  if (ctx.zeroStockProducts.length > 0)
    recentEvents.push({ time: "right now", event: `${ctx.zeroStockProducts.length} product${ctx.zeroStockProducts.length > 1 ? "s" : ""} out of stock: ${ctx.zeroStockProducts.slice(0, 2).map(p => p.name).join(", ")}`, impact: "negative", urgent: true });

  if (ctx.revenueTrend === "down")
    recentEvents.push({ time: "this week", event: "Revenue trending down vs last week", impact: "negative", urgent: true });

  // ── Critical Issues ───────────────────────────────────────────────────────
  const criticalIssues: string[] = [];

  if (ctx.pendingOrders > 0)
    criticalIssues.push(`${ctx.pendingOrders} order${ctx.pendingOrders > 1 ? "s" : ""} unfulfilled — customer trust at risk — ${fmt(ctx.unfulfilledRevenue)} locked`);

  if (ctx.zeroStockProducts.length > 0)
    criticalIssues.push(`${ctx.zeroStockProducts.map(p => p.name).join(", ")} ${ctx.zeroStockProducts.length > 1 ? "are" : "is"} completely out of stock — losing sales now`);

  if (ctx.totalProducts < 3)
    criticalIssues.push("Too few products — stores need at least 10 to convert visitors effectively");

  if (ctx.noImageProducts.length > ctx.activeProducts * 0.3)
    criticalIssues.push(`${ctx.noImageProducts.length} products without images — killing conversion rate`);

  if (ctx.revenueToday === 0 && ctx.storeAge > 14)
    criticalIssues.push("Zero revenue today on a store that's been live for 2+ weeks — needs immediate attention");

  // ── Predicted Risks ───────────────────────────────────────────────────────
  const predictedRisks: string[] = [];

  if (ctx.lowStockProducts.length > 0)
    predictedRisks.push(`${ctx.lowStockProducts.map(p => `${p.name} (${p.inventory} left)`).join(", ")} will run out of stock soon — restock before it happens`);

  if (ctx.repeatCustomerRate < 10 && ctx.totalOrders > 10)
    predictedRisks.push("Low repeat purchase rate suggests customers aren't coming back — loyalty issue developing");

  if (ctx.abandonedCarts > 5)
    predictedRisks.push(`${ctx.abandonedCarts} unrecovered carts means conversion problem — could worsen without action`);

  if (ctx.revenueTrend === "down" && ctx.revenueThisMonth < ctx.revenueLastMonth * 0.8)
    predictedRisks.push("Revenue 20%+ below last month — if trend continues, this month will be significantly worse");

  if (ctx.cancelledOrders > ctx.deliveredOrders * 0.2 && ctx.totalOrders > 5)
    predictedRisks.push("High cancellation rate developing — may indicate trust, pricing, or product quality issues");

  // ── Opportunities ─────────────────────────────────────────────────────────
  const opportunities: string[] = [];
  const locale = ctx.locale;
  const month  = new Date().toLocaleString("en-US", { month: "short" });

  // Seasonal opportunity
  const seasonal = locale?.seasonalEvents
    ? Object.entries(locale.seasonalEvents as Record<string, string>)
        .find(([k]) => month.includes(k.slice(0, 3)))
    : null;
  if (seasonal)
    opportunities.push(`Seasonal opportunity: ${seasonal[1]} — create targeted campaign now`);

  if (ctx.abandonedCarts > 0)
    opportunities.push(`${fmt(ctx.abandonedCartValue)} in abandoned carts is recoverable right now with a WhatsApp/email follow-up`);

  if (ctx.topCustomers.length > 0 && ctx.repeatCustomerRate < 30)
    opportunities.push("VIP customers identified — a loyalty reward or exclusive offer could trigger repeat purchases");

  if (ctx.revenueTrend === "up")
    opportunities.push("Revenue trending up — now is the time to double down on what's working, not coast");

  if (ctx.activeCoupons === 0 && ctx.totalProducts > 3)
    opportunities.push("No active promotions running — a strategic coupon or flash sale could spike conversions today");

  if (ctx.totalProducts > 0 && ctx.totalProducts < 10)
    opportunities.push("Adding 5 more products could triple the number of customers who find something to buy");

  // ── Momentum ──────────────────────────────────────────────────────────────
  let momentum: StoreBrain["momentum"] = "stable";
  let momentumReason = "";

  if (ctx.revenueTrend === "up" && ctx.ordersToday > 0) {
    momentum = "accelerating";
    momentumReason = `Revenue is growing week-over-week and orders are coming in today`;
  } else if (ctx.revenueTrend === "down" && ctx.revenueToday === 0) {
    momentum = "stalled";
    momentumReason = `No revenue today and revenue declining — needs urgent intervention`;
  } else if (ctx.revenueTrend === "down") {
    momentum = "decelerating";
    momentumReason = `Revenue trending down vs last week — need to arrest the decline`;
  } else if (ctx.revenueToday === 0 && ctx.totalOrders > 0) {
    momentum = "stable";
    momentumReason = `Store has history of orders but nothing today yet`;
  }

  if (ctx.storeAge < 7) {
    momentum = "stable";
    momentumReason = "New store — building foundation";
  }

  // ── Priority Matrix ───────────────────────────────────────────────────────
  const priorityMatrix: StoreBrain["priorityMatrix"] = [];

  if (ctx.pendingOrders > 0)
    priorityMatrix.push({ score: 95, task: `Fulfill ${ctx.pendingOrders} pending order${ctx.pendingOrders > 1 ? "s" : ""}`, impact: `Unlock ${fmt(ctx.unfulfilledRevenue)}, protect customer trust`, effort: "instant" });

  if (ctx.zeroStockProducts.length > 0)
    priorityMatrix.push({ score: 90, task: `Restock ${ctx.zeroStockProducts[0].name}`, impact: "Stop losing sales on active listings", effort: "minutes" });

  if (ctx.abandonedCarts > 0)
    priorityMatrix.push({ score: 80, task: `Recover ${ctx.abandonedCarts} abandoned cart${ctx.abandonedCarts > 1 ? "s" : ""}`, impact: `${fmt(ctx.abandonedCartValue)} recoverable revenue`, effort: "minutes" });

  if (ctx.noImageProducts.length > 0)
    priorityMatrix.push({ score: 70, task: `Add images to ${ctx.noImageProducts.length} product${ctx.noImageProducts.length > 1 ? "s" : ""}`, impact: "Products with images convert 94% better", effort: "minutes" });

  if (ctx.lowStockProducts.length > 0)
    priorityMatrix.push({ score: 65, task: `Restock ${ctx.lowStockProducts[0].name} (${ctx.lowStockProducts[0].inventory} left)`, impact: "Prevent stockout on active product", effort: "hours" });

  if (ctx.activeCoupons === 0)
    priorityMatrix.push({ score: 55, task: "Launch a promotion", impact: "Promotions drive 30-50% conversion lifts", effort: "instant" });

  if (ctx.totalProducts < 5)
    priorityMatrix.push({ score: 75, task: "Add at least 5 more products", impact: "More products = exponentially more potential buyers", effort: "hours" });

  // Sort by score descending
  priorityMatrix.sort((a, b) => b.score - a.score);

  // ── Recent KIRO Actions ───────────────────────────────────────────────────
  const recentKIROActions = recentActions.map((a: any) => ({
    type:    a.actionType || a.type,
    result:  a.executed ? (a.result?.message || "completed") : "pending",
    time:    new Date(a.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
    success: a.executed,
  }));

  return {
    recentEvents: recentEvents.sort((a, b) => (a.urgent ? -1 : 1)),
    criticalIssues,
    predictedRisks,
    opportunities,
    momentum,
    momentumReason,
    recentKIROActions,
    priorityMatrix,
  };
}

// ── Multi-step task decomposer ─────────────────────────────────────────────
export function decomposeGoal(goal: string, ctx: KIROBusinessContext, brain: StoreBrain): string {
  const sym = ctx.currencySymbol;
  const fmt = (n: number) => `${sym}${(n||0).toLocaleString()}`;

  const lower = goal.toLowerCase();

  // "grow my store" / "help me grow" / "increase sales"
  if (/grow|increase sales|more sales|more revenue|scale/.test(lower)) {
    const steps = [];
    if (ctx.pendingOrders > 0) steps.push(`Step 1: Fulfill ${ctx.pendingOrders} pending orders (trust-building, ${fmt(ctx.unfulfilledRevenue)} unlocked)`);
    if (ctx.totalProducts < 5) steps.push(`Step ${steps.length+1}: Add at least 5 more products (critical mass for conversion)`);
    if (ctx.noImageProducts.length > 0) steps.push(`Step ${steps.length+1}: Add images to ${ctx.noImageProducts.length} products (94% conversion lift)`);
    if (ctx.abandonedCarts > 0) steps.push(`Step ${steps.length+1}: Recover ${ctx.abandonedCarts} abandoned carts (${fmt(ctx.abandonedCartValue)} available)`);
    if (ctx.activeCoupons === 0) steps.push(`Step ${steps.length+1}: Launch a strategic promotion`);
    steps.push(`Step ${steps.length+1}: Start sharing your store link on WhatsApp and Instagram`);
    return steps.join("\n");
  }

  // "fix my store" / "what's wrong"
  if (/fix|wrong|broken|problem|issue/.test(lower)) {
    if (brain.criticalIssues.length === 0) return "Your store looks healthy — no critical issues detected right now.";
    return `Here is what needs fixing, ranked by urgency:\n${brain.criticalIssues.map((i, n) => `${n+1}. ${i}`).join("\n")}`;
  }

  // "what should I do" / "what next"
  if (/what.*do|next|suggest|recommend/.test(lower)) {
    const top = brain.priorityMatrix.slice(0, 3);
    if (!top.length) return "Your store looks strong. Focus on marketing to drive more traffic.";
    return top.map((t, i) => `${i+1}. ${t.task} — ${t.impact} (${t.effort} to execute)`).join("\n");
  }

  return "";
}
