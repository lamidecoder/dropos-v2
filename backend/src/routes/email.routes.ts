// src/routes/email.routes.ts
import { Router, Request, Response } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { emailService } from "../services/email.service";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/email/test — send test email to current user
router.post("/test", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { email: true, name: true },
  });
  if (!user) throw new AppError("User not found", 404);

  await emailService.sendTestEmail(user.email, user.name);

  const devMode = !process.env.SMTP_USER || process.env.SMTP_USER.trim() === "";

  res.json({
    success: true,
    message: devMode
      ? "Dev mode: email logged to console (set SMTP_USER in .env to send real emails)"
      : `Test email sent to ${user.email}`,
    devMode,
  });
});

// GET /api/email/status — check email config
router.get("/status", authenticate, async (_req: Request, res: Response) => {
  const devMode = !process.env.SMTP_USER || process.env.SMTP_USER.trim() === "";
  res.json({
    success: true,
    data: {
      configured: !devMode,
      devMode,
      smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
      smtpPort: process.env.SMTP_PORT || "587",
      from:     process.env.EMAIL_FROM || "DropOS <noreply@dropos.io>",
      hint:     devMode ? "Set SMTP_USER and SMTP_PASS in backend/.env to enable real emails" : "Email is configured and active",
    },
  });
});

// POST /api/email/low-stock-check — manually trigger low stock check for a store
router.post("/low-stock-check/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { owner: { select: { email: true, name: true } } },
  });
  if (!store) throw new AppError("Store not found", 404);

  const lowStockProducts = await prisma.product.findMany({
    where: { storeId, inventory: { lte: 5 } },
    select: { name: true, sku: true, inventory: true },
  });

  if (lowStockProducts.length === 0) {
    return res.json({ success: true, message: "No low-stock products found" });
  }

  await emailService.sendLowStockAlert(
    store.owner.email,
    store.owner.name,
    lowStockProducts,
    store.name
  );

  res.json({
    success: true,
    message: `Low stock alert sent for ${lowStockProducts.length} product(s)`,
    data: lowStockProducts,
  });
});

export default router;

// POST /api/email/weekly-digest/:storeId — trigger weekly digest for a store
router.post("/weekly-digest/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const store = await prisma.store.findUnique({
    where:   { id: req.params.storeId },
    include: { owner: { select: { email: true, name: true } } },
  });
  if (!store) throw new AppError("Store not found", 404);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const orders  = await prisma.order.findMany({
    where:   { storeId: req.params.storeId, createdAt: { gte: weekAgo }, paymentStatus: "PAID" },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  const revenue      = orders.reduce((s, o) => s + Number(o.total), 0);
  const newCustomers = await prisma.customer.count({ where: { storeId: req.params.storeId, createdAt: { gte: weekAgo } } });

  // Top product by quantity sold
  const productCount: Record<string, { name: string; qty: number }> = {};
  orders.forEach(o => o.items.forEach((i: any) => {
    const name = i.product?.name || i.productName || "Unknown";
    if (!productCount[name]) productCount[name] = { name, qty: 0 };
    productCount[name].qty += i.quantity;
  }));
  const topProduct = Object.values(productCount).sort((a, b) => b.qty - a.qty)[0]?.name || "—";

  await emailService.sendWeeklyDigest(store.owner.email, store.owner.name, {
    storeName: store.name, revenue, orders: orders.length,
    newCustomers, topProduct, currency: store.currency || "USD",
  });

  res.json({ success: true, message: "Weekly digest sent", data: { revenue, orders: orders.length, newCustomers, topProduct } });
});

// POST /api/email/refund/:orderId — trigger refund email
router.post("/refund/:orderId", authenticate, async (req: AuthRequest, res: Response) => {
  const order = await prisma.order.findUnique({
    where:   { id: req.params.orderId },
    include: { store: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  const sym = (order.store as any)?.currency === "NGN" ? "₦" : "$";
  await emailService.sendRefundProcessed(
    order.customerEmail, order.customerName, order.orderNumber,
    `${sym}${Number(order.total).toFixed(2)}`, (order.store as any)?.name || "Store"
  );
  res.json({ success: true, message: "Refund email sent" });
});
