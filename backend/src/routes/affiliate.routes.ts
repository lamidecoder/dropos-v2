// src/routes/affiliate.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/database";
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

// ── Helpers ─────────────────────────────────────────────────────────────────
function randomCode(len = 8) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

// ── GET /api/affiliates/:storeId — list all affiliates ──────────────────────
router.get("/:storeId", authenticate, async (req: Request, res: Response) => {
  const affiliates = await prisma.affiliate.findMany({
    where:   { storeId: req.params.storeId },
    include: { _count: { select: { referrals: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: affiliates });
});

// ── POST /api/affiliates/:storeId — create affiliate ───────────────────────
router.post("/:storeId", authenticate, async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { name, email, commissionPct, commissionFlat, payoutMethod, notes } = req.body;
  if (!name || !email) throw new AppError("name and email required", 400);

  // Generate unique code
  let code = req.body.code?.toUpperCase() || randomCode();
  const existing = await prisma.affiliate.findFirst({ where: { storeId, code } });
  if (existing) code = randomCode(10);

  const affiliate = await prisma.affiliate.create({
    data: {
      storeId, name, email, code,
      commissionPct:  Number(commissionPct)  || 10,
      commissionFlat: commissionFlat ? Number(commissionFlat) : null,
      payoutMethod:   payoutMethod || null,
      notes:          notes || null,
      status:         "ACTIVE",
    },
  });
  res.status(201).json({ success: true, data: affiliate });
});

// ── PATCH /api/affiliates/:storeId/:id — update ──────────────────────────
router.patch("/:storeId/:id", authenticate, async (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const aff = await prisma.affiliate.findFirst({ where: { id, storeId } });
  if (!aff) throw new AppError("Affiliate not found", 404);

  const updated = await prisma.affiliate.update({ where: { id }, data: req.body });
  res.json({ success: true, data: updated });
});

// ── PATCH /api/affiliates/:storeId/:id/status — change status ──────────────
router.patch("/:storeId/:id/status", authenticate, async (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const { status } = req.body;
  await prisma.affiliate.update({ where: { id }, data: { status } });
  res.json({ success: true });
});

// ── DELETE /api/affiliates/:storeId/:id ───────────────────────────────────
router.delete("/:storeId/:id", authenticate, async (req: Request, res: Response) => {
  await prisma.affiliate.deleteMany({ where: { id: req.params.id, storeId: req.params.storeId } });
  res.json({ success: true });
});

// ── GET /api/affiliates/:storeId/:id/stats ─────────────────────────────────
router.get("/:storeId/:id/stats", authenticate, async (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const aff = await prisma.affiliate.findFirst({ where: { id, storeId } });
  if (!aff) throw new AppError("Not found", 404);

  const [conversions, clicks, payouts] = await Promise.all([
    await prisma.referralConversion.findMany({ where: { affiliateId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
    await prisma.referralClick.count({ where: { affiliateId: id } }),
    await prisma.affiliatePayout.findMany({ where: { affiliateId: id }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const pendingBalance = conversions
    .filter(c => c.status === "PENDING" || c.status === "APPROVED")
    .reduce((s, c) => s + c.commission, 0);

  const conversionRate = clicks > 0
    ? ((conversions.length / clicks) * 100).toFixed(1)
    : "0";

  res.json({ success: true, data: { conversions, clicks, payouts, pendingBalance, conversionRate } });
});

// ── POST /api/affiliates/:storeId/:id/payout ──────────────────────────────
router.post("/:storeId/:id/payout", authenticate, async (req: Request, res: Response) => {
  const { storeId, id } = req.params;
  const { amount, method, reference, note } = req.body;
  if (!amount || amount <= 0) throw new AppError("Amount required", 400);

  const payout = await prisma.affiliatePayout.create({
    data: { affiliateId: id, storeId, amount: Number(amount), method: method || "manual", reference, note, status: "SENT" },
  });

  await prisma.affiliate.update({
    where: { id },
    data:  { totalPaid: { increment: Number(amount) } },
  });

  res.json({ success: true, data: payout });
});

// ── POST /api/affiliates/track-click — public (from storefront) ─────────────
router.post("/track-click", globalRateLimiter, async (req: Request, res: Response) => {
  const { code, storeId, page } = req.body;
  if (!code || !storeId) return res.json({ success: true });

  const aff = await prisma.affiliate.findFirst({ where: { storeId, code, status: "ACTIVE" } });
  if (!aff) return res.json({ success: true });

  await Promise.all([
    await prisma.referralClick.create({
      data: { affiliateId: aff.id, storeId, ip: req.ip, userAgent: req.headers["user-agent"], page },
    }),
    await prisma.affiliate.update({ where: { id: aff.id }, data: { totalClicks: { increment: 1 } } }),
  ]);

  res.json({ success: true, data: { affiliateId: aff.id, name: aff.name } });
});

// ── POST /api/affiliates/record-conversion — called after order ──────────────
router.post("/record-conversion", globalRateLimiter, async (req: Request, res: Response) => {
  const { affiliateId, orderId, storeId, orderValue } = req.body;
  if (!affiliateId || !orderId) return res.json({ success: true });

  const aff = await prisma.affiliate.findFirst({ where: { id: affiliateId, storeId, status: "ACTIVE" } });
  if (!aff) return res.json({ success: true });

  const commission = aff.commissionFlat
    ? aff.commissionFlat
    : (Number(orderValue) * aff.commissionPct) / 100;

  await Promise.all([
    await prisma.referralConversion.create({
      data: { affiliateId, orderId, storeId, orderValue: Number(orderValue), commission, status: "PENDING" },
    }),
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data:  { totalEarned: { increment: commission }, totalOrders: { increment: 1 } },
    }),
  ]);

  res.json({ success: true, data: { commission } });
});

export default router;
