import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
import axios from "axios";
import { AppError } from "../utils/AppError";

const router = Router();
router.use(authenticate);

const PLANS: Record<string,any> = {
  free:   { name:"Free",   price:0,      naira:0,     features:["1 store","5 products","Basic analytics"] },
  growth: { name:"Growth", price:9500,   naira:9500,  features:["3 stores","Unlimited products","Advanced analytics","KIRO AI"] },
  pro:    { name:"Pro",    price:25000,  naira:25000, features:["Unlimited stores","All features","Priority support","White label"] },
};

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const FRONTEND_URL    = process.env.FRONTEND_URL || "https://droposhq.com";

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

// POST /api/billing/initialize — kick off Paystack payment for plan upgrade
router.post("/initialize", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { plan } = req.body;
  if (!PLANS[plan] || plan === "free") throw new AppError("Invalid plan", 400);

  const user = await prisma.user.findUnique({ where:{ id: userId }, select:{ email:true, name:true } });
  if (!user) throw new AppError("User not found", 404);

  const amount = PLANS[plan].naira * 100; // kobo

  if (!PAYSTACK_SECRET || PAYSTACK_SECRET.includes("placeholder")) {
    // No Paystack key — mark as upgraded directly (dev/test mode)
    await (prisma.subscription as any).upsert({
      where:  { userId },
      update: { plan: plan.toUpperCase(), status:"ACTIVE", currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
      create: { userId, plan: plan.toUpperCase(), status:"ACTIVE", currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
    });
    return res.json({ success:true, mode:"direct", message:`Upgraded to ${PLANS[plan].name} (test mode)` });
  }

  const { data } = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email:        user.email,
      amount,
      currency:     "NGN",
      callback_url: `${FRONTEND_URL}/dashboard/billing?status=success&plan=${plan}`,
      metadata: { userId, plan, planName: PLANS[plan].name },
    },
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, "Content-Type": "application/json" } }
  );

  res.json({ success:true, authorizationUrl: data.data.authorization_url, reference: data.data.reference });
});

// POST /api/billing/verify — called after Paystack redirects back
router.post("/verify", async (req: Request, res: Response) => {
  const { reference } = req.body;
  if (!reference) throw new AppError("Reference required", 400);

  const { data } = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  );

  if (data.data.status !== "success") throw new AppError("Payment not successful", 400);

  const { userId, plan } = data.data.metadata;
  await (prisma.subscription as any).upsert({
    where:  { userId },
    update: { plan: plan.toUpperCase(), status:"ACTIVE", currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
    create: { userId, plan: plan.toUpperCase(), status:"ACTIVE", currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
  });

  res.json({ success:true, message:`Upgraded to ${PLANS[plan]?.name || plan}` });
});

// POST /api/billing/upgrade — kept for backward compat (direct flag, no payment)
router.post("/upgrade", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { plan } = req.body;
  if (!PLANS[plan]) throw new AppError("Invalid plan", 400);
  const updated = await (prisma.subscription as any).upsert({
    where:  { userId },
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
