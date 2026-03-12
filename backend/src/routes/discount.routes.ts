// src/routes/discount.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/database";
import { DiscountService } from "../services/discount.service";
import { AppError } from "../utils/AppError";
import { requireStoreOwner } from "../controllers/store.controller";
import { globalRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// ── Helper: verify caller owns this store ────────────────────────────────────
async function verifiedStoreId(req: AuthRequest) {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  return storeId;
}

// GET /api/discounts/:storeId — list all discounts (owner only)
router.get("/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const discounts = await prisma.discount.findMany({
    where:   { storeId },
    include: { _count: { select: { usages: true } } },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });
  res.json({ success: true, data: discounts });
});

// POST /api/discounts/:storeId — create discount (owner only)
router.post("/:storeId", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const {
    name, description, type, valueType, value, maxDiscount, freeShipping,
    minOrderValue, minQuantity, productIds, firstOrderOnly,
    bogoRequiredQty, bogoGetQty, bogoPctOff,
    tiers, flashSaleStartsAt, flashSaleEndsAt,
    maxUses, maxUsesPerCustomer,
    startsAt, expiresAt, isAutomatic, priority, stackable,
  } = req.body;

  if (!name || !type || !valueType) throw new AppError("name, type, valueType required", 400);

  const discount = await prisma.discount.create({
    data: {
      storeId, name, description, type, valueType,
      value:         Number(value) || 0,
      maxDiscount:   maxDiscount   ? Number(maxDiscount)   : null,
      minOrderValue: minOrderValue ? Number(minOrderValue) : null,
      minQuantity:   minQuantity   ? Number(minQuantity)   : null,
      productIds:    productIds    || [],
      freeShipping:  Boolean(freeShipping),
      firstOrderOnly:Boolean(firstOrderOnly),
      isAutomatic:   Boolean(isAutomatic),
      stackable:     Boolean(stackable),
      priority:      Number(priority) || 0,
      bogoRequiredQty:  bogoRequiredQty  ? Number(bogoRequiredQty)  : null,
      bogoGetQty:       bogoGetQty       ? Number(bogoGetQty)       : null,
      bogoPctOff:       bogoPctOff       ? Number(bogoPctOff)       : null,
      tiers:            tiers            || null,
      flashSaleStartsAt: flashSaleStartsAt ? new Date(flashSaleStartsAt) : null,
      flashSaleEndsAt:   flashSaleEndsAt   ? new Date(flashSaleEndsAt)   : null,
      maxUses:            maxUses            ? Number(maxUses)            : null,
      maxUsesPerCustomer: maxUsesPerCustomer ? Number(maxUsesPerCustomer) : null,
      startsAt:  startsAt  ? new Date(startsAt)  : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  res.status(201).json({ success: true, data: discount });
});

// PATCH /api/discounts/:storeId/:id — update discount (owner only)
router.patch("/:storeId/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const { id }  = req.params;

  const discount = await prisma.discount.findFirst({ where: { id, storeId } });
  if (!discount) throw new AppError("Discount not found", 404);

  // Whitelist updatable fields — prevent mass assignment
  const {
    name, description, value, maxDiscount, freeShipping, minOrderValue,
    minQuantity, productIds, maxUses, maxUsesPerCustomer,
    startsAt, expiresAt, priority, stackable, status,
  } = req.body;

  const updated = await prisma.discount.update({
    where: { id },
    data: {
      ...(name          !== undefined && { name }),
      ...(description   !== undefined && { description }),
      ...(value         !== undefined && { value: Number(value) }),
      ...(maxDiscount   !== undefined && { maxDiscount: maxDiscount ? Number(maxDiscount) : null }),
      ...(freeShipping  !== undefined && { freeShipping: Boolean(freeShipping) }),
      ...(minOrderValue !== undefined && { minOrderValue: minOrderValue ? Number(minOrderValue) : null }),
      ...(minQuantity   !== undefined && { minQuantity: minQuantity ? Number(minQuantity) : null }),
      ...(productIds    !== undefined && { productIds }),
      ...(maxUses       !== undefined && { maxUses: maxUses ? Number(maxUses) : null }),
      ...(maxUsesPerCustomer !== undefined && { maxUsesPerCustomer: maxUsesPerCustomer ? Number(maxUsesPerCustomer) : null }),
      ...(startsAt      !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
      ...(expiresAt     !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      ...(priority      !== undefined && { priority: Number(priority) }),
      ...(stackable     !== undefined && { stackable: Boolean(stackable) }),
      ...(status        !== undefined && { status }),
    },
  });
  res.json({ success: true, data: updated });
});

// PATCH /api/discounts/:storeId/:id/toggle — toggle status (owner only)
router.patch("/:storeId/:id/toggle", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const { id }  = req.params;

  const d = await prisma.discount.findFirst({ where: { id, storeId } });
  if (!d) throw new AppError("Discount not found", 404);

  const updated = await prisma.discount.update({
    where: { id },
    data:  { status: d.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
  });
  res.json({ success: true, data: updated });
});

// DELETE /api/discounts/:storeId/:id — delete discount (owner only)
router.delete("/:storeId/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const storeId = await verifiedStoreId(req);
  const { id }  = req.params;

  const d = await prisma.discount.findFirst({ where: { id, storeId } });
  if (!d) throw new AppError("Discount not found", 404);

  await prisma.discount.delete({ where: { id } });
  res.json({ success: true });
});

// POST /api/discounts/evaluate — evaluate cart discounts (public, rate limited)
router.post("/evaluate", globalRateLimiter, async (req: Request, res: Response) => {
  const { storeId, cartItems, subtotal, customerId, code } = req.body;
  if (!storeId || !Array.isArray(cartItems)) throw new AppError("storeId and cartItems required", 400);
  if (cartItems.length > 100) throw new AppError("Too many cart items", 400);

  const input = {
    storeId,
    cartItems: cartItems.map((i: any) => ({
      productId: String(i.productId || ""),
      qty:       Math.max(0, Number(i.qty) || 0),
      price:     Math.max(0, Number(i.price) || 0),
    })),
    subtotal:   Math.max(0, Number(subtotal) || 0),
    customerId: customerId ? String(customerId) : undefined,
  };

  let autoDiscounts: any[] = [];
  let codeDiscount: any    = null;

  autoDiscounts = await DiscountService.getAutoDiscounts(input);

  if (code) {
    try {
      codeDiscount = await DiscountService.validateCode(String(code).slice(0, 50), storeId, input);
    } catch (e: any) {
      return res.json({ success: true, data: { autoDiscounts, codeDiscount: null, codeError: e.message } });
    }
  }

  const totalDiscount = autoDiscounts.reduce((s, d) => s + (d.amount || 0), 0)
    + (codeDiscount?.amount || 0);

  const freeShipping = autoDiscounts.some(d => d.freeShipping) || codeDiscount?.freeShipping;

  res.json({
    success: true,
    data: { autoDiscounts, codeDiscount, totalDiscount, freeShipping },
  });
});

// GET /api/discounts/:storeId/:id/analytics
router.get("/:storeId/:id/analytics", authenticate, async (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const d = await prisma.discount.findFirst({ where: { id, storeId } });
  if (!d) throw new AppError("Discount not found", 404);

  const analytics = await DiscountService.getAnalytics(id);
  res.json({ success: true, data: analytics });
});

export default router;
