// src/controllers/abandonedCart.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { emailService }        from "../services/email.service";
import { notificationService } from "../services/notification.service";
import { requireStoreOwner } from "./store.controller";

const cartItemSchema = z.object({
  productId:    z.string(),
  name:         z.string(),
  price:        z.number(),
  quantity:     z.number().int().positive(),
  image:        z.string().optional(),
  variantId:    z.string().optional(),
  variantLabel: z.string().optional(),
  storeId:      z.string(),
  storeSlug:    z.string(),
});

// ── POST /api/abandoned-carts/save ───────────────────────────────────────────
// Called by the storefront when a user has been idle 30min with items in cart
export const saveAbandonedCart = async (req: Request, res: Response) => {
  const data = z.object({
    storeId:  z.string(),
    email:    z.string().email(),
    name:     z.string().optional(),
    items:    z.array(cartItemSchema).min(1),
    total:    z.number().positive(),
    currency: z.string().default("USD"),
  }).parse(req.body);

  // Upsert — one record per (storeId, email) pair, update if re-abandoned
  const existing = await prisma.abandonedCart.findFirst({
    where: { storeId: data.storeId, email: data.email, recovered: false },
  });

  if (existing) {
    // Update items/total, reset email sent so they get a fresh reminder
    await prisma.abandonedCart.update({
      where: { id: existing.id },
      data: {
        items:    data.items as any,
        total:    data.total,
        currency: data.currency,
        name:     data.name,
        emailSent: false,
        updatedAt: new Date(),
      },
    });
    return res.json({ success: true, token: existing.token });
  }

  const cart = await prisma.abandonedCart.create({
    data: {
      storeId:  data.storeId,
      email:    data.email,
      name:     data.name,
      items:    data.items as any,
      total:    data.total,
      currency: data.currency,
    },
  });

  return res.status(201).json({ success: true, token: cart.token });
};

// ── POST /api/abandoned-carts/recover/:token ─────────────────────────────────
// Called when shopper clicks the email recovery link — marks cart recovered
export const recoverCart = async (req: Request, res: Response) => {
  const cart = await prisma.abandonedCart.findUnique({
    where: { token: req.params.token },
    include: { store: { select: { slug: true, name: true } } },
  });

  if (!cart) throw new AppError("Recovery link not found", 404);
  if (cart.recovered) {
    // Already recovered — still redirect them to the store
    return res.json({ success: true, storeSlug: cart.store.slug, items: cart.items, recovered: true });
  }

  await prisma.abandonedCart.update({
    where: { id: cart.id },
    data:  { recovered: true, recoveredAt: new Date() },
  });

  return res.json({
    success:   true,
    storeSlug: cart.store.slug,
    storeName: cart.store.name,
    items:     cart.items,
    total:     cart.total,
    currency:  cart.currency,
    recovered: false, // was not previously recovered
  });
};

// ── POST /api/abandoned-carts/send-reminders ─────────────────────────────────
// Called by a cron or manually from the dashboard
// Finds all un-emailed carts older than 1h and sends recovery emails
export const sendAbandonedCartReminders = async (req: Request, res: Response) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const carts = await prisma.abandonedCart.findMany({
    where: {
      recovered:  false,
      emailSent:  false,
      createdAt:  { lte: oneHourAgo },
      reminderCount: { lt: 2 }, // max 2 reminder emails
    },
    include: {
      store: {
        select: { name: true, slug: true, primaryColor: true, supportEmail: true, smsEnabled: true, notifyCustomerSms: true, whatsappEnabled: true, whatsappPhone: true, smsPhone: true, owner: { select: { email: true } } },
      },
    },
    take: 50, // process max 50 at a time
  });

  let sent = 0, failed = 0;

  for (const cart of carts) {
    try {
      const recoveryUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/store/${cart.store.slug}/recover/${cart.token}`;
      const items = cart.items as any[];

      await emailService.sendAbandonedCart({
        email:       cart.email,
        name:        cart.name || "there",
        storeName:   cart.store.name,
        storeSlug:   cart.store.slug,
        items:       items.slice(0, 4),
        total:       cart.total,
        currency:    cart.currency,
        recoveryUrl,
        brandColor:  cart.store.primaryColor || "#c9a84c",
      });

      // Best-effort SMS nudge if store has customer SMS enabled
      notificationService.notifyCustomerAbandonedCart({
        customerPhone: null, // not captured for anonymous carts
        smsEnabled:    false, // only fires if phone is known
        storeName:     cart.store.name,
        total:         cart.total,
        currency:      cart.currency,
        recoveryUrl,
      });

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data:  { emailSent: true, emailSentAt: new Date(), reminderCount: { increment: 1 } },
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send abandoned cart email to ${cart.email}:`, err);
      failed++;
    }
  }

  return res.json({ success: true, sent, failed, processed: carts.length });
};

// ── GET /api/abandoned-carts/:storeId ────────────────────────────────────────
// Dashboard: list abandoned carts for a store
export const getAbandonedCarts = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { page = 1, limit = 20, recovered } = req.query;
  const take = Number(limit);
  const skip = (Number(page) - 1) * take;

  const where: any = { storeId };
  if (recovered === "true")  where.recovered = true;
  if (recovered === "false") where.recovered = false;

  const [carts, total] = await Promise.all([
    await prisma.abandonedCart.findMany({
      where, take, skip,
      orderBy: { createdAt: "desc" },
    }),
    await prisma.abandonedCart.count({ where }),
  ]);

  // Compute summary stats
  const [totalAbandoned, totalRecovered, totalRevenue] = await Promise.all([
    await prisma.abandonedCart.count({ where: { storeId } }),
    await prisma.abandonedCart.count({ where: { storeId, recovered: true } }),
    await prisma.abandonedCart.aggregate({
      where: { storeId, recovered: true },
      _sum: { total: true },
    }),
  ]);

  return res.json({
    success: true,
    data:    carts,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
    stats: {
      totalAbandoned,
      totalRecovered,
      recoveryRate: totalAbandoned > 0 ? Math.round((totalRecovered / totalAbandoned) * 100) : 0,
      recoveredRevenue: totalRevenue._sum.total || 0,
    },
  });
};

// ── DELETE /api/abandoned-carts/:storeId/:cartId ─────────────────────────────
export const deleteAbandonedCart = async (req: AuthRequest, res: Response) => {
  const { storeId, cartId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  await prisma.abandonedCart.deleteMany({
    where: { id: cartId, storeId },
  });

  return res.json({ success: true, message: "Cart deleted" });
};

// ── POST /api/abandoned-carts/:storeId/resend/:cartId ────────────────────────
// Manually resend recovery email for a specific cart
export const resendRecoveryEmail = async (req: AuthRequest, res: Response) => {
  const { storeId, cartId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const cart = await prisma.abandonedCart.findFirst({
    where: { id: cartId, storeId },
    include: {
      store: { select: { name: true, slug: true, primaryColor: true } },
    },
  });

  if (!cart) throw new AppError("Abandoned cart not found", 404);
  if (cart.recovered) throw new AppError("Cart already recovered", 400);

  const recoveryUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/store/${cart.store.slug}/recover/${cart.token}`;

  await emailService.sendAbandonedCart({
    email:      cart.email,
    name:       cart.name || "there",
    storeName:  cart.store.name,
    storeSlug:  cart.store.slug,
    items:      (cart.items as any[]).slice(0, 4),
    total:      cart.total,
    currency:   cart.currency,
    recoveryUrl,
    brandColor: cart.store.primaryColor || "#c9a84c",
  });

  await prisma.abandonedCart.update({
    where: { id: cart.id },
    data:  { emailSent: true, emailSentAt: new Date(), reminderCount: { increment: 1 } },
  });

  return res.json({ success: true, message: "Recovery email sent" });
};
