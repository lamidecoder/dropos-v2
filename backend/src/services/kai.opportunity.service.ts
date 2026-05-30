// ============================================================
// KIRO Opportunity Engine
// Proactively detects revenue opportunities, risks, and growth signals
// Runs every 6 hours via cron, surfaces insights through pulse alerts
// ============================================================

import { prisma } from "../config/database";

interface Opportunity {
  type: "price_increase" | "price_decrease" | "low_stock" | "high_demand" | "bundle" | "win_back" | "fraud_risk" | "seasonal" | "abandoned_value" | "viral_product";
  severity: "high" | "medium" | "low";
  title: string;
  message: string;
  action?: string;
  data?: any;
  storeId: string;
}

// ─────────────────────────────────────────────────────────────
// 1. PRICE OPTIMIZATION
// Detect products that should change price based on velocity
// ─────────────────────────────────────────────────────────────
async function detectPriceOpportunities(storeId: string): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  const products = await prisma.product.findMany({
    where: { storeId, status: "ACTIVE" as any },
    take: 50,
  }).catch(() => []);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  for (const product of products) {
    // Count orders containing this product in last 30 days
    const orderItems = await (prisma as any).orderItem?.count?.({
      where: {
        productId: product.id,
        order: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
      },
    }).catch(() => 0) ?? 0;

    // High demand → suggest price increase
    if (orderItems >= 10 && (product as any).inventory > 5) {
      opportunities.push({
        type: "high_demand",
        severity: "high",
        title: `"${product.name}" is selling fast`,
        message: `${orderItems} orders in 30 days. You could raise the price 10-15% and still sell out. Current: ₦${product.price.toLocaleString()}.`,
        action: `Increase price of "${product.name}" by 12% from ₦${product.price.toLocaleString()} to ₦${Math.round(Number(product.price) * 1.12).toLocaleString()}`,
        data: { productId: product.id, currentPrice: product.price, suggestedPrice: Math.round(Number(product.price) * 1.12) },
        storeId,
      });
    }

    // Low demand → suggest price decrease or flash sale
    if (orderItems === 0 && (product as any).inventory > 10) {
      const daysSinceCreated = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated > 14) {
        opportunities.push({
          type: "price_decrease",
          severity: "medium",
          title: `"${product.name}" hasn't sold in 30 days`,
          message: `Listed ${Math.round(daysSinceCreated)} days ago, zero orders. Try a 20% flash sale or rewrite the description to boost visibility.`,
          action: `Create flash sale for "${product.name}" at 20% off`,
          data: { productId: product.id, currentPrice: product.price, suggestedDiscount: 20 },
          storeId,
        });
      }
    }

    // Low stock + high demand → reorder alert
    if ((product as any).inventory <= 3 && orderItems >= 5) {
      opportunities.push({
        type: "low_stock",
        severity: "high",
        title: `"${product.name}" running out`,
        message: `Only ${(product as any).inventory} left and ${orderItems} sold this month. Reorder now or you'll miss sales.`,
        action: `Restock "${product.name}"`,
        data: { productId: product.id, currentStock: (product as any).inventory, suggestedRestock: Math.ceil(orderItems * 1.5) },
        storeId,
      });
    }
  }

  return opportunities;
}

// ─────────────────────────────────────────────────────────────
// 2. BUNDLE DETECTION
// Find products frequently bought together → suggest as bundle
// ─────────────────────────────────────────────────────────────
async function detectBundles(storeId: string): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get recent multi-item orders
  const orders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: thirtyDaysAgo } },
    include: { items: { include: { product: true } } },
    take: 100,
  }).catch(() => []);

  // Build pair frequency map
  const pairs: Record<string, { count: number; products: any[] }> = {};
  for (const order of orders) {
    const items = (order as any).items || [];
    if (items.length < 2) continue;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const key = [items[i].productId, items[j].productId].sort().join("|");
        if (!pairs[key]) pairs[key] = { count: 0, products: [items[i].product, items[j].product] };
        pairs[key].count++;
      }
    }
  }

  // Pairs ordered together 3+ times = bundle opportunity
  const topPairs = Object.entries(pairs).filter(([, v]) => v.count >= 3).sort((a, b) => b[1].count - a[1].count).slice(0, 3);

  for (const [, pair] of topPairs) {
    const [a, b] = pair.products;
    if (!a || !b) continue;
    const total = Number(a.price) + Number(b.price);
    const bundlePrice = Math.round(total * 0.9); // 10% off
    opportunities.push({
      type: "bundle",
      severity: "medium",
      title: `Bundle opportunity: ${a.name} + ${b.name}`,
      message: `${pair.count} customers bought these together. Create a bundle for ₦${bundlePrice.toLocaleString()} (saves them ₦${(total - bundlePrice).toLocaleString()}).`,
      action: `Create bundle: ${a.name} + ${b.name}`,
      data: { productIds: [a.id, b.id], suggestedPrice: bundlePrice, savings: total - bundlePrice },
      storeId,
    });
  }

  return opportunities;
}

// ─────────────────────────────────────────────────────────────
// 3. ABANDONED CART VALUE
// Total value waiting to be recovered
// ─────────────────────────────────────────────────────────────
async function detectAbandonedValue(storeId: string): Promise<Opportunity[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const abandoned = await (prisma as any).cart?.findMany?.({
    where: { storeId, status: "ABANDONED", updatedAt: { gte: sevenDaysAgo } },
    include: { items: true },
  }).catch(() => []) ?? [];

  if (abandoned.length === 0) return [];

  const totalValue = abandoned.reduce((sum: number, cart: any) =>
    sum + (cart.items || []).reduce((s: number, i: any) => s + Number(i.price) * i.quantity, 0), 0);

  if (totalValue < 5000) return [];

  return [{
    type: "abandoned_value",
    severity: "high",
    title: `₦${totalValue.toLocaleString()} sitting in abandoned carts`,
    message: `${abandoned.length} customers added to cart but didn't checkout (last 7 days). A WhatsApp message could recover 15-20% of this.`,
    action: `Send recovery messages to ${abandoned.length} abandoned carts`,
    data: { count: abandoned.length, value: totalValue },
    storeId,
  }];
}

// ─────────────────────────────────────────────────────────────
// 4. WIN-BACK OPPORTUNITY
// Customers who haven't ordered in 45-90 days
// ─────────────────────────────────────────────────────────────
async function detectWinBack(storeId: string): Promise<Opportunity[]> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);

  const customers = await (prisma as any).storeCustomer?.findMany?.({
    where: {
      storeId,
      lastOrderAt: { gte: ninetyDaysAgo, lte: fortyFiveDaysAgo },
      totalSpent: { gte: 5000 },
    },
    take: 100,
  }).catch(() => []) ?? [];

  if (customers.length < 3) return [];

  const totalValue = customers.reduce((s: number, c: any) => s + Number(c.totalSpent || 0), 0);

  return [{
    type: "win_back",
    severity: "medium",
    title: `${customers.length} loyal customers gone quiet`,
    message: `Bought from you 45-90 days ago, total lifetime value ₦${totalValue.toLocaleString()}. A 15% comeback offer would likely bring 20-30% of them back.`,
    action: `Send win-back campaign to ${customers.length} customers`,
    data: { count: customers.length, totalValue },
    storeId,
  }];
}

// ─────────────────────────────────────────────────────────────
// 5. FRAUD / RISK DETECTOR
// Flag suspicious order patterns
// ─────────────────────────────────────────────────────────────
async function detectFraudRisks(storeId: string): Promise<Opportunity[]> {
  const opportunities: Opportunity[] = [];
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Multiple orders from same email/phone in short time
  const recentOrders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: twentyFourHoursAgo } },
    select: { id: true, customerEmail: true, customerPhone: true, total: true, status: true },
  }).catch(() => []);

  const emailCounts: Record<string, number> = {};
  for (const order of recentOrders) {
    const key = order.customerEmail || order.customerPhone || "";
    if (!key) continue;
    emailCounts[key] = (emailCounts[key] || 0) + 1;
  }

  const suspicious = Object.entries(emailCounts).filter(([, c]) => c >= 3);
  if (suspicious.length > 0) {
    opportunities.push({
      type: "fraud_risk",
      severity: "high",
      title: `${suspicious.length} customer${suspicious.length > 1 ? "s" : ""} placing many orders`,
      message: `Same email/phone made 3+ orders in 24 hours. Could be a wholesale buyer OR a fraud attempt. Review before fulfilling.`,
      action: `Review high-volume customers`,
      data: { customers: suspicious.map(([k, c]) => ({ identifier: k, count: c })) },
      storeId,
    });
  }

  return opportunities;
}

// ─────────────────────────────────────────────────────────────
// 6. SEASONAL OPPORTUNITY (Nigeria-specific)
// ─────────────────────────────────────────────────────────────
function detectSeasonalOpportunities(storeId: string): Opportunity[] {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const opportunities: Opportunity[] = [];

  // Christmas push (Nov-Dec)
  if (month === 11 || (month === 12 && day < 26)) {
    opportunities.push({
      type: "seasonal",
      severity: "high",
      title: "Christmas shopping season is here",
      message: "Nigerian customers are searching for gifts, ankara, jewelry, gadgets, kids toys. Push promotions, free gift wrapping, and Christmas-themed bundles now.",
      action: "Launch Christmas campaign",
      storeId,
    });
  }

  // Valentine's (early Feb)
  if (month === 2 && day < 14) {
    opportunities.push({
      type: "seasonal",
      severity: "high",
      title: `${14 - day} days until Valentine's Day`,
      message: "Couples in Lagos and Abuja are searching for gifts, flowers, watches, perfumes. Launch a V-Day bundle now.",
      action: "Create Valentine's bundle",
      storeId,
    });
  }

  // Black Friday (late November)
  if (month === 11 && day >= 20 && day <= 30) {
    opportunities.push({
      type: "seasonal",
      severity: "high",
      title: "Black Friday is this week",
      message: "Nigerian shoppers are primed to spend. Even 25% off on hero products can 3x your normal weekly revenue.",
      action: "Set up Black Friday flash sale",
      storeId,
    });
  }

  // End of month payday rush (28-30)
  if (day >= 27 && day <= 30) {
    opportunities.push({
      type: "seasonal",
      severity: "medium",
      title: "Payday week — Nigerian shoppers are buying",
      message: "27th–30th is peak conversion in Nigeria. Push your best products now with WhatsApp broadcasts.",
      action: "Send payday WhatsApp broadcast",
      storeId,
    });
  }

  return opportunities;
}

// ─────────────────────────────────────────────────────────────
// MAIN: Scan a store for all opportunities
// ─────────────────────────────────────────────────────────────
export async function scanStoreOpportunities(storeId: string): Promise<Opportunity[]> {
  const [prices, bundles, abandoned, winBack, fraud, seasonal] = await Promise.all([
    detectPriceOpportunities(storeId).catch(() => []),
    detectBundles(storeId).catch(() => []),
    detectAbandonedValue(storeId).catch(() => []),
    detectWinBack(storeId).catch(() => []),
    detectFraudRisks(storeId).catch(() => []),
    Promise.resolve(detectSeasonalOpportunities(storeId)),
  ]);

  return [...prices, ...bundles, ...abandoned, ...winBack, ...fraud, ...seasonal];
}

// ─────────────────────────────────────────────────────────────
// Generate a daily AI brief
// ─────────────────────────────────────────────────────────────
export async function generateDailyBrief(storeId: string): Promise<{
  greeting: string;
  highlights: string[];
  topActions: string[];
  warningCount: number;
  opportunityCount: number;
}> {
  const opps = await scanStoreOpportunities(storeId);

  // Recent metrics
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const yesterdayOrders = await prisma.order.count({
    where: { storeId, createdAt: { gte: twentyFourHoursAgo }, status: { not: "CANCELLED" as any } },
  }).catch(() => 0);

  const yesterdayRevenue = await prisma.order.aggregate({
    where: { storeId, createdAt: { gte: twentyFourHoursAgo }, status: { not: "CANCELLED" as any } },
    _sum: { total: true },
  }).catch(() => ({ _sum: { total: 0 } }));

  const revenue = Number((yesterdayRevenue as any)?._sum?.total || 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const highlights: string[] = [];
  if (yesterdayOrders > 0) {
    highlights.push(`${yesterdayOrders} order${yesterdayOrders !== 1 ? "s" : ""} in the last 24 hours worth ₦${revenue.toLocaleString()}`);
  } else {
    highlights.push("No orders in the last 24 hours — let's change that today");
  }

  const highOpps = opps.filter(o => o.severity === "high");
  const mediumOpps = opps.filter(o => o.severity === "medium");
  if (highOpps.length > 0) highlights.push(`${highOpps.length} high-priority opportunity${highOpps.length !== 1 ? "ies" : "y"} need your attention`);
  if (mediumOpps.length > 0) highlights.push(`${mediumOpps.length} other thing${mediumOpps.length !== 1 ? "s" : ""} worth checking`);

  const topActions = opps.slice(0, 3).map(o => o.action || o.title).filter(Boolean) as string[];

  return {
    greeting: `${greeting}!`,
    highlights,
    topActions,
    warningCount: opps.filter(o => o.type === "fraud_risk" || o.type === "low_stock").length,
    opportunityCount: opps.length,
  };
}
