import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();
router.use(authenticate);

// GET /api/referral/stats
router.get("/stats", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user   = await prisma.user.findUnique({ where:{ id:userId }, select:{ id:true, email:true } }) as any;
  const referrals = await prisma.user.count({ where:{ referral:{ referrerId: userId } as any } as any });
  const earnings  = referrals * 5000; // ₦5,000 per referral
  res.json({ success:true, data:{
    code: userId?.slice(-8).toUpperCase(),
    referrals,
    earnings,
    pendingEarnings: 0,
    paidEarnings: earnings,
    link: `https://droposhq.com/ref/${userId?.slice(-8)}`,
  }});
});

// POST /api/referral/apply
router.post("/apply", async (req: Request, res: Response) => {
  const { code } = req.body;
  const referrer = await prisma.user.findFirst({ where:{ id: { endsWith: code.toLowerCase() } as any } as any });
  if (!referrer) return res.status(404).json({ success:false, message:"Referral code not found" });
  res.json({ success:true, message:"Referral code applied!", data:{ referrerId: referrer.id } });
});

export default router;
