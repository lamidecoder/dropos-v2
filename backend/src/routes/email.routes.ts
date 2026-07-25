// src/routes/email.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { emailService } from "../services/email.service";
import prisma from "../lib/prisma";
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


// POST /api/emails/:storeId/campaigns/:campaignId/send — send to all customers
router.post("/:storeId/campaigns/:campaignId/send", authenticate, async (req: any, res) => {
  const { storeId, campaignId } = req.params;
  const { prisma } = require("../config/database");
  const RESEND_KEY = process.env.RESEND_API_KEY;

  // Get campaign
  const campaign = await (prisma.emailCampaign as any).findFirst({
    where: { id: campaignId, storeId },
  }).catch(() => null);

  if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
  if (campaign.status === "sent") return res.status(400).json({ success: false, message: "Already sent" });

  // Get store + customers
  const [store, customers] = await Promise.all([
    prisma.store.findUnique({ where:{ id: storeId }, select:{ name: true, slug: true } }),
    prisma.customer.findMany({ where:{ storeId }, select:{ email: true, name: true }, take: 500 }),
  ]);

  if (!customers.length) return res.status(400).json({ success: false, message: "No customers to send to" });
  if (!RESEND_KEY) return res.status(400).json({ success: false, message: "Email not configured. Add RESEND_API_KEY in Render environment settings." });

  // Send to all customers via Resend
  const FROM = `${store?.name || "DropOS Store"} <hello@droposhq.com>`;
  let sent = 0, failed = 0;

  for (const customer of customers) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: FROM,
          to: customer.email,
          subject: campaign.subject,
          text: campaign.body,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">${(campaign.body || "").replace(/\n/g, "<br/>")}</div>`,
        }),
      });
      sent++;
    } catch { failed++; }
  }

  // Mark as sent
  await (prisma.emailCampaign as any).update({
    where: { id: campaignId },
    data: { status: "sent", sentAt: new Date(), recipients: sent },
  }).catch(() => {});

  return res.json({ success: true, data: { sent, failed, total: customers.length } });
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
    where:   { storeId: req.params.storeId, createdAt: { gte: weekAgo }, status: "COMPLETED" },
    include: { items: { include: { product: { select: { name: true } } } } },
  });

  const revenue      = orders.reduce((s, o) => s + Number(o.total), 0);
  const newCustomers = await prisma.storeCustomer.count({ where: { storeId: req.params.storeId, createdAt: { gte: weekAgo } } });

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
