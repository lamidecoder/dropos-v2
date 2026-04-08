// ============================================================
// KAI — Plan Limits Middleware
// Path: backend/src/middleware/kai.limits.ts
// Free plan: 5 KAI messages per month
// Growth: 200 per month
// Pro: unlimited
// ============================================================
import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLAN_LIMITS: Record<string, number> = {
  FREE:   5,
  GROWTH: 200,
  PRO:    Infinity,
};

export async function kaiPlanLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Get user's plan
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      select: { plan: true },
    });

    const plan  = subscription?.plan || "FREE";
    const limit = PLAN_LIMITS[plan] ?? 5;

    // Unlimited — skip check
    if (limit === Infinity) return next();

    // Count KAI messages this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const storeId = req.body?.storeId;
    if (!storeId) return next();

    const messageCount = await prisma.kaiMessage.count({
      where: {
        role: "user",
        createdAt: { gte: monthStart },
        conversation: { storeId },
      },
    });

    if (messageCount >= limit) {
      return res.status(403).json({
        success: false,
        code: "KAI_LIMIT_REACHED",
        message: plan === "FREE"
          ? `You've used all ${limit} KAI messages on the Free plan this month. Upgrade to Growth for 200 messages/month.`
          : `You've reached your ${limit} KAI message limit this month.`,
        currentPlan: plan,
        limit,
        used: messageCount,
        upgradeUrl: "/dashboard/billing",
      });
    }

    // Add header so frontend can show remaining count
    res.setHeader("X-KAI-Messages-Used", messageCount.toString());
    res.setHeader("X-KAI-Messages-Limit", limit.toString());
    res.setHeader("X-KAI-Messages-Remaining", (limit - messageCount).toString());

    next();
  } catch (err) {
    // Don't block on limit check errors
    console.error("[KAI Limit]", err);
    next();
  }
}
