// backend/src/controllers/waitlist.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Rate limit store (in-memory) ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

// ── Input schema ──────────────────────────────────────────────
const waitlistSchema = z.object({
  name:     z.string().min(2).max(60).trim(),
  email:    z.string().email().max(100).toLowerCase().trim(),
  whatsapp: z.string().max(20).optional(),
  honeypot: z.string().max(0).optional(),
  ref:      z.string().max(20).optional(),
  source:   z.string().max(50).optional(),
});

// ── Helpers ───────────────────────────────────────────────────
function genReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + (process.env.JWT_SECRET || "dropos-salt"))
    .digest("hex")
    .slice(0, 16);
}

// ── Plain text email (avoids spam filters) ────────────────────
function buildPlainTextEmail(firstName: string, referralCode: string): string {
  const shareUrl = `https://droposhq.com?ref=${referralCode}`;

  return `Hi ${firstName},

You're on the DropOS waitlist.

We're building something that lets anyone sell online without the complexity. KIRO — our AI — builds your store, finds products, and runs your orders automatically. You just own it.

We'll send you early access the moment we open the doors.

One thing — if you share your link with 3 people who join, you'll get 3 months of our Growth plan completely free when we launch.

Your link: ${shareUrl}

Talk soon,
Olamide
DropOS — droposhq.com

---
Reply to this email if you have any questions.
To unsubscribe, reply with "unsubscribe" in the subject.`;
}

// ── JOIN WAITLIST ─────────────────────────────────────────────
export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    // 1. Validate input
    const body = waitlistSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your details and try again.",
      });
    }

    const { name, email, whatsapp, honeypot, ref, source } = body.data;

    // 2. Honeypot — silent reject bots
    if (honeypot && honeypot.length > 0) {
      return res.json({
        success: true,
        message: "You've been added to the waitlist!",
        spot: 999,
      });
    }

    // 3. Rate limiting
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const ipHash = hashIP(ip);
    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again in an hour.",
      });
    }

    // 4. Check duplicate — but be friendly about it
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "You're already on the waitlist! 😄",
        spot: existing.spotNumber,
        referralCode: existing.referralCode,
        shareUrl: `https://droposhq.com?ref=${existing.referralCode}`,
      });
    }

    // 5. Get spot number
    const count = await prisma.waitlistEntry.count();
    const spotNumber = count + 1;

    // 6. Validate referral code
    let referredBy: string | undefined;
    if (ref) {
      const referrer = await prisma.waitlistEntry.findUnique({
        where: { referralCode: ref },
      });
      if (referrer) referredBy = ref;
    }

    // 7. Generate unique referral code
    let referralCode = genReferralCode();
    while (await prisma.waitlistEntry.findUnique({ where: { referralCode } })) {
      referralCode = genReferralCode();
    }

    // 8. Save to DB
    await prisma.waitlistEntry.create({
      data: {
        name,
        email,
        whatsapp: whatsapp || null,
        spotNumber,
        referralCode,
        referredBy: referredBy || null,
        source: source || "direct",
        ipHash,
        confirmed: true,
      },
    });

    // 9. Send plain text confirmation email
    const firstName = name.split(" ")[0];

    try {
      const emailResult = await resend.emails.send({
        from: `Olamide at DropOS <olamide@droposhq.com>`,
        to: email,
        subject: `You're on the list, ${firstName}`,
        text: buildPlainTextEmail(firstName, referralCode),
        // No HTML — plain text lands in Primary inbox
        // No bulk/marketing headers — avoids spam filters
      });

      console.log("[Waitlist Email] Sent:", emailResult.data?.id);
    } catch (emailErr) {
      // Don't fail the whole request if email fails
      console.error("[Waitlist Email Error]", emailErr);
    }

    // 10. Return success
    return res.json({
      success: true,
      message: "You're on the waitlist!",
      spot: spotNumber,
      referralCode,
      shareUrl: `https://droposhq.com?ref=${referralCode}`,
    });
  } catch (err: any) {
    console.error("[Waitlist Error]", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ── GET STATS (public) ────────────────────────────────────────
export const getWaitlistStats = async (_req: Request, res: Response) => {
  const count = await prisma.waitlistEntry.count();
  return res.json({
    success: true,
    data: {
      count,
      spotsLeft: Math.max(0, 1000 - count),
    },
  });
};

// ── ADMIN — all entries ───────────────────────────────────────
export const getWaitlistEntries = async (_req: Request, res: Response) => {
  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        whatsapp: true,
        referralCode: true,
        spotNumber: true,
        source: true,
        referredBy: true,
        createdAt: true,
      },
    }),
    prisma.waitlistEntry.count(),
  ]);

  return res.json({ success: true, data: { entries, total } });
};

// ── DELETE entry (admin) ──────────────────────────────────────
export const deleteWaitlistEntry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) {
    return res.status(404).json({ success: false, message: "Entry not found" });
  }
  await prisma.waitlistEntry.delete({ where: { id } });
  return res.json({ success: true, message: "Entry deleted" });
};

// ── RESEND confirmation (admin) ───────────────────────────────
export const resendWaitlistEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) {
    return res.status(404).json({ success: false, message: "Entry not found" });
  }

  const firstName = entry.name.split(" ")[0];

  await resend.emails.send({
    from: `Olamide at DropOS <olamide@droposhq.com>`,
    to: entry.email,
    subject: `You're on the list, ${firstName}`,
    text: buildPlainTextEmail(firstName, entry.referralCode),
  });

  return res.json({ success: true, message: "Email resent" });
};