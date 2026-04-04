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

// ── Email template ─────────────────────────────────────────────
function buildConfirmationEmail(name: string, referralCode: string): string {
  const firstName = name.split(" ")[0];
  const shareUrl  = `https://droposhq.com?ref=${referralCode}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Welcome to DropOS</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f4ff;padding:40px 0;">
<tr><td align="center">

<table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

  <!-- LOGO -->
  <tr><td align="center" style="padding-bottom:32px;">
    <table cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" valign="middle" style="width:48px;height:48px;background:#7c3aed;border-radius:13px;font-size:22px;line-height:48px;text-align:center;">
          &#9889;
        </td>
        <td style="padding-left:10px;vertical-align:middle;">
          <span style="font-size:24px;font-weight:900;color:#0f0520;letter-spacing:-0.5px;">Drop</span><span style="font-size:24px;font-weight:900;color:#7c3aed;">OS</span>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- MAIN CARD -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
      style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(124,58,237,0.1);">

      <!-- Purple header band -->
      <tr>
        <td style="background:linear-gradient(135deg,#7c3aed 0%,#5b21b6 100%);padding:48px 48px 40px;text-align:center;">
          <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;">Early Access Confirmed</p>
          <h1 style="margin:0;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1px;line-height:1.15;">
            You are in, ${firstName}!
          </h1>
          <p style="margin:16px 0 0;font-size:16px;color:rgba(255,255,255,0.75);line-height:1.6;max-width:380px;margin-left:auto;margin-right:auto;">
            Welcome to DropOS. You will be among the very first to experience the store that runs itself.
          </p>
        </td>
      </tr>

      <!-- BODY -->
      <tr><td style="padding:40px 48px;">

        <!-- What you are getting -->
        <p style="margin:0 0 20px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#9ca3af;">What you are getting</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:36px;font-size:20px;">&#9889;</td>
            <td style="padding:14px 0 14px 14px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">AI store builder</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Your store goes live in 60 seconds. No code, no experience needed.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;font-size:20px;">&#129302;</td>
            <td style="padding:14px 0 14px 14px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">KAI is your AI business partner</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Finds winning products, fulfils every order, and grows your revenue automatically.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;font-size:20px;">&#127758;</td>
            <td style="padding:14px 0 14px 14px;border-bottom:1px solid #f3f4f6;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">Sell in 50+ countries</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Paystack, Stripe and more are built right in. Accept any payment, anywhere.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;vertical-align:top;font-size:20px;">&#127381;</td>
            <td style="padding:14px 0 14px 14px;vertical-align:top;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">Free forever plan</p>
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">Start with zero cost. Upgrade only when you are ready to scale.</p>
            </td>
          </tr>
        </table>

        <!-- SHARE SECTION -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="background:#faf5ff;border-radius:16px;padding:28px;margin-bottom:32px;">
          <tr><td>
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1.5px;">Unlock 3 months Growth plan free</p>
            <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.7;">
              Share DropOS with 3 friends who join the waitlist and get
              <strong style="color:#111827;">3 months on our Growth plan completely free</strong>
              when we launch.
            </p>
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="padding-right:8px;">
                <a href="https://wa.me/?text=I%20just%20joined%20the%20DropOS%20waitlist.%20An%20AI%20that%20builds%20and%20runs%20your%20store%20automatically.%20Join%20free%3A%20${encodeURIComponent(shareUrl)}"
                  style="display:inline-block;background:#25d366;color:#ffffff;font-size:13px;font-weight:700;padding:11px 22px;border-radius:10px;text-decoration:none;">
                  Share on WhatsApp
                </a>
              </td>
              <td>
                <a href="https://twitter.com/intent/tweet?text=Just%20joined%20DropOS%20waitlist.%20AI%20that%20runs%20your%20store%20automatically.%20Free%3A%20${encodeURIComponent(shareUrl)}"
                  style="display:inline-block;background:#1d9bf0;color:#ffffff;font-size:13px;font-weight:700;padding:11px 22px;border-radius:10px;text-decoration:none;">
                  Share on Twitter
                </a>
              </td>
            </tr></table>
          </td></tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
          <tr><td align="center">
            <a href="https://droposhq.com"
              style="display:inline-block;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:700;padding:15px 40px;border-radius:12px;text-decoration:none;letter-spacing:-0.2px;">
              Visit droposhq.com
            </a>
          </td></tr>
        </table>

      </td></tr>

      <!-- FOOTER inside card -->
      <tr><td style="background:#fafafa;border-top:1px solid #f3f4f6;padding:24px 48px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
          You received this because you joined the DropOS waitlist.<br>
          Questions? <a href="mailto:hello@droposhq.com" style="color:#7c3aed;text-decoration:none;">hello@droposhq.com</a>
          &nbsp; &bull; &nbsp;
          <a href="mailto:unsubscribe@droposhq.com" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
        </p>
      </td></tr>

    </table>
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

    // 9. Send confirmation email — blocking so we can log result
    try {
      const emailResult = await resend.emails.send({
        from:    "DropOS <waitlist@droposhq.com>",
        to:      email,
        subject: `You're on the DropOS waitlist, ${name.split(" ")[0]}`,
        html:    buildConfirmationEmail(name, referralCode),
        headers: {
          "List-Unsubscribe": "<mailto:unsubscribe@droposhq.com>",
          "X-Priority": "1",
        },
      });
      console.log("[Waitlist Email] Sent successfully:", emailResult.data?.id || emailResult);
    } catch (emailErr) {
      console.error("[Waitlist Email Error]", emailErr);
    }

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


// ── DELETE entry (admin) ──────────────────────────────────────
export const deleteWaitlistEntry = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });
  await prisma.waitlistEntry.delete({ where: { id } });
  return res.json({ success: true, message: "Entry deleted" });
};

// ── RESEND confirmation email (admin) ─────────────────────────
export const resendWaitlistEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = await prisma.waitlistEntry.findUnique({ where: { id } });
  if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

  await resend.emails.send({
    from:    "DropOS <waitlist@droposhq.com>",
    to:      entry.email,
    subject: `You are on the DropOS waitlist, ${entry.name.split(" ")[0]}`,
    html:    buildConfirmationEmail(entry.name, entry.referralCode),
    headers: {
      "List-Unsubscribe": "<mailto:unsubscribe@droposhq.com>",
      "X-Priority": "1",
    },
  });

  return res.json({ success: true, message: "Email resent" });
};