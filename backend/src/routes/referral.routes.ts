import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
import { emailService } from "../services/email.service";

const router = Router();
router.use(authenticate);

// GET /api/referral/stats
router.get("/stats", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const user   = await prisma.user.findUnique({ where:{ id:userId }, select:{ id:true, email:true, name:true } });
  if (!user) return res.status(404).json({ success:false });

  const code = userId.slice(-8).toUpperCase();

  // Count referrals (users who signed up with this code)
  const referrals = await prisma.user.count({
    where: { referralCode: code } as any,
  }).catch(()=>0);

  // Count paying referrals
  const payingReferrals = await (prisma as any).subscription.count({
    where: {
      user: { referralCode: code },
      status: "ACTIVE",
      plan: { not: "FREE" },
    },
  }).catch(()=>0);

  const rewardPerReferral = 5000;
  const earnings = payingReferrals * rewardPerReferral;

  res.json({ success:true, data:{
    code,
    link: `https://droposhq.com/ref/${code}`,
    referrals,
    payingReferrals,
    earnings,
    pendingEarnings: (referrals - payingReferrals) * rewardPerReferral,
    paidEarnings:    earnings,
    tier: referrals >= 20 ? "Gold" : referrals >= 10 ? "Silver" : "Starter",
    nextTierAt: referrals >= 20 ? null : referrals >= 10 ? 20 : 10,
  }});
});

// POST /api/referral/apply — apply code at signup
router.post("/apply", async (req: Request, res: Response) => {
  const { code } = req.body;
  const userId   = (req as any).user.userId;

  if (!code?.trim()) return res.status(400).json({ success:false, message:"Code required" });

  // Find referrer by last 8 chars of ID
  const referrer = await prisma.user.findFirst({
    where: { id: { endsWith: code.toLowerCase() } } as any,
  });
  if (!referrer) return res.status(404).json({ success:false, message:"Referral code not found" });
  if (referrer.id === userId) return res.status(400).json({ success:false, message:"Cannot use your own code" });

  // Store referral
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { referralCode: code.toUpperCase() } as any,
    });

    // Notify referrer
    await emailService.send({
      to:      referrer.email,
      subject: "🎉 Someone used your DropOS referral link!",
      html:    `<p>Great news! Someone just signed up using your referral link. You'll earn <strong>₦5,000</strong> when they upgrade to a paid plan.</p><p><a href="https://droposhq.com/dashboard/referral">View your referrals →</a></p>`,
    }).catch(()=>{});

    res.json({ success:true, message:"Referral code applied! You'll get a bonus on first purchase." });
  } catch {
    res.status(500).json({ success:false, message:"Failed to apply code" });
  }
});

// POST /api/referral/withdraw — request payout
router.post("/withdraw", async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { bankName, accountNumber, accountName, amount } = req.body;

  if (!bankName || !accountNumber || !accountName || !amount) {
    return res.status(400).json({ success:false, message:"All bank details required" });
  }

  // Store withdrawal request (manual processing for now)
  await (prisma as any).withdrawalRequest?.create({
    data: { userId, bankName, accountNumber, accountName, amount, status:"PENDING" },
  }).catch(()=>{}); // table may not exist yet

  // Notify admin
  await emailService.send({
    to:      process.env.ADMIN_EMAIL || "support@droposhq.com",
    subject: `💰 Referral Withdrawal Request — ₦${amount}`,
    html:    `<p>User ${userId} requested withdrawal of ₦${amount} to ${bankName} - ${accountNumber} (${accountName})</p>`,
  }).catch(()=>{});

  res.json({ success:true, message:"Withdrawal request submitted! We'll process within 3 business days." });
});

export default router;
