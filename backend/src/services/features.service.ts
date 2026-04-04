// ============================================================
// DropOS — Priority 1-3 Features Service
// Path: backend/src/services/features.service.ts
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════
// STORE HEALTH SCORE (0-100)
// ══════════════════════════════════════════════════════════════
export async function calculateHealthScore(storeId: string): Promise<{
  score: number;
  grade: string;
  breakdown: Record<string, { score: number; max: number; label: string; tip: string }>;
  topFixes: string[];
}> {
  const [store, products, orders, reviews] = await Promise.all([
    prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: { select: { name: true, avatar: true } } },
    }),
    prisma.product.findMany({
      where: { storeId },
      select: { id: true, stockQuantity: true, images: true, description: true, isActive: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { storeId },
      select: { id: true, status: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.review.findMany({
      where: { storeId },
      select: { rating: true, createdAt: true },
      take: 50,
    }),
  ]);

  const activeProducts = products.filter(p => p.isActive);
  const outOfStock     = products.filter(p => p.stockQuantity === 0 && p.isActive);
  const noImages       = products.filter(p => !p.images || (p.images as any[]).length === 0);
  const noDescription  = products.filter(p => !p.description || p.description.length < 50);

  const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentOrders = orders.filter(o => new Date(o.createdAt) >= last7days);
  const unfulfilled  = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING");
  const oldUnfulfilled = unfulfilled.filter(o =>
    new Date(Date.now() - new Date(o.createdAt).getTime()) > 48 * 60 * 60 * 1000
  );

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const breakdown = {
    products: {
      score: Math.min(20, Math.max(0, activeProducts.length >= 10 ? 20 : activeProducts.length * 2)),
      max: 20,
      label: "Products",
      tip: activeProducts.length < 10 ? `Add ${10 - activeProducts.length} more products` : "Great product count",
    },
    stock: {
      score: outOfStock.length === 0 ? 20 : Math.max(0, 20 - outOfStock.length * 3),
      max: 20,
      label: "Stock",
      tip: outOfStock.length > 0 ? `Restock ${outOfStock.length} out-of-stock products` : "All products in stock",
    },
    fulfillment: {
      score: oldUnfulfilled.length === 0 ? 20 : Math.max(0, 20 - oldUnfulfilled.length * 5),
      max: 20,
      label: "Fulfillment",
      tip: oldUnfulfilled.length > 0 ? `${oldUnfulfilled.length} orders waiting over 48hrs — fulfill now` : "Orders fulfilled on time",
    },
    content: {
      score: Math.max(0, 20 - noImages.length * 2 - noDescription.length),
      max: 20,
      label: "Product Content",
      tip: noImages.length > 0 ? `${noImages.length} products missing images` : noDescription.length > 0 ? `${noDescription.length} products need better descriptions` : "Product content looks great",
    },
    reputation: {
      score: reviews.length === 0 ? 10 : Math.min(20, Math.round(avgRating * 4)),
      max: 20,
      label: "Reputation",
      tip: reviews.length === 0 ? "No reviews yet — request reviews from past customers" : `${avgRating.toFixed(1)} star average`,
    },
  };

  const totalScore = Object.values(breakdown).reduce((s, b) => s + b.score, 0);
  const grade = totalScore >= 90 ? "A+" : totalScore >= 80 ? "A" : totalScore >= 70 ? "B" :
    totalScore >= 60 ? "C" : totalScore >= 50 ? "D" : "F";

  const topFixes = Object.values(breakdown)
    .filter(b => b.score < b.max)
    .sort((a, b) => (b.max - b.score) - (a.max - a.score))
    .slice(0, 3)
    .map(b => b.tip);

  return { score: totalScore, grade, breakdown, topFixes };
}

// ══════════════════════════════════════════════════════════════
// PRODUCT PERFORMANCE GRADER
// ══════════════════════════════════════════════════════════════
export async function gradeProducts(storeId: string) {
  const products = await prisma.product.findMany({
    where: { storeId, isActive: true },
    include: {
      orderItems: {
        include: { order: { select: { createdAt: true, status: true } } },
      },
    },
  });

  const graded = products.map(product => {
    const paidItems = product.orderItems.filter(oi =>
      ["PAID", "SHIPPED", "DELIVERED"].includes(oi.order.status)
    );
    const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const salesLast30 = paidItems.filter(oi => new Date(oi.order.createdAt) >= last30).length;
    const salesLast90 = paidItems.filter(oi => new Date(oi.order.createdAt) >= last90).length;
    const totalSales  = paidItems.length;

    let grade: string;
    let verdict: string;
    let action: string;
    let color: string;

    if (salesLast30 >= 10) {
      grade = "A+"; verdict = "🔥 Best seller"; action = "Keep stocking — reorder soon"; color = "#34d399";
    } else if (salesLast30 >= 5) {
      grade = "A";  verdict = "Strong performer"; action = "Optimise price — may have room to increase"; color = "#60a5fa";
    } else if (salesLast30 >= 2) {
      grade = "B";  verdict = "Decent sales"; action = "Improve product photos and description"; color = "#a78bfa";
    } else if (salesLast30 >= 1) {
      grade = "C";  verdict = "Low sales"; action = "Lower price or run a flash sale to test"; color = "#fbbf24";
    } else if (salesLast90 >= 1) {
      grade = "D";  verdict = "Very slow"; action = "Consider removing or heavy discount"; color = "#fb923c";
    } else {
      grade = "F";  verdict = "No sales — dead product"; action = "Remove immediately and replace"; color = "#f87171";
    }

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stockQuantity,
      salesLast30,
      salesLast90,
      totalSales,
      grade,
      verdict,
      action,
      color,
    };
  });

  return graded.sort((a, b) => {
    const order = ["A+", "A", "B", "C", "D", "F"];
    return order.indexOf(a.grade) - order.indexOf(b.grade);
  });
}

// ══════════════════════════════════════════════════════════════
// CUSTOMER COMEBACK PREDICTOR
// ══════════════════════════════════════════════════════════════
export async function getAtRiskCustomers(storeId: string) {
  const customers = await prisma.customer.findMany({
    where: { storeId },
    include: {
      orders: {
        where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { createdAt: true, total: true },
      },
    },
  });

  const atRisk = [];
  for (const customer of customers) {
    if (customer.orders.length < 2) continue;

    const dates = customer.orders.map(o => new Date(o.createdAt).getTime()).sort((a, b) => b - a);
    const avgDaysBetween = dates.length > 1
      ? dates.slice(0, -1).reduce((sum, d, i) => sum + (d - dates[i + 1]) / (1000 * 60 * 60 * 24), 0) / (dates.length - 1)
      : 30;

    const daysSinceLastOrder = (Date.now() - dates[0]) / (1000 * 60 * 60 * 24);
    const overdueDays = daysSinceLastOrder - avgDaysBetween;

    if (overdueDays > 7 && overdueDays < 60) {
      const totalSpend = customer.orders.reduce((s, o) => s + Number(o.total), 0);
      atRisk.push({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalSpend,
        orderCount: customer.orders.length,
        lastOrderDate: new Date(dates[0]).toISOString(),
        avgDaysBetweenOrders: Math.round(avgDaysBetween),
        daysSinceLastOrder: Math.round(daysSinceLastOrder),
        overdueDays: Math.round(overdueDays),
        riskLevel: overdueDays > 21 ? "high" : overdueDays > 14 ? "medium" : "low",
        suggestedMessage: `Hi ${customer.name?.split(" ")[0] || "there"}, we miss you! Here's 10% off your next order — valid for 48 hours only. Use code COMEBACK10`,
      });
    }
  }

  return atRisk.sort((a, b) => b.overdueDays - a.overdueDays).slice(0, 20);
}

// ══════════════════════════════════════════════════════════════
// ACHIEVEMENTS SYSTEM
// ══════════════════════════════════════════════════════════════
const ACHIEVEMENTS = [
  { id: "first_sale",    title: "First Sale",       emoji: "🥇", description: "Made your very first sale",      check: (d: any) => d.totalOrders >= 1 },
  { id: "ten_sales",     title: "10 Sales Club",    emoji: "🏅", description: "Completed 10 orders",            check: (d: any) => d.totalOrders >= 10 },
  { id: "100k_revenue",  title: "₦100k Club",       emoji: "🏆", description: "Made over ₦100,000 in sales",   check: (d: any) => d.totalRevenue >= 100000 },
  { id: "500k_revenue",  title: "₦500k Club",       emoji: "💎", description: "Made over ₦500,000 in sales",   check: (d: any) => d.totalRevenue >= 500000 },
  { id: "1m_revenue",    title: "₦1M Club",         emoji: "👑", description: "Made over ₦1,000,000 in sales", check: (d: any) => d.totalRevenue >= 1000000 },
  { id: "7day_streak",   title: "7-Day Streak",     emoji: "🔥", description: "Sales 7 days in a row",         check: (d: any) => d.streakDays >= 7 },
  { id: "flash_king",    title: "Flash Sale King",   emoji: "⚡", description: "Ran 3 flash sales",             check: (d: any) => d.flashSales >= 3 },
  { id: "intl_seller",   title: "International",    emoji: "🌍", description: "First international order",     check: (d: any) => d.hasInternational },
  { id: "referrer",      title: "Growth Driver",    emoji: "🤝", description: "Referred 5 sellers",            check: (d: any) => d.referrals >= 5 },
  { id: "wa_warrior",    title: "WhatsApp Warrior", emoji: "📱", description: "Sent 100 broadcasts",           check: (d: any) => d.broadcasts >= 100 },
  { id: "5star",         title: "5-Star Seller",    emoji: "⭐", description: "Maintained 5-star rating",      check: (d: any) => d.avgRating >= 4.8 && d.reviewCount >= 5 },
  { id: "100_customers", title: "100 Customers",    emoji: "👥", description: "Served 100 unique customers",   check: (d: any) => d.uniqueCustomers >= 100 },
];

export async function getStoreAchievements(storeId: string) {
  const [orders, reviews, customers, flashSales, broadcasts] = await Promise.all([
    prisma.order.findMany({
      where: { storeId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      select: { total: true, createdAt: true, customer: { select: { country: true } } },
    }),
    prisma.review.findMany({ where: { storeId }, select: { rating: true } }),
    prisma.customer.count({ where: { storeId } }),
    prisma.flashSale?.count({ where: { storeId } }).catch(() => 0),
    Promise.resolve(0), // broadcasts count - add when WhatsApp module built
  ]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgRating    = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Calculate streak
  const byDay = new Map<string, boolean>();
  orders.forEach(o => {
    const day = new Date(o.createdAt).toDateString();
    byDay.set(day, true);
  });
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (byDay.has(d.toDateString())) streakDays++;
    else if (i > 0) break;
  }

  const data = {
    totalOrders:      orders.length,
    totalRevenue,
    streakDays,
    flashSales:       flashSales || 0,
    hasInternational: orders.some(o => o.customer?.country && o.customer.country !== "NG"),
    referrals:        0,
    broadcasts,
    avgRating,
    reviewCount:      reviews.length,
    uniqueCustomers:  customers,
  };

  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: a.check(data),
    unlockedAt: a.check(data) ? new Date().toISOString() : null,
  }));
}

// ══════════════════════════════════════════════════════════════
// REVENUE REPLAY
// ══════════════════════════════════════════════════════════════
export async function getRevenueReplay(storeId: string) {
  const orders = await prisma.order.findMany({
    where: { storeId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, total: true, createdAt: true },
  });

  if (orders.length === 0) return { milestones: [], timeline: [] };

  let cumulative = 0;
  const timeline = orders.map(o => {
    cumulative += Number(o.total);
    return { date: o.createdAt, amount: Number(o.total), cumulative };
  });

  const milestones = [
    { label: "First Sale 🥇", amount: 1, reached: cumulative >= 1 },
    { label: "₦10,000 💰",    amount: 10000, reached: cumulative >= 10000 },
    { label: "₦50,000 🚀",    amount: 50000, reached: cumulative >= 50000 },
    { label: "₦100,000 🏆",   amount: 100000, reached: cumulative >= 100000 },
    { label: "₦500,000 💎",   amount: 500000, reached: cumulative >= 500000 },
    { label: "₦1,000,000 👑", amount: 1000000, reached: cumulative >= 1000000 },
  ].filter(m => m.reached);

  return { milestones, timeline: timeline.slice(-30), totalRevenue: cumulative };
}

// ══════════════════════════════════════════════════════════════
// WEEKLY WINNING PRODUCTS (cached, not re-fetched every request)
// ══════════════════════════════════════════════════════════════
export async function getWeeklyWinners(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { country: true },
  });

  const cacheKey = `weekly_winners_${store?.country || "NG"}_${new Date().toISOString().split("T")[0]}`;
  const cached = await prisma.kaiMarketCache.findUnique({ where: { key: cacheKey } })
    .catch(() => null);

  if (cached && new Date() < cached.expiresAt) {
    return cached.data;
  }

  // Return placeholder — actual data fetched by KAI Power winning-products endpoint
  return {
    lastUpdated: new Date().toISOString(),
    products: [],
    message: "Call /api/kai/power/winning-products to get this week's winners",
  };
}

// ══════════════════════════════════════════════════════════════
// PRICE A/B TEST
// ══════════════════════════════════════════════════════════════
export async function createPriceTest(storeId: string, productId: string, priceA: number, priceB: number) {
  // Store A/B test in metadata
  await prisma.product.update({
    where: { id: productId },
    data: {
      metadata: {
        abTest: {
          active: true,
          priceA,
          priceB,
          startedAt: new Date().toISOString(),
          visitsA: 0,
          visitsB: 0,
          ordersA: 0,
          ordersB: 0,
        },
      } as any,
    },
  });
  return { success: true, message: `A/B test started: ₦${priceA.toLocaleString()} vs ₦${priceB.toLocaleString()}` };
}
