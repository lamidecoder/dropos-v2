// src/controllers/productSubscription.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";

const createSchema = z.object({
  productId:     z.string().uuid(),
  customerEmail: z.string().email(),
  interval:      z.enum(["weekly","monthly","quarterly"]),
  intervalCount: z.number().int().positive().default(1),
  discount:      z.number().min(0).max(100).default(0),
});

function nextBillingDate(interval: string, count: number): Date {
  const d = new Date();
  if (interval === "weekly") d.setDate(d.getDate() + 7 * count);
  else if (interval === "monthly") d.setMonth(d.getMonth() + count);
  else d.setMonth(d.getMonth() + 3 * count);
  return d;
}

// POST /subscriptions/:storeId  — customer subscribes
export const createProductSubscription = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const data = createSchema.parse(req.body);

  const product = await prisma.product.findFirst({ where: { id: data.productId, storeId, status: "ACTIVE" } });
  if (!product) throw new AppError("Product not found", 404);

  const existing = await prisma.productSubscription.findFirst({
    where: { storeId, productId: data.productId, customerEmail: data.customerEmail, status: "ACTIVE" },
  });
  if (existing) throw new AppError("You already have an active subscription for this product", 409);

  const discountedPrice = product.price * (1 - data.discount / 100);

  const sub = await prisma.productSubscription.create({
    data: {
      storeId, productId: data.productId, customerEmail: data.customerEmail,
      interval: data.interval, intervalCount: data.intervalCount,
      price: discountedPrice, currency: "USD", discount: data.discount,
      nextBillingAt: nextBillingDate(data.interval, data.intervalCount),
    },
  });

  res.status(201).json({ success: true, data: sub, message: `Subscribed! You'll be charged $${discountedPrice.toFixed(2)} ${data.interval}.` });
};

// GET /subscriptions/:storeId  — store owner views all
export const getProductSubscriptions = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: req.user!.userId } });
  if (!store) throw new AppError("Unauthorized", 403);

  const subs = await prisma.productSubscription.findMany({
    where: { storeId }, orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: subs.length,
    active: subs.filter(s => s.status === "ACTIVE").length,
    mrr: subs.filter(s => s.status === "ACTIVE" && s.interval === "monthly").reduce((sum, s) => sum + s.price, 0),
  };

  res.json({ success: true, data: subs, stats });
};

// PATCH /subscriptions/:storeId/:subId  — pause/cancel
export const updateProductSubscription = async (req: AuthRequest, res: Response) => {
  const { storeId, subId } = req.params;
  const { status } = req.body;

  const updated = await prisma.productSubscription.update({
    where: { id: subId }, data: { status },
  });

  res.json({ success: true, data: updated });
};
