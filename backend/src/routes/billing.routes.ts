import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

const router = Router();
router.use(authenticate);

const PLANS: Record<string,any> = {
  free:   { name:"Free",   price:0,      features:["1 store","5 products","Basic analytics"] },
  growth: { name:"Growth", price:9500,   features:["3 stores","Unlimited products","Advanced analytics","KIRO AI"] },
  pro:    { name:"Pro",    price:25000,  features:["Unlimited stores","All features","Priority support","White label"] },
};

// GET /api/billing/plans
router.get("/plans", async (_req: Request, res: Response) => {
  res.json({ success:true, data: Object.entries(PLANS).map(([id,p])=>({id,...p})) });
});

// GET /api/billing/current
router.get("/current", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const sub = await prisma.subscription.findFirst({ where:{ userId } });
  res.json({ success:true, data: sub });
});

// POST /api/billing/upgrade
router.post("/upgrade", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { plan } = req.body;
  if (!PLANS[plan]) throw new AppError("Invalid plan", 400);
  const updated = await prisma.subscription.upsert({
    where: { userId },
    update: { plan: plan.toUpperCase(), status:"ACTIVE" },
    create: { userId, plan: plan.toUpperCase(), status:"ACTIVE" },
  });
  res.json({ success:true, data: updated, message:`Upgraded to ${PLANS[plan].name}` });
});

// POST /api/billing/cancel
router.post("/cancel", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  await prisma.subscription.updateMany({ where:{ userId }, data:{ status:"CANCELLED" } });
  res.json({ success:true, message:"Subscription cancelled" });
});

export default router;
