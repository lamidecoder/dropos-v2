// ============================================================
// KAI — Customer Loyalty Points
// Path: backend/src/services/loyalty.service.ts
// Points earned per ₦ spent. Redeemable at checkout.
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default: 1 point per ₦100 spent
const POINTS_PER_NAIRA = 0.01; // 1 point per ₦100
const POINT_VALUE_NAIRA = 1;   // 1 point = ₦1 discount

// ── Award points after successful order ───────────────────────
export async function awardPoints(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { id: true, loyaltyEnabled: true } }, customer: true },
  });

  if (!order?.customer || !order.store.loyaltyEnabled) return;

  const pointsEarned = Math.floor(Number(order.total) * POINTS_PER_NAIRA);
  if (pointsEarned <= 0) return;

  // Upsert loyalty account
  const existing = await prisma.loyaltyAccount.findFirst({
    where: { customerId: order.customer.id, storeId: order.store.id },
  });

  if (existing) {
    await prisma.loyaltyAccount.update({
      where: { id: existing.id },
      data: {
        points: { increment: pointsEarned },
        totalEarned: { increment: pointsEarned },
        transactions: {
          create: {
            type: "EARN",
            points: pointsEarned,
            description: `Earned from order #${orderId.slice(-8).toUpperCase()}`,
            orderId,
          },
        },
      },
    });
  } else {
    await prisma.loyaltyAccount.create({
      data: {
        customerId: order.customer.id,
        storeId: order.store.id,
        points: pointsEarned,
        totalEarned: pointsEarned,
        tier: "bronze",
        transactions: {
          create: {
            type: "EARN",
            points: pointsEarned,
            description: `Earned from order #${orderId.slice(-8).toUpperCase()}`,
            orderId,
          },
        },
      },
    });
  }

  // Check VIP tier upgrade
  await checkTierUpgrade(order.customer.id, order.store.id);
  console.log(`[Loyalty] Awarded ${pointsEarned} points to ${order.customer.name}`);
}

// ── Redeem points at checkout ─────────────────────────────────
export async function redeemPoints(params: {
  customerId: string;
  storeId: string;
  pointsToRedeem: number;
  orderId: string;
}): Promise<{ success: boolean; discountAmount: number; remainingPoints: number }> {
  const { customerId, storeId, pointsToRedeem, orderId } = params;

  const account = await prisma.loyaltyAccount.findFirst({
    where: { customerId, storeId },
  });

  if (!account || account.points < pointsToRedeem) {
    return { success: false, discountAmount: 0, remainingPoints: account?.points || 0 };
  }

  const discountAmount = pointsToRedeem * POINT_VALUE_NAIRA;

  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: {
      points: { decrement: pointsToRedeem },
      totalRedeemed: { increment: pointsToRedeem },
      transactions: {
        create: {
          type: "REDEEM",
          points: -pointsToRedeem,
          description: `Redeemed for ₦${discountAmount} discount`,
          orderId,
        },
      },
    },
  });

  return {
    success: true,
    discountAmount,
    remainingPoints: account.points - pointsToRedeem,
  };
}

// ── Get customer loyalty status ───────────────────────────────
export async function getLoyaltyStatus(customerId: string, storeId: string) {
  const account = await prisma.loyaltyAccount.findFirst({
    where: { customerId, storeId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  if (!account) {
    return {
      points: 0, tier: "bronze", totalEarned: 0, totalRedeemed: 0,
      pointsValue: 0, nextTier: "silver", pointsToNextTier: 500, transactions: [],
    };
  }

  const tiers = [
    { name: "bronze", min: 0,    max: 499,  perks: "1 point per ₦100" },
    { name: "silver", min: 500,  max: 1999, perks: "1.5x points, early access to sales" },
    { name: "gold",   min: 2000, max: 4999, perks: "2x points, free shipping on orders over ₦10k" },
    { name: "vip",    min: 5000, max: Infinity, perks: "3x points, dedicated support, exclusive prices" },
  ];

  const currentTier = tiers.find(t => account.totalEarned >= t.min && account.totalEarned <= t.max) || tiers[0];
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];

  return {
    points: account.points,
    tier: account.tier,
    totalEarned: account.totalEarned,
    totalRedeemed: account.totalRedeemed,
    pointsValue: account.points * POINT_VALUE_NAIRA,
    currentTierPerks: currentTier.perks,
    nextTier: nextTier?.name || null,
    pointsToNextTier: nextTier ? Math.max(0, nextTier.min - account.totalEarned) : 0,
    transactions: account.transactions,
  };
}

// ── Check and upgrade tier ────────────────────────────────────
async function checkTierUpgrade(customerId: string, storeId: string): Promise<void> {
  const account = await prisma.loyaltyAccount.findFirst({
    where: { customerId, storeId },
  });
  if (!account) return;

  const newTier = account.totalEarned >= 5000 ? "vip"
    : account.totalEarned >= 2000 ? "gold"
    : account.totalEarned >= 500 ? "silver"
    : "bronze";

  if (newTier !== account.tier) {
    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { tier: newTier },
    });
  }
}
