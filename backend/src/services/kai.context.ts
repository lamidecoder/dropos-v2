// KIRO Intelligence Context Engine
// Pulls ALL business signals KIRO needs to think like a commerce operator

import prisma from "../lib/prisma";

export interface KIROBusinessContext {
  // Identity
  storeId: string;
  storeName: string;
  plan: string;
  country: string;
  currency: string;
  currencySymbol: string;
  storeAge: number; // days

  // Revenue signals
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueTrend: "up" | "down" | "flat";
  revenueVelocity: number; // daily avg this week vs last week

  // Order signals
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  avgOrderValue: number;
  repeatCustomerRate: number; // %
  ordersToday: number;

  // Product signals
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  lowStockProducts: Array<{ id: string; name: string; inventory: number; price: number }>;
  zeroStockProducts: Array<{ id: string; name: string }>;
  topProducts: Array<{ id: string; name: string; price: number; inventory: number; category: string; image: string | null }>;
  recentProducts: Array<{ id: string; name: string; createdAt: Date }>;
  allProducts: Array<{ id: string; name: string; price: number; inventory: number; category: string }>;
  noImageProducts: Array<{ id: string; name: string }>;

  // Customer signals
  totalCustomers: number;
  newCustomersThisWeek: number;
  abandonedCarts: number;
  abandonedCartValue: number;
  topCustomers: Array<{ name: string; email: string; totalSpent: number; orders: number }>;

  // Fulfillment signals
  unfulfilledRevenue: number; // money locked in pending orders
  avgFulfillmentTime: number; // hours

  // Marketing signals
  activeCoupons: number;
  abandonedCartEmails: boolean; // has recovery been set up
  reviewCount: number;
  avgRating: number;

  // Business health score (0-100)
  healthScore: number;
  healthIssues: string[];
  healthWins: string[];

  // Growth stage
  growthStage: "setup" | "first_sale" | "early_traction" | "scaling" | "optimizing";

  // Today's priority actions
  priorityActions: Array<{ priority: "critical" | "high" | "medium"; action: string; impact: string }>;

  // Raw recent orders for context
  recentOrders: Array<{ id: string; status: string; total: number; customer: string; date: Date; items?: number }>;

  // Analytics trend data
  analytics: Array<{ date: string; revenue: number; orders: number; visitors: number }>;

  locale: any;
}

export async function getDeepContext(storeId: string): Promise<KIROBusinessContext> {
  const { getLocale } = await import("../utils/kai.locale");

  try {
    const now    = new Date();
    const today  = new Date(now); today.setHours(0,0,0,0);
    const week   = new Date(now); week.setDate(week.getDate() - 7);
    const month  = new Date(now); month.setDate(1); month.setHours(0,0,0,0);
    const lastM1 = new Date(month); lastM1.setMonth(lastM1.getMonth() - 1);
    const lastM2 = new Date(month);

    const [
      store, products, orders, customers,
      abandonedCarts, coupons, reviews, analytics,
    ] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findMany({ where: { storeId }, select: { id:true, name:true, price:true, inventory:true, status:true, category:true, images:true, createdAt:true } }),
      prisma.order.findMany({
        where: { storeId }, orderBy: { createdAt: "desc" }, take: 200,
        include: { customer: { select: { name:true, email:true } }, items: { select: { quantity:true } } },
      }),
      prisma.storeCustomer.findMany({ where: { storeId }, select: { name:true, email:true, totalSpent:true, totalOrders:true, createdAt:true }, orderBy: { totalSpent: "desc" } }),
      (prisma.abandonedCart as any).findMany({ where: { storeId, recovered: false }, select: { total:true, email:true } }).catch(() => []),
      (prisma.coupon as any).findMany({ where: { storeId, isActive: true } }).catch(() => []),
      (prisma.review as any).findMany({ where: { storeId } }).catch(() => []),
      (prisma.analytics as any).findMany({ where: { storeId, date: { gte: week } }, orderBy: { date: "desc" }, take: 14 }).catch(() => []),
    ]);

    const locale  = getLocale(store?.country || "NG");
    const { buildMarketContext, getSeasonalContext } = await import("../utils/kai.locale");
    const sym     = locale.currencySymbol;
    const plan    = "FREE";
    const storeAge = store ? Math.floor((Date.now() - store.createdAt.getTime()) / 86400000) : 0;

    // Revenue calculations
    const paidStatus  = ["COMPLETED", "DELIVERED", "SHIPPED"];
    const allPaid     = orders.filter(o => paidStatus.includes(o.status));
    const todayPaid   = allPaid.filter(o => new Date(o.createdAt) >= today);
    const weekPaid    = allPaid.filter(o => new Date(o.createdAt) >= week);
    const monthPaid   = allPaid.filter(o => new Date(o.createdAt) >= month);
    const lastMPaid   = allPaid.filter(o => new Date(o.createdAt) >= lastM1 && new Date(o.createdAt) < lastM2);

    const revenueToday     = todayPaid.reduce((a,o) => a + (o.total||0), 0);
    const revenueThisWeek  = weekPaid.reduce((a,o) => a + (o.total||0), 0);
    const revenueThisMonth = monthPaid.reduce((a,o) => a + (o.total||0), 0);
    const revenueLastMonth = lastMPaid.reduce((a,o) => a + (o.total||0), 0);
    const revenueTrend     = revenueThisWeek > revenueLastMonth / 4.33 * 1.1 ? "up" : revenueThisWeek < revenueLastMonth / 4.33 * 0.9 ? "down" : "flat";

    // Order signals
    const pending    = orders.filter(o => o.status === "PENDING");
    const processing = orders.filter(o => o.status === "PROCESSING");
    const delivered  = orders.filter(o => o.status === "DELIVERED" || o.status === "COMPLETED");
    const cancelled  = orders.filter(o => o.status === "CANCELLED");
    const ordersToday = orders.filter(o => new Date(o.createdAt) >= today).length;
    const avgOrderValue = allPaid.length ? allPaid.reduce((a,o) => a + (o.total||0), 0) / allPaid.length : 0;
    const unfulfilledRevenue = pending.reduce((a,o) => a + (o.total||0), 0);

    // Product signals
    const activeP  = products.filter(p => p.status === "ACTIVE");
    const lowStock = products.filter(p => (p.inventory||0) > 0 && (p.inventory||0) < 5 && p.status === "ACTIVE");
    const zeroStock = products.filter(p => (p.inventory||0) === 0 && p.status === "ACTIVE");
    const noImage  = products.filter(p => !p.images?.length);
    const topP     = [...activeP].sort((a,b) => (b.price||0) - (a.price||0)).slice(0, 8);
    const recent   = [...products].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    // Customer signals
    const newThisWeek      = customers.filter(c => new Date((c as any).createdAt) >= week).length;
    const repeatCustomers  = customers.filter(c => (c.totalOrders || 0) > 1).length;
    const repeatRate       = customers.length ? Math.round(repeatCustomers / customers.length * 100) : 0;
    const abandonedTotal   = (abandonedCarts as any[]).reduce((a: number, c: any) => a + (c.total||0), 0);
    const topCustomers     = (customers as any[]).slice(0, 5).map(c => ({ name: c.name || "Unknown", email: c.email, totalSpent: c.totalSpent || 0, orders: c.totalOrders || 0 }));

    // Review signals
    const avgRating = (reviews as any[]).length
      ? (reviews as any[]).reduce((a: number, r: any) => a + (r.rating || 5), 0) / (reviews as any[]).length
      : 0;

    // Health score
    const healthIssues: string[] = [];
    const healthWins:   string[] = [];
    let   healthScore = 50;

    if (products.length === 0)          { healthIssues.push("No products added yet"); healthScore -= 20; }
    if (products.length >= 10)          { healthWins.push(`${products.length} products listed`); healthScore += 10; }
    if (pending.length > 0)             { healthIssues.push(`${pending.length} unfulfilled orders`); healthScore -= 15; }
    if (pending.length === 0 && orders.length > 0) { healthWins.push("All orders fulfilled"); healthScore += 10; }
    if (lowStock.length > 0)            { healthIssues.push(`${lowStock.length} products low on stock`); healthScore -= 10; }
    if (revenueThisMonth > 0)           { healthWins.push(`${sym}${revenueThisMonth.toLocaleString()} revenue this month`); healthScore += 15; }
    if (noImage.length > 0)             { healthIssues.push(`${noImage.length} products have no images`); healthScore -= 8; }
    if ((abandonedCarts as any[]).length > 3) { healthIssues.push(`${(abandonedCarts as any[]).length} abandoned carts unrecovered`); healthScore -= 8; }
    if (repeatRate > 20)                { healthWins.push(`${repeatRate}% repeat customer rate`); healthScore += 10; }
    if (coupons.length > 0)             { healthWins.push("Active promotions running"); healthScore += 5; }
    if (reviews.length > 5)             { healthWins.push(`${reviews.length} reviews — social proof active`); healthScore += 8; }
    healthScore = Math.max(0, Math.min(100, healthScore));

    // Growth stage
    let growthStage: KIROBusinessContext["growthStage"] = "setup";
    if (orders.length > 0)   growthStage = "first_sale";
    if (orders.length >= 10) growthStage = "early_traction";
    if (revenueThisMonth > 500000) growthStage = "scaling";
    if (revenueThisMonth > 2000000 && repeatRate > 25) growthStage = "optimizing";

    // Priority actions
    const priorityActions: KIROBusinessContext["priorityActions"] = [];
    if (pending.length > 0) priorityActions.push({ priority: "critical", action: `Fulfill ${pending.length} pending order${pending.length > 1 ? "s" : ""}`, impact: `${sym}${unfulfilledRevenue.toLocaleString()} unlocked, customer trust built` });
    if (products.length < 3) priorityActions.push({ priority: "critical", action: "Add at least 5 more products", impact: "Stores with 10+ products convert 3× better" });
    if (noImage.length > 0) priorityActions.push({ priority: "high", action: `Add images to ${noImage.length} product${noImage.length > 1 ? "s" : ""}`, impact: "Products with images get 94% more views" });
    if (lowStock.length > 0) priorityActions.push({ priority: "high", action: `Restock ${lowStock.length} low-stock product${lowStock.length > 1 ? "s" : ""}`, impact: "Prevent lost sales" });
    if ((abandonedCarts as any[]).length > 0) priorityActions.push({ priority: "high", action: `Recover ${(abandonedCarts as any[]).length} abandoned carts`, impact: `${sym}${abandonedTotal.toLocaleString()} in recoverable revenue` });
    if (revenueToday === 0 && orders.length > 0) priorityActions.push({ priority: "medium", action: "Run a flash sale or WhatsApp blast to get a sale today", impact: "Break the zero-revenue day" });

    // Analytics trend
    const analyticsData = (analytics as any[]).map(a => ({
      date:     new Date(a.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      revenue:  a.revenue || 0,
      orders:   a.orders  || 0,
      visitors: a.visitors || 0,
    }));

    return {
      storeId, plan, storeAge,
      storeName:    store?.name || "Your Store",
      country:      store?.country || "Nigeria",
      currency:     locale.currency,
      currencySymbol: sym,
      locale,
      revenueToday, revenueThisWeek, revenueThisMonth, revenueLastMonth,
      revenueTrend, revenueVelocity: revenueThisWeek / 7,
      totalOrders:   orders.length,
      pendingOrders: pending.length,
      processingOrders: processing.length,
      deliveredOrders: delivered.length,
      cancelledOrders: cancelled.length,
      avgOrderValue, ordersToday, unfulfilledRevenue,
      avgFulfillmentTime: 0,
      repeatCustomerRate: repeatRate,
      totalProducts:  products.length,
      activeProducts: activeP.length,
      draftProducts:  products.filter(p => p.status === "DRAFT").length,
      lowStockProducts: lowStock.map(p => ({ id: p.id, name: p.name, inventory: p.inventory || 0, price: p.price || 0 })),
      zeroStockProducts: zeroStock.map(p => ({ id: p.id, name: p.name })),
      topProducts: topP.map(p => ({ id: p.id, name: p.name, price: p.price || 0, inventory: p.inventory || 0, category: p.category || "", image: p.images?.[0] || null })),
      recentProducts: recent.map(p => ({ id: p.id, name: p.name, createdAt: p.createdAt })),
      allProducts: products.map(p => ({ id: p.id, name: p.name, price: p.price || 0, inventory: p.inventory || 0, category: p.category || "" })),
      noImageProducts: noImage.map(p => ({ id: p.id, name: p.name })),
      totalCustomers:    customers.length,
      newCustomersThisWeek: newThisWeek,
      abandonedCarts:   (abandonedCarts as any[]).length,
      abandonedCartValue: abandonedTotal,
      topCustomers,
      activeCoupons:    coupons.length,
      abandonedCartEmails: false,
      reviewCount: reviews.length,
      avgRating,
      healthScore, healthIssues, healthWins,
      growthStage, priorityActions,
      recentOrders: orders.slice(0, 10).map(o => ({
        id: o.id, status: o.status, total: o.total || 0,
        customer: (o.customer as any)?.name || "Unknown",
        date: o.createdAt,
        items: (o.items as any[])?.reduce((a: number, i: any) => a + (i.quantity || 1), 0),
      })),
      analytics: analyticsData,
    };
  } catch(e: any) {
    const { getLocale } = await import("../utils/kai.locale");
    const locale = getLocale("NG");
    return {
      storeId, storeName: "Your Store", plan: "FREE", country: "Nigeria",
      currency: "NGN", currencySymbol: "₦", storeAge: 0, locale,
      revenueToday: 0, revenueThisWeek: 0, revenueThisMonth: 0, revenueLastMonth: 0,
      revenueTrend: "flat", revenueVelocity: 0,
      totalOrders: 0, pendingOrders: 0, processingOrders: 0, deliveredOrders: 0,
      cancelledOrders: 0, avgOrderValue: 0, ordersToday: 0, unfulfilledRevenue: 0,
      avgFulfillmentTime: 0, repeatCustomerRate: 0,
      totalProducts: 0, activeProducts: 0, draftProducts: 0,
      lowStockProducts: [], zeroStockProducts: [], topProducts: [], recentProducts: [],
      allProducts: [], noImageProducts: [],
      totalCustomers: 0, newCustomersThisWeek: 0, abandonedCarts: 0, abandonedCartValue: 0,
      topCustomers: [], activeCoupons: 0, abandonedCartEmails: false, reviewCount: 0, avgRating: 0,
      healthScore: 30, healthIssues: ["Store data unavailable"], healthWins: [],
      growthStage: "setup", priorityActions: [],
      recentOrders: [], analytics: [],
    };
  }
}
