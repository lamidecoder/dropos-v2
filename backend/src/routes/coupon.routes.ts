// src/routes/coupon.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { requireStoreOwner } from "../controllers/store.controller";
import { AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// ── Helper: verify store ownership and return storeId ──────────────────────
async function verifiedStoreId(req: AuthRequest) {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  return storeId;
}

// POST /api/coupons/validate  (public — no auth required, minimal data exposure)
router.post("/validate", async (req: Request, res: Response) => {
  const schema = z.object({
    code:       z.string().min(1).max(50),
    storeId:    z.string().uuid(),
    orderTotal: z.number().nonnegative().optional(),
  });
  const { code, storeId, orderTotal } = schema.parse(req.body);

  const coupon = await prisma.coupon.findFirst({
    where: {
      storeId,
      code:     code.toUpperCase().trim(),
      isActive: true,
    },
    select: {
      id: true, code: true, type: true, value: true,
      minOrderValue: true, maxUses: true, usedCount: true, expiresAt: true,
    },
  });

  if (!coupon)                                           throw new AppError("Invalid coupon code", 400);
  if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new AppError("Coupon has expired", 400);
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new AppError("Coupon usage limit reached", 400);
  if (coupon.minOrderValue && Number(orderTotal ?? 0) < coupon.minOrderValue)
    throw new AppError(`Minimum order of $${coupon.minOrderValue} required`, 400);

  const order = Number(orderTotal ?? 0);
  const discount = coupon.type === "PERCENTAGE"
    ? (order * coupon.value) / 100
    : coupon.value;

  // Only return safe fields — not internal DB ids etc
  res.json({
    success: true,
    data: {
      coupon:   { code: coupon.code, type: coupon.type, value: coupon.value },
      discount: Math.min(discount, order),
    },
  });
});

// GET /api/coupons/:storeId — list (owner only)
router.get("/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const coupons = await prisma.coupon.findMany({
    where:   { storeId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: coupons });
});

// POST /api/coupons/:storeId — create (owner only)
router.post("/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);

  const schema = z.object({
    code:          z.string().min(1).max(50),
    type:          z.enum(["PERCENTAGE", "FIXED"]),
    value:         z.number().positive(),
    minOrderValue: z.number().nonnegative().optional(),
    maxUses:       z.number().int().positive().optional(),
    expiresAt:     z.string().datetime().optional(),
  });
  const data = schema.parse(req.body);

  const existing = await prisma.coupon.findFirst({
    where: { storeId, code: data.code.toUpperCase() },
  });
  if (existing) throw new AppError("Coupon code already exists", 400);

  const coupon = await prisma.coupon.create({
    data: {
      storeId,
      code:          data.code.toUpperCase().trim(),
      type:          data.type,
      value:         data.value,
      minOrderValue: data.minOrderValue ?? 0,
      maxUses:       data.maxUses ?? null,
      expiresAt:     data.expiresAt ? new Date(data.expiresAt) : null,
      isActive:      true,
      usedCount:     0,
    },
  });
  res.status(201).json({ success: true, data: coupon });
});

// PATCH /api/coupons/:storeId/:id — update (owner only)
router.patch("/:storeId/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);

  const schema = z.object({
    isActive:      z.boolean().optional(),
    maxUses:       z.number().int().positive().nullable().optional(),
    expiresAt:     z.string().datetime().nullable().optional(),
    minOrderValue: z.number().nonnegative().optional(),
  }).strict();
  const data = schema.parse(req.body);

  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params.id, storeId },
  });
  if (!coupon) throw new AppError("Coupon not found", 404);

  const updated = await prisma.coupon.update({
    where: { id: req.params.id },
    data:  {
      ...data,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : data.expiresAt,
    },
  });
  res.json({ success: true, data: updated });
});

// DELETE /api/coupons/:storeId/:id — delete (owner only)
router.delete("/:storeId/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);

  const coupon = await prisma.coupon.findFirst({
    where: { id: req.params.id, storeId },
  });
  if (!coupon) throw new AppError("Coupon not found", 404);

  await prisma.coupon.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
