// backend/src/controllers/waitlist.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Rate limit store ──────────────────────────────────────────
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

// ── PRIMARY INBOX EMAIL ───────────────────────────────────────
// Strategy: Make Gmail think this is a real conversation.
// - Subject: "quick question" = personal, not marketing
// - No links = zero promotional signals
// - Ends with a question = invites reply
// - When they reply = thread moves to Primary permanently
// - Gmail learns domain = conversational = Primary for everyone after
// - No HTML, no headers, nothing that signals bulk/marketing
// ─────────────────────────────────────────────────────────────
function buildPrimaryEmail(firstName: string): string {
  return `Hi ${firstName},

Got your signup — you're on the list.

Quick question before we launch: what do you currently sell, or what have you been wanting to sell online?

Just reply to this email. I read every one personally.

Olamide
DropOS`;
}

// Follow-up email sent separately (24hrs later) with referral link.
// Keeping links out of first email = Primary inbox guaranteed.
// Second email uses "Re:" prefix = Gmail sees it as same thread = Primary.
function buildFollowUpEmail(firstName: string, referralCode: string): string {
  const shareUrl = `https://droposhq.com?ref=${referralCode}`;

  return `Hi ${firstName},

One thing I forgot to mention.

If you share DropOS with 3 people who join the waitlist, you get 3 months of our Growth plan free when we launch.

Your link: ${shareUrl}

Really glad you're on the list.

Olamide
DropOS`;
}

// ── JOIN WAITLIST ─────────────────────────────────────────────
export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    // 1. Validate
    const body = waitlistSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your details and try again.",
      });
    }

    const { name, email, whatsapp, honeypot, ref, source } = body.data;

    // 2. Honeypot
    if (honeypot && honeypot.length > 0) {
      return res.json({ success: true, message: "You've been added!", spot: 999 });
    }

    // 3. Rate limit
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const ipHash = hashIP(ip);
    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again in an hour.",
      });
    }

    // 4. Duplicate check
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

    // 5. Spot number
    const count = await prisma.waitlistEntry.count();
    const spotNumber = count + 1;

    // 6. Referral
    let referredBy: string | undefined;
    if (ref) {
      const referrer = await prisma.waitlistEntry.findUnique({
        where: { referralCode: ref },
      });
      if (referrer) referredBy = ref;
    }

    // 7. Unique referral code
    let referralCode = genReferralCode();
    while (await prisma.waitlistEntry.findUnique({ where: { referralCode } })) {
      referralCode = genReferralCode();
    }

    // 8. Save
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

    // 9. Send Primary inbox email
    const firstName = name.split(" ")[0];

    try {
      const result = await resend.emails.send({
        from: `Olamide from DropOS <olamide@droposhq.com>`,
        replyTo: `olamide@droposhq.com`,
        to: email,
        subject: `quick question, ${firstName}`,
        text: buildPrimaryEmail(firstName),
        // Deliberately NO html
        // Deliberately NO List-Unsubscribe
        // Deliberately NO Precedence
        // Deliberately NO marketing signals
      });
      console.log("[Waitlist Email] Sent:", result.data?.id);
    } catch (emailErr) {
      console.error("[Waitlist Email Error]", emailErr);
    }

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

// ── GET STATS ─────────────────────────────────────────────────
export const getWaitlistStats = async (_req: Request, res: Response) => {
  const count = await prisma.waitlistEntry.count();
  return res.json({
    success: true,
    data: { count, spotsLeft: Math.max(0, 1000 - count) },
  });
};

// ── ADMIN — all entries ───────────────────────────────────────
export const getWaitlistEntries = async (_req: Request, res: Response) => {
  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true,
        whatsapp: true, referralCode: true,
        spotNumber: true, source: true,
        referredBy: true, createdAt: true,
      },
    }),
    prisma.waitlistEntry.count(),
  ]);
  return res.json({ success: true, data: { entries, total } });
};

// ── DELETE entry ──────────────────────────────────────────────
export const deleteWaitlistEntry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
  await prisma.waitlistEntry.delete({ where: { id } });
  return res.json({ success: true, message: "Entry deleted" });
};

// ── RESEND confirmation ───────────────────────────────────────
export const resendWaitlistEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

  const firstName = entry.name.split(" ")[0];
  await resend.emails.send({
    from: `Olamide from DropOS <olamide@droposhq.com>`,
    replyTo: `olamide@droposhq.com`,
    to: entry.email,
    subject: `quick question, ${firstName}`,
    text: buildPrimaryEmail(firstName),
  });

  return res.json({ success: true, message: "Email resent" });
};

// ── SEND FOLLOW-UP with referral link ────────────────────────
// Send this 24 hours after signup
// "Re:" prefix = Gmail treats as reply thread = Primary inbox
export const sendFollowUpEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

  const firstName = entry.name.split(" ")[0];
  await resend.emails.send({
    from: `Olamide from DropOS <olamide@droposhq.com>`,
    replyTo: `olamide@droposhq.com`,
    to: entry.email,
    subject: `Re: quick question, ${firstName}`,
    text: buildFollowUpEmail(firstName, entry.referralCode),
  });

  return res.json({ success: true, message: "Follow-up sent" });
};