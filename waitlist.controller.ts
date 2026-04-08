// backend/src/controllers/waitlist.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import crypto from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Rate limit store (in-memory, resets on server restart) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ipHash, { count: 1, resetAt: now + 60 * 60 * 1000 }); // 1hr window
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

// ── Input schema ──────────────────────────────────────────────
const waitlistSchema = z.object({
  name:      z.string().min(2).max(60).trim(),
  email:     z.string().email().max(100).toLowerCase().trim(),
  whatsapp:  z.string().max(20).optional(),
  honeypot:  z.string().max(0).optional(), // must be empty
  ref:       z.string().max(20).optional(), // referral code
  source:    z.string().max(50).optional(),
});

// ── Referral code generator ───────────────────────────────────
function genReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A3F8B2C1"
}

// ── Hash IP for GDPR-safe storage ────────────────────────────
function hashIP(ip: string): string {
  return crypto.createHash("sha256")
    .update(ip + (process.env.JWT_SECRET || "dropos-salt"))
    .digest("hex")
    .slice(0, 16);
}

// ── Email template ────────────────────────────────────────────
function buildConfirmationEmail(name: string, spot: number, referralCode: string): string {
  const shareUrl = `https://droposhq.com?ref=${referralCode}`;
  const firstName = name.split(" ")[0];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're on the DropOS Waitlist</title>
</head>
<body style="margin:0;padding:0;background:#07070e;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07070e;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- LOGO -->
      <tr><td align="center" style="padding-bottom:40px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:14px;width:52px;height:52px;text-align:center;vertical-align:middle;">
              <span style="color:white;font-size:24px;font-weight:900;line-height:52px;">&#9889;</span>
            </td>
            <td style="padding-left:12px;">
              <span style="color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">Drop</span><span style="color:#a78bfa;font-size:26px;font-weight:900;">OS</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- HERO CARD -->
      <tr><td style="background:linear-gradient(135deg,#1a1535,#100e24);border-radius:24px;border:1px solid rgba(124,58,237,0.25);padding:48px 40px;text-align:center;">

        <!-- Spot badge -->
        <div style="display:inline-block;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);border-radius:100px;padding:8px 24px;margin-bottom:28px;">
          <span style="color:#a78bfa;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Waitlist Confirmed</span>
        </div>

        <!-- Heading -->
        <h1 style="color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-1px;margin:0 0 12px;line-height:1.2;">
          You're in, ${firstName}! &#127881;
        </h1>
        <p style="color:rgba(255,255,255,0.5);font-size:16px;margin:0 0 36px;line-height:1.6;">
          Welcome to the DropOS waitlist. You've secured your spot and you'll be among the first to experience the store that runs itself.
        </p>

        <!-- Spot number -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px 48px;">
          <tr>
            <td align="center">
              <p style="color:rgba(255,255,255,0.35);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 6px;">Your Spot</p>
              <p style="color:#ffffff;font-size:52px;font-weight:900;letter-spacing:-2px;margin:0;line-height:1;">
                #<span style="color:#a78bfa;">${String(spot).padStart(4, "0")}</span>
              </p>
              <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:6px 0 0;">in the global waitlist</p>
            </td>
          </tr>
        </table>

        <!-- What you get -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:36px;text-align:left;">
          <tr><td style="padding-bottom:8px;">
            <p style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 16px;">What you're getting</p>
          </td></tr>
          <tr><td style="background:rgba(255,255,255,0.03);border-radius:12px;padding:6px 0;">
            ${[
              ["&#9889;", "Early access", "First through the door when we launch"],
              ["&#129302;", "KAI — your AI", "Built-in AI that runs your store for you"],
              ["&#127758;", "Sell globally", "50+ countries, all payment methods"],
              ["&#127381;", "Free forever plan", "Start building with zero cost"],
            ].map(([icon, title, desc]) => `
            <table cellpadding="0" cellspacing="0" width="100%" style="padding:12px 20px;">
              <tr>
                <td style="width:36px;vertical-align:top;padding-top:2px;font-size:18px;">${icon}</td>
                <td style="padding-left:12px;">
                  <p style="color:#ffffff;font-size:14px;font-weight:600;margin:0 0 2px;">${title}</p>
                  <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">${desc}</p>
                </td>
              </tr>
            </table>`).join("")}
          </td></tr>
        </table>

        <!-- Share CTA -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.25);border-radius:16px;padding:24px 32px;text-align:center;width:100%;">
          <tr><td>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 8px;">&#128279; Your unique referral link</p>
            <p style="color:#a78bfa;font-size:14px;font-weight:600;margin:0 0 16px;word-break:break-all;">${shareUrl}</p>
            <p style="color:rgba(255,255,255,0.35);font-size:12px;margin:0;line-height:1.5;">
              Share this link with friends. Every person who joins using your link moves you higher up the waitlist.
            </p>
          </td></tr>
        </table>

      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:32px 0;text-align:center;">
        <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0 0 8px;">
          droposhq.com &nbsp;&middot;&nbsp; The AI Commerce Platform
        </p>
        <p style="color:rgba(255,255,255,0.12);font-size:11px;margin:0;">
          You're receiving this because you joined the DropOS waitlist.<br>
          Questions? hello@droposhq.com
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── JOIN WAITLIST ─────────────────────────────────────────────
export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    // 1. Parse + validate input
    const body = waitlistSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ success: false, message: "Please check your details and try again." });
    }

    const { name, email, whatsapp, honeypot, ref, source } = body.data;

    // 2. Honeypot — silent reject if bot filled it
    if (honeypot && honeypot.length > 0) {
      // Pretend success to confuse bots
      return res.json({ success: true, message: "You've been added to the waitlist!", spot: 999 });
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

    // 4. Check duplicate
    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This email is already on the waitlist!",
        spot: existing.spotNumber,
      });
    }

    // 5. Get next spot number
    const count = await prisma.waitlistEntry.count();
    const spotNumber = count + 1;

    // 6. Validate referral code if provided
    let referredBy: string | undefined;
    if (ref) {
      const referrer = await prisma.waitlistEntry.findUnique({ where: { referralCode: ref } });
      if (referrer) referredBy = ref;
    }

    // 7. Generate unique referral code
    let referralCode = genReferralCode();
    // Ensure uniqueness
    while (await prisma.waitlistEntry.findUnique({ where: { referralCode } })) {
      referralCode = genReferralCode();
    }

    // 8. Save to DB
    const entry = await prisma.waitlistEntry.create({
      data: {
        name,
        email,
        whatsapp: whatsapp || null,
        spotNumber,
        referralCode,
        referredBy: referredBy || null,
        source:    source || "direct",
        ipHash,
        confirmed: true,
      },
    });

    // 9. Send confirmation email (non-blocking)
    resend.emails.send({
      from:    "DropOS <waitlist@droposhq.com>",
      to:      email,
      subject: `You're #${String(spotNumber).padStart(4, "0")} on the DropOS Waitlist ⚡`,
      html:    buildConfirmationEmail(name, referralCode),
    }).catch(err => console.error("[Waitlist Email Error]", err));

    // 10. Respond
    return res.json({
      success:      true,
      message:      "You're on the waitlist!",
      spot:         spotNumber,
      referralCode,
      shareUrl:     `https://droposhq.com?ref=${referralCode}`,
    });

  } catch (err: any) {
    console.error("[Waitlist Error]", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// ── GET STATS (public — for FOMO counter on landing page) ─────
export const getWaitlistStats = async (_req: Request, res: Response) => {
  const count = await prisma.waitlistEntry.count();
  return res.json({ success: true, data: { count, spotsLeft: Math.max(0, 1000 - count) } });
};

// ── ADMIN — see all signups (protected, only Super Admin) ─────
export const getWaitlistEntries = async (_req: Request, res: Response) => {
  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true,
        whatsapp: true, referralCode: true,
        source: true, createdAt: true,
      },
    }),
    prisma.waitlistEntry.count(),
  ]);
  return res.json({ success: true, data: { entries, total } });
};
