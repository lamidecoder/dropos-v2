import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

const router = Router();
router.use(authenticate);

// GET /api/referral/stats
router.get("/stats", async (req: any, res: Response) => {
  try {
    let referral = await prisma.referral.findUnique({ where: { userId: req.user.id } });
    if (!referral) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      referral = await prisma.referral.create({ data: { userId: req.user.id, code } });
    }
    res.json({ success: true, data: referral });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/referral/click (track referral click)
router.post("/click", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false });
    await prisma.referral.update({ where: { code }, data: { clicks: { increment: 1 } } }).catch(() => {});
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
