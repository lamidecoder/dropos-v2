// src/routes/analytics.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { requireStoreOwner } from "../controllers/store.controller";

const router = Router();


// ── GET /:storeId/report  — monthly breakdown for reports page ───────────────
router.get("/:storeId/report", authenticate, async (req: any, res) => {
  const { storeId } = req.params;
  const { period = "30d" } = req.query;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const days = period === "1y" ? 365 : period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const from = new Date(Date.now() - days * 86400000);

  const orders = await prisma.order.findMany({
    where: { storeId, createdAt: { gte: from } },
    select: { total: true, createdAt: true, status: true, _count: false },
    orderBy: { createdAt: "asc" },
  });

  // Build monthly buckets
  const buckets: Record<string, { month: string; revenue: number; orders: number; customers: number }> = {};
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 7); // YYYY-MM
    const label = o.createdAt.toLocaleString("en", { month: "short", year: "2-digit" });
    if (!buckets[key]) buckets[key] = { month: label, revenue: 0, orders: 0, customers: 0 };
    buckets[key].orders++;
    if (["COMPLETED", "DELIVERED", "SHIPPED"].includes(o.status)) {
      buckets[key].revenue += o.total;
    }
  }

  const monthly = Object.values(buckets);
  const totRevenue  = monthly.reduce((s, m) => s + m.revenue, 0);
  const totOrders   = monthly.reduce((s, m) => s + m.orders, 0);
  const newCust     = await prisma.storeCustomer.count({ where: { storeId, createdAt: { gte: from } } });

  return res.json({
    success: true,
    data: {
      monthly,
      totals: {
        revenue:  totRevenue,
        orders:   totOrders,
        customers: newCust,
        avgOrder: totOrders > 0 ? totRevenue / totOrders : 0,
      },
    },
  });
});


// ── GET /:storeId/export — CSV export of orders/products/customers ────────────
router.get("/:storeId/export", authenticate, async (req: any, res) => {
  const { storeId } = req.params;
  const { type = "orders", period = "30d" } = req.query;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const days = period === "1y" ? 365 : period === "90d" ? 90 : period === "30d" ? 30 : 7;
  const from = new Date(Date.now() - days * 86400000);

  let csv = "";
  if (type === "orders") {
    const rows = await prisma.order.findMany({
      where: { storeId, createdAt: { gte: from } },
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true, createdAt: true, customerName: true, customerEmail: true, total: true, status: true },
    });
    csv  = "Order Number,Date,Customer,Email,Total,Status\n";
    csv += rows.map(r => `${r.orderNumber},${r.createdAt.toISOString().split("T")[0]},${r.customerName},${r.customerEmail},${r.total.toFixed(2)},${r.status}`).join("\n");
  } else if (type === "products") {
    const rows = await prisma.product.findMany({
      where: { storeId },
      select: { name: true, sku: true, price: true, inventory: true, status: true, category: true },
    });
    csv  = "Name,SKU,Price,Inventory,Status,Category\n";
    csv += rows.map(r => `"${r.name}",${r.sku || ""},${r.price.toFixed(2)},${r.inventory},${r.status},${r.category || ""}`).join("\n");
  } else if (type === "customers") {
    const rows = await prisma.storeCustomer.findMany({
      where: { storeId },
      select: { name: true, email: true, totalOrders: true, totalSpent: true, createdAt: true },
    });
    csv  = "Name,Email,Orders,Total Spent,Since\n";
    csv += rows.map(r => `"${r.name}",${r.email},${r.totalOrders},${r.totalSpent.toFixed(2)},${r.createdAt.toISOString().split("T")[0]}`).join("\n");
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="dropos-${type}-${new Date().toISOString().split("T")[0]}.csv"`);
  return res.send(csv);
});


router.get("/:storeId", authenticate, async (req: any, res) => {
  const { storeId } = req.params;
  const { period = "7d" } = req.query;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const from = new Date();
  from.setDate(from.getDate() - days);

  const [orders, revenue, topProducts, customerGrowth] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      where: { storeId, createdAt: { gte: from } },
      _count: { id: true },
      _sum:   { total: true },
    }),
    await prisma.payment.aggregate({
      where: { storeId, status: "SUCCESS", createdAt: { gte: from } },
      _sum:  { amount: true, platformFee: true, storeEarnings: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      where: { order: { storeId, createdAt: { gte: from } } },
      _sum:  { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    await prisma.storeCustomer.count({
      where: { storeId, createdAt: { gte: from } },
    }),
  ]);

  const totalOrders  = orders.reduce((s, o) => s + o._count.id, 0);
  const completedRev = revenue._sum.amount || 0;

  return res.json({
    success: true,
    data: {
      orders, totalOrders,
      revenue: {
        total:         completedRev,
        platformFees:  revenue._sum.platformFee     || 0,
        storeEarnings: revenue._sum.storeEarnings   || 0,
      },
      topProducts,
      newCustomers: customerGrowth,
      period,
    },
  });
});

export default router;
