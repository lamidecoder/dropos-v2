// src/controllers/funnel.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";

// POST /funnel/event  — public, called from storefront JS
export const trackFunnelEvent = async (req: Request, res: Response) => {
  const { storeId, sessionId, event, productId, orderId, value, meta } = req.body;
  if (!storeId || !sessionId || !event) return res.json({ success: true }); // silent

  const validEvents = ["view", "add_to_cart", "checkout_start", "purchase"];
  if (!validEvents.includes(event)) return res.json({ success: true });

  await prisma.funnelEvent.create({
    data: {
      storeId, sessionId, event, productId, orderId, value,
      meta: meta || null,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || null,
    },
  }).catch(() => {}); // non-blocking

  res.json({ success: true });
};

// POST /funnel/utm  — track UTM session
export const trackUtmSession = async (req: Request, res: Response) => {
  const { storeId, sessionId, source, medium, campaign, term, content, landingPage, referrer } = req.body;
  if (!storeId || !sessionId) return res.json({ success: true });

  await prisma.utmSession.upsert({
    where: { storeId_sessionId: { storeId, sessionId } },
    update: {}, // don't overwrite existing UTM data for this session
    create: { storeId, sessionId, source, medium, campaign, term, content, landingPage, referrer },
  }).catch(() => {}); // ignore duplicate race conditions

  res.json({ success: true });
};

// GET /funnel/:storeId  — funnel analytics for owner dashboard
export const getFunnelAnalytics = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { period = "30d" } = req.query as any;
  await verifyOwner(storeId, req.user!.userId);

  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const since = new Date(Date.now() - days * 86400000);

  const events = await prisma.funnelEvent.groupBy({
    by: ["event"], where: { storeId, createdAt: { gte: since } },
    _count: { event: true },
  });

  const map: Record<string, number> = {};
  events.forEach(e => { map[e.event] = e._count.event; });

  const funnel = [
    { stage: "Product Views",      count: map["view"] || 0 },
    { stage: "Add to Cart",        count: map["add_to_cart"] || 0 },
    { stage: "Checkout Started",   count: map["checkout_start"] || 0 },
    { stage: "Purchase Completed", count: map["purchase"] || 0 },
  ];

  // Conversion rates
  const enriched = funnel.map((f, i) => ({
    ...f,
    rate: i === 0 ? 100 : funnel[0].count > 0 ? +((f.count / funnel[0].count) * 100).toFixed(1) : 0,
    dropOff: i === 0 ? 0 : funnel[i-1].count > 0 ? +(((funnel[i-1].count - f.count) / funnel[i-1].count) * 100).toFixed(1) : 0,
  }));

  // Traffic sources
  const sources = await prisma.utmSession.groupBy({
    by: ["source"], where: { storeId, createdAt: { gte: since } },
    _count: { source: true },
    orderBy: { _count: { source: "desc" } },
  });

  // Top converting UTM campaigns
  const campaigns = await prisma.utmSession.groupBy({
    by: ["campaign", "source", "medium"],
    where: { storeId, createdAt: { gte: since }, campaign: { not: null } },
    _count: { campaign: true },
    _sum: { orderValue: true },
    orderBy: { _sum: { orderValue: "desc" } },
    take: 10,
  });

  res.json({ success: true, data: { funnel: enriched, sources: sources.map(s => ({ source: s.source || "direct", count: s._count.source })), campaigns } });
};

// GET /funnel/:storeId/cohort
export const getCohortAnalytics = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  // Get last 6 months of orders grouped by customer + month
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const orders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: sixMonthsAgo }, status: { in: ["COMPLETED","DELIVERED"] } },
    select: { customerEmail: true, createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
  });

  // Build cohort map: first purchase month → return rates
  const firstPurchase: Record<string, Date> = {};
  const cohorts: Record<string, { total: number; d30: number; d60: number; d90: number }> = {};

  orders.forEach(o => {
    if (!firstPurchase[o.customerEmail]) firstPurchase[o.customerEmail] = o.createdAt;
  });

  orders.forEach(o => {
    const first = firstPurchase[o.customerEmail];
    const month = `${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,"0")}`;
    if (!cohorts[month]) cohorts[month] = { total: 0, d30: 0, d60: 0, d90: 0 };
    if (o.createdAt.getTime() === first.getTime()) { cohorts[month].total++; return; }
    const diff = (o.createdAt.getTime() - first.getTime()) / 86400000;
    if (diff <= 30) cohorts[month].d30++;
    else if (diff <= 60) cohorts[month].d60++;
    else if (diff <= 90) cohorts[month].d90++;
  });

  const result = Object.entries(cohorts).map(([month, data]) => ({
    month,
    totalCustomers: data.total,
    day30Rate: data.total > 0 ? +((data.d30 / data.total) * 100).toFixed(1) : 0,
    day60Rate: data.total > 0 ? +((data.d60 / data.total) * 100).toFixed(1) : 0,
    day90Rate: data.total > 0 ? +((data.d90 / data.total) * 100).toFixed(1) : 0,
  })).sort((a,b) => a.month.localeCompare(b.month));

  res.json({ success: true, data: result });
};

async function verifyOwner(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: userId } });
  if (!store) throw new AppError("Unauthorized", 403);
}
