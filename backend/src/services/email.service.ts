// src/services/email.service.ts
import { logger } from "../utils/logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.SMTP_PASS || "";
const DEV_MODE = !RESEND_API_KEY || RESEND_API_KEY.trim() === "";
const FROM     = process.env.EMAIL_FROM || "DropOS <onboarding@resend.dev>";
const BASE     = process.env.FRONTEND_URL || "http://localhost:3000";
const YEAR     = new Date().getFullYear();

// ── Base luxury template ───────────────────────────────────────────────────
const base = (opts: {
  preheader?: string;
  headerColor?: string;
  headerIcon?: string;
  content: string;
  storeName?: string;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>DropOS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',-apple-system,sans-serif;background:#08080f;margin:0;padding:32px 16px;-webkit-font-smoothing:antialiased}
    .preheader{display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#08080f}
    .shell{max-width:560px;margin:0 auto}
    .card{background:#0f0f1a;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)}
    .header{padding:36px 40px;text-align:center;position:relative;overflow:hidden}
    .header::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at top,rgba(201,168,76,0.15),transparent 70%)}
    .logo{display:inline-flex;align-items:center;gap:8px;position:relative;z-index:1}
    .logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#c9a84c,#f0c040);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1}
    .logo-text{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px}
    .logo-text span{color:#c9a84c}
    .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.3),transparent);margin:0}
    .body{padding:40px}
    .icon-circle{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;font-size:28px}
    h1{font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin:0 0 12px;line-height:1.3}
    p{font-size:15px;color:#94a3b8;line-height:1.7;margin:0 0 16px}
    .btn{display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#c9a84c,#f0c040);color:#000!important;text-decoration:none;border-radius:12px;font-weight:800;font-size:14px;letter-spacing:0.2px;margin:8px 0}
    .btn-ghost{display:inline-block;padding:14px 32px;border:1px solid rgba(255,255,255,0.1);color:#94a3b8!important;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;margin:8px 0}
    .badge{display:inline-block;padding:5px 14px;border-radius:999px;background:rgba(201,168,76,0.1);color:#c9a84c;font-size:13px;font-weight:700;border:1px solid rgba(201,168,76,0.2);letter-spacing:0.3px}
    .badge-green{background:rgba(16,185,129,0.1);color:#10b981;border:1px solid rgba(16,185,129,0.2)}
    .badge-red{background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2)}
    .badge-blue{background:rgba(59,130,246,0.1);color:#60a5fa;border:1px solid rgba(59,130,246,0.2)}
    .info-box{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;margin:20px 0}
    .info-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
    .info-row:last-child{border-bottom:none;padding-bottom:0}
    .info-label{font-size:13px;color:#475569;font-weight:500}
    .info-value{font-size:13px;color:#e2e8f0;font-weight:600;text-align:right}
    .total-row{background:rgba(201,168,76,0.04);border-radius:10px;padding:14px 16px;margin-top:12px;display:flex;justify-content:space-between;align-items:center}
    .total-label{font-size:14px;color:#94a3b8;font-weight:600}
    .total-value{font-size:22px;color:#c9a84c;font-weight:900;letter-spacing:-0.5px}
    .step{display:flex;gap:16px;margin-bottom:16px;align-items:flex-start}
    .step-num{width:28px;height:28px;border-radius:8px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.2);color:#c9a84c;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
    .step-text{font-size:14px;color:#94a3b8;line-height:1.6}
    .step-text strong{color:#e2e8f0}
    .alert{border-radius:12px;padding:16px 18px;margin:20px 0;font-size:14px;font-weight:500;line-height:1.5}
    .alert-warning{background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);color:#fbbf24}
    .alert-success{background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);color:#34d399}
    .alert-danger{background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);color:#f87171}
    .footer{padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04)}
    .footer p{font-size:12px;color:#334155;margin:0;line-height:1.8}
    .footer a{color:#475569;text-decoration:none}
    .footer a:hover{color:#94a3b8}
    .social{display:flex;justify-content:center;gap:12px;margin-bottom:16px}
    .social a{display:inline-block;width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);text-align:center;line-height:32px;color:#475569;text-decoration:none;font-size:12px;font-weight:700}
  </style>
</head>
<body>
  ${opts.preheader ? `<span class="preheader">${opts.preheader}</span>` : ""}
  <div class="shell">
    <div class="card">
      <div class="header">
        <div class="logo">
          <div class="logo-icon">⚡</div>
          <div class="logo-text">Drop<span>OS</span></div>
        </div>
        ${opts.storeName ? `<div style="margin-top:8px;font-size:12px;color:rgba(255,255,255,0.3);position:relative;z-index:1">via ${opts.storeName}</div>` : ""}
      </div>
      <div class="divider"></div>
      <div class="body">
        ${opts.content}
      </div>
      <div class="footer">
        <div class="social">
          <a href="#">𝕏</a>
          <a href="#">in</a>
          <a href="#">ig</a>
        </div>
        <p>
          © ${YEAR} DropOS · <a href="${BASE}">dropos.io</a><br>
          <a href="${BASE}/unsubscribe">Unsubscribe</a> · <a href="${BASE}/privacy">Privacy</a>
        </p>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:#1e293b;margin-top:16px">
      Sent by DropOS · You're receiving this because you have an account with us.
    </p>
  </div>
</body>
</html>`;

// ── Email service class ────────────────────────────────────────────────────
class EmailService {
  // Public helper for ad-hoc emails from controllers
  async send(options: { to: string; subject: string; html: string }) {
    if (DEV_MODE) {
      logger.info(`[EMAIL DEV] ─────────────────────────────────`);
      logger.info(`[EMAIL DEV] To:      ${options.to}`);
      logger.info(`[EMAIL DEV] Subject: ${options.subject}`);
      logger.info(`[EMAIL DEV] Set RESEND_API_KEY in environment to send real emails`);
      logger.info(`[EMAIL DEV] ─────────────────────────────────`);
      return;
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM,
          to:   [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend API error: ${err}`);
      }
      logger.info(`✉️  Email sent → ${options.to} | ${options.subject}`);
    } catch (err) {
      logger.error("Email error:", err);
      // Never throw — email failure must not break the request
    }
  }

  // ── 1. Email verification ────────────────────────────────────────────────
  async sendVerificationEmail(email: string, name: string, token: string) {
    const link = `${BASE}/auth/verify-email/${token}`;
    await this.send({
      to: email,
      subject: "Verify your DropOS email address",
      html: base({
        preheader: "One click to activate your account.",
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">✉️</div>
          <h1>Confirm your email</h1>
          <p>Hey ${name}, thanks for joining DropOS! Click the button below to verify your email and activate your account.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}" class="btn">Verify Email Address →</a>
          </div>
          <div class="alert alert-warning">⏱ This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</div>
          <p style="margin-top:20px;font-size:13px;color:#475569">Or copy and paste this URL into your browser:<br><span style="color:#c9a84c;font-size:12px;word-break:break-all">${link}</span></p>
        `,
      }),
    });
  }

  // ── 2. Welcome email (after email verified) ──────────────────────────────
  async sendWelcomeEmail(email: string, name: string) {
    await this.send({
      to: email,
      subject: `Welcome to DropOS, ${name}! Your store awaits 🚀`,
      html: base({
        preheader: "You're in. Let's build something amazing.",
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">🚀</div>
          <h1>You're officially in, ${name}!</h1>
          <p>Your DropOS account is active. You're now part of a growing community of entrepreneurs building their dropshipping businesses.</p>
          <div class="info-box">
            <div class="step">
              <div class="step-num">1</div>
              <div class="step-text"><strong>Create your store</strong> — pick a name, slug, and template. Live in 2 minutes.</div>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <div class="step-text"><strong>Add your products</strong> — import from CSV or add manually with images and variants.</div>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <div class="step-text"><strong>Start selling</strong> — share your store link. Accept payments from anywhere.</div>
            </div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard" class="btn">Go to Dashboard →</a>
          </div>
          <p style="font-size:13px;color:#475569;text-align:center">Questions? Reply to this email — we read everything.</p>
        `,
      }),
    });
  }

  // ── 3. Password reset ────────────────────────────────────────────────────
  async sendPasswordReset(email: string, name: string, token: string) {
    const link = `${BASE}/auth/reset-password/${token}`;
    await this.send({
      to: email,
      subject: "Reset your DropOS password",
      html: base({
        preheader: "Password reset requested for your account.",
        content: `
          <div class="icon-circle" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15)">🔐</div>
          <h1>Reset your password</h1>
          <p>Hi ${name}, we received a request to reset your DropOS password. Click below to choose a new one.</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}" class="btn">Reset Password →</a>
          </div>
          <div class="alert alert-danger">⏱ This link expires in <strong>1 hour</strong>. If you didn't request a reset, your account is safe — just ignore this email.</div>
          <p style="margin-top:20px;font-size:13px;color:#475569">If the button doesn't work, copy this URL:<br><span style="color:#c9a84c;font-size:12px;word-break:break-all">${link}</span></p>
        `,
      }),
    });
  }

  // ── 4. Order confirmation (to customer) ──────────────────────────────────
  async sendOrderConfirmation(params: {
    email: string; name: string; orderNumber: string;
    total: number; currency: string; items: Array<{ name: string; quantity: number; price: number }>;
    storeName: string; storeEmail?: string;
  }) {
    const sym = params.currency === "NGN" ? "₦" : params.currency === "GBP" ? "£" : "$";
    const fmt = (n: number) => `${sym}${n.toFixed(2)}`;
    const itemRows = params.items.map(i =>
      `<div class="info-row"><span class="info-label">${i.name} × ${i.quantity}</span><span class="info-value">${fmt(i.price * i.quantity)}</span></div>`
    ).join("");

    await this.send({
      to: params.email,
      subject: `Order confirmed — ${params.orderNumber}`,
      html: base({
        preheader: `Your order ${params.orderNumber} is confirmed!`,
        storeName: params.storeName,
        content: `
          <div class="icon-circle" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15)">🎉</div>
          <h1>Order confirmed!</h1>
          <p>Hi ${params.name}, your order has been received and is being processed. You'll get another email when it ships.</p>
          <div style="margin:20px 0">
            <span class="badge">${params.orderNumber}</span>
          </div>
          <div class="info-box">
            ${itemRows}
            <div class="total-row">
              <span class="total-label">Total paid</span>
              <span class="total-value">${fmt(params.total)}</span>
            </div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/store/${params.storeName.toLowerCase().replace(/\s+/g,"-")}/track?order=${params.orderNumber}" class="btn">Track Your Order →</a>
          </div>
          <p style="font-size:13px;color:#475569;text-align:center">Need help? Contact ${params.storeEmail || "the store directly"}.</p>
        `,
      }),
    });
  }

  // ── 5. Order status update (to customer) ─────────────────────────────────
  async sendOrderStatusUpdate(email: string, name: string, orderNumber: string, status: string, trackingNumber?: string) {
    const statusMap: Record<string, { icon: string; title: string; msg: string; badge: string; color: string }> = {
      PROCESSING: { icon: "⚙️", title: "Order Processing",   msg: "Great news! Your order is being prepared and will ship soon.",         badge: "badge-blue",  color: "#60a5fa" },
      SHIPPED:    { icon: "🚚", title: "Your Order Shipped",  msg: "Your order is on its way! Estimated delivery in 3–7 business days.",   badge: "badge",       color: "#c9a84c" },
      DELIVERED:  { icon: "📦", title: "Order Delivered",     msg: "Your order has been delivered. We hope you love your purchase!",       badge: "badge-green", color: "#10b981" },
      COMPLETED:  { icon: "✅", title: "Order Complete",      msg: "Your order is complete. Thank you for shopping with us!",              badge: "badge-green", color: "#10b981" },
      CANCELLED:  { icon: "❌", title: "Order Cancelled",     msg: "Your order has been cancelled. If this is a mistake, please contact us.", badge: "badge-red", color: "#ef4444" },
    };
    const s = statusMap[status] || { icon: "📋", title: `Order ${status}`, msg: `Your order status has been updated to ${status}.`, badge: "badge", color: "#c9a84c" };

    await this.send({
      to: email,
      subject: `${s.icon} ${s.title} — ${orderNumber}`,
      html: base({
        preheader: s.msg,
        content: `
          <div class="icon-circle" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-size:32px">${s.icon}</div>
          <h1>${s.title}</h1>
          <p>Hi ${name}, ${s.msg}</p>
          <div style="margin:16px 0"><span class="badge ${s.badge}">${orderNumber}</span></div>
          ${trackingNumber ? `
          <div class="info-box">
            <div class="info-row">
              <span class="info-label">Tracking number</span>
              <span class="info-value" style="color:#c9a84c">${trackingNumber}</span>
            </div>
          </div>` : ""}
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/track/${orderNumber}" class="btn">View Order Details →</a>
          </div>
        `,
      }),
    });
  }

  // ── 6. New order alert (to store owner) ──────────────────────────────────
  async sendNewOrderAlert(params: {
    ownerEmail: string; ownerName: string; orderNumber: string;
    customerName: string; total: number; currency: string; storeName: string;
    itemCount: number;
  }) {
    const sym = params.currency === "NGN" ? "₦" : params.currency === "GBP" ? "£" : "$";
    await this.send({
      to: params.ownerEmail,
      subject: `💰 New order ${params.orderNumber} — ${sym}${params.total.toFixed(2)}`,
      html: base({
        preheader: `You just got a new order from ${params.customerName}!`,
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">💰</div>
          <h1>New order received!</h1>
          <p>Hi ${params.ownerName}, you just received a new order on <strong>${params.storeName}</strong>.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Order number</span><span class="info-value">${params.orderNumber}</span></div>
            <div class="info-row"><span class="info-label">Customer</span><span class="info-value">${params.customerName}</span></div>
            <div class="info-row"><span class="info-label">Items</span><span class="info-value">${params.itemCount} item${params.itemCount > 1 ? "s" : ""}</span></div>
            <div class="total-row">
              <span class="total-label">Order total</span>
              <span class="total-value">${sym}${params.total.toFixed(2)}</span>
            </div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/orders" class="btn">View Order →</a>
          </div>
        `,
      }),
    });
  }

  // ── 7. Subscription started ───────────────────────────────────────────────
  async sendSubscriptionStarted(email: string, name: string, plan: string, nextBilling: string) {
    await this.send({
      to: email,
      subject: `Welcome to DropOS ${plan} 🎉`,
      html: base({
        preheader: `Your ${plan} plan is now active.`,
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">👑</div>
          <h1>You're on ${plan}!</h1>
          <p>Hi ${name}, your subscription is active. All ${plan} features are now unlocked.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Plan</span><span class="info-value" style="color:#c9a84c;font-weight:800">${plan}</span></div>
            <div class="info-row"><span class="info-label">Next billing date</span><span class="info-value">${nextBilling}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge-green" style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700">Active</span></span></div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard" class="btn">Go to Dashboard →</a>
          </div>
        `,
      }),
    });
  }

  // ── 8. Subscription expiring ──────────────────────────────────────────────
  async sendSubscriptionExpiry(email: string, name: string, plan: string, expiryDate: string) {
    await this.send({
      to: email,
      subject: `⚠️ Your DropOS ${plan} plan expires soon`,
      html: base({
        preheader: `Renew now to keep your stores running.`,
        content: `
          <div class="icon-circle" style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15)">⚠️</div>
          <h1>Your plan is expiring</h1>
          <p>Hi ${name}, your <strong>${plan}</strong> subscription expires on <strong>${expiryDate}</strong>. Renew now to avoid any disruption to your stores.</p>
          <div class="alert alert-warning">If your subscription expires, your stores will be paused and customers won't be able to place orders.</div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/billing" class="btn">Renew Subscription →</a>
          </div>
          <p style="text-align:center;font-size:13px;color:#475569">Questions about renewal? <a href="${BASE}/contact" style="color:#c9a84c">Contact us</a>.</p>
        `,
      }),
    });
  }

  // ── 9. Subscription cancelled ─────────────────────────────────────────────
  async sendSubscriptionCancelled(email: string, name: string, plan: string, accessUntil: string) {
    await this.send({
      to: email,
      subject: `Your DropOS ${plan} subscription has been cancelled`,
      html: base({
        preheader: "We're sorry to see you go.",
        content: `
          <div class="icon-circle" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15)">💔</div>
          <h1>Subscription cancelled</h1>
          <p>Hi ${name}, your ${plan} subscription has been cancelled. We're sorry to see you go.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Plan cancelled</span><span class="info-value">${plan}</span></div>
            <div class="info-row"><span class="info-label">Access until</span><span class="info-value">${accessUntil}</span></div>
          </div>
          <p>Your stores and data will remain accessible until <strong>${accessUntil}</strong>. After that, they'll be paused (not deleted).</p>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/billing" class="btn" style="background:linear-gradient(135deg,#475569,#64748b)">Reactivate Plan →</a>
          </div>
          <p style="text-align:center;font-size:13px;color:#475569">Changed your mind? You can reactivate anytime from your billing page.</p>
        `,
      }),
    });
  }

  // ── 10. Low stock alert (to store owner) ──────────────────────────────────
  async sendLowStockAlert(email: string, name: string, products: Array<{ name: string; sku: string; inventory: number }>, storeName: string) {
    const rows = products.map(p =>
      `<div class="info-row">
        <span class="info-label">${p.name}${p.sku ? ` <span style="color:#334155;font-size:11px">(${p.sku})</span>` : ""}</span>
        <span class="info-value" style="color:${p.inventory === 0 ? "#ef4444" : "#fbbf24"}">${p.inventory === 0 ? "Out of stock" : `${p.inventory} left`}</span>
      </div>`
    ).join("");

    await this.send({
      to: email,
      subject: `⚠️ Low stock alert — ${products.length} product${products.length > 1 ? "s" : ""} need restocking`,
      html: base({
        preheader: `${products.length} products are running low on stock.`,
        content: `
          <div class="icon-circle" style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15)">📦</div>
          <h1>Low stock alert</h1>
          <p>Hi ${name}, the following products in <strong>${storeName}</strong> are running low or out of stock.</p>
          <div class="info-box">${rows}</div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/inventory" class="btn">Manage Inventory →</a>
          </div>
        `,
      }),
    });
  }

  // ── 11. New review notification (to store owner) ───────────────────────────
  async sendNewReviewAlert(email: string, ownerName: string, productName: string, reviewerName: string, rating: number, storeName: string) {
    const stars = "⭐".repeat(rating);
    await this.send({
      to: email,
      subject: `New ${rating}-star review on ${productName}`,
      html: base({
        preheader: `${reviewerName} left a review on your store.`,
        content: `
          <div class="icon-circle" style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.15)">⭐</div>
          <h1>New product review</h1>
          <p>Hi ${ownerName}, <strong>${reviewerName}</strong> left a ${rating}-star review on <strong>${productName}</strong> in your ${storeName} store.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Product</span><span class="info-value">${productName}</span></div>
            <div class="info-row"><span class="info-label">Reviewer</span><span class="info-value">${reviewerName}</span></div>
            <div class="info-row"><span class="info-label">Rating</span><span class="info-value">${stars} (${rating}/5)</span></div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/reviews" class="btn">View & Approve Review →</a>
          </div>
        `,
      }),
    });
  }

  // ── 12. Test email ────────────────────────────────────────────────────────
  async sendTestEmail(email: string, name: string) {
    await this.send({
      to: email,
      subject: "DropOS email test — it's working! ✅",
      html: base({
        preheader: "Your email configuration is working correctly.",
        content: `
          <div class="icon-circle" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15)">✅</div>
          <h1>Email is working!</h1>
          <p>Hi ${name}, this is a test email from DropOS. If you're reading this, your SMTP configuration is set up correctly.</p>
          <div class="alert alert-success">Your email system is fully operational. All automated emails will be sent to your customers.</div>
          <div class="info-box">
            <div class="info-row"><span class="info-label">SMTP Host</span><span class="info-value">${process.env.SMTP_HOST || "smtp.gmail.com"}</span></div>
            <div class="info-row"><span class="info-label">Sent to</span><span class="info-value">${email}</span></div>
            <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#10b981">✓ Delivered</span></div>
          </div>
        `,
      }),
    });
  }

  // ── 13. Payment failed ────────────────────────────────────────────────────
  async sendPaymentFailed(email: string, name: string, orderNumber: string, amount: string, storeName: string) {
    await this.send({
      to: email,
      subject: `Payment failed for order ${orderNumber}`,
      html: base({
        preheader: "Your payment could not be processed.",
        storeName,
        content: `
          <div class="icon-circle" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15)">❌</div>
          <h1>Payment failed</h1>
          <p>Hi ${name}, unfortunately your payment of <strong>${amount}</strong> for order <strong>${orderNumber}</strong> could not be processed.</p>
          <div class="alert alert-danger">Common causes: insufficient funds, expired card, or bank declined. Please try a different payment method.</div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/store/${storeName.toLowerCase().replace(/\s+/g,"-")}/checkout" class="btn">Try Again →</a>
          </div>
          <p style="font-size:13px;color:#475569;text-align:center">Need help? Contact the store or reply to this email.</p>
        `,
      }),
    });
  }

  // ── 14. Refund processed ──────────────────────────────────────────────────
  async sendRefundProcessed(email: string, name: string, orderNumber: string, amount: string, storeName: string) {
    await this.send({
      to: email,
      subject: `Refund processed — ${orderNumber}`,
      html: base({
        preheader: `Your refund of ${amount} is on its way.`,
        storeName,
        content: `
          <div class="icon-circle" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.15)">💸</div>
          <h1>Refund processed</h1>
          <p>Hi ${name}, your refund of <strong>${amount}</strong> for order <strong>${orderNumber}</strong> has been processed.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Order</span><span class="info-value">${orderNumber}</span></div>
            <div class="info-row"><span class="info-label">Refund amount</span><span class="info-value" style="color:#10b981;font-weight:800">${amount}</span></div>
            <div class="info-row"><span class="info-label">Timeline</span><span class="info-value">3–5 business days</span></div>
          </div>
          <div class="alert alert-success">Refunds typically appear in your account within 3–5 business days depending on your bank.</div>
        `,
      }),
    });
  }

  // ── 15. Weekly digest (to store owner) ────────────────────────────────────
  async sendWeeklyDigest(email: string, name: string, stats: {
    storeName: string; revenue: number; orders: number; newCustomers: number;
    topProduct: string; currency: string;
  }) {
    const sym = stats.currency === "NGN" ? "₦" : "$";
    await this.send({
      to: email,
      subject: `📊 Your weekly digest — ${stats.storeName}`,
      html: base({
        preheader: `${sym}${stats.revenue.toLocaleString()} revenue this week on ${stats.storeName}`,
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">📊</div>
          <h1>Your week in review</h1>
          <p>Hi ${name}, here's how <strong>${stats.storeName}</strong> performed this week.</p>
          <div class="info-box">
            <div class="info-row"><span class="info-label">Total revenue</span><span class="info-value" style="color:#c9a84c;font-size:18px;font-weight:900">${sym}${stats.revenue.toLocaleString()}</span></div>
            <div class="info-row"><span class="info-label">Orders received</span><span class="info-value">${stats.orders}</span></div>
            <div class="info-row"><span class="info-label">New customers</span><span class="info-value">${stats.newCustomers}</span></div>
            <div class="info-row"><span class="info-label">Top product</span><span class="info-value">${stats.topProduct || "—"}</span></div>
          </div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/analytics" class="btn">View Full Analytics →</a>
          </div>
        `,
      }),
    });
  }

  // ── 16. Referral/invite joined ────────────────────────────────────────────
  async sendReferralJoined(email: string, name: string, referredName: string, reward: string) {
    await this.send({
      to: email,
      subject: `🎉 ${referredName} joined DropOS using your link!`,
      html: base({
        preheader: `You earned ${reward} for referring ${referredName}`,
        content: `
          <div class="icon-circle" style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.15)">🎉</div>
          <h1>Your referral joined!</h1>
          <p>Hi ${name}, <strong>${referredName}</strong> just signed up using your referral link. You've earned <strong style="color:#c9a84c">${reward}</strong>!</p>
          <div class="alert alert-success">Keep sharing your referral link to earn more rewards. There's no limit.</div>
          <div style="text-align:center;margin:28px 0">
            <a href="${BASE}/dashboard/billing" class="btn">View Your Rewards →</a>
          </div>
        `,
      }),
    });
  }
  // ── 17. Abandoned Cart Recovery ───────────────────────────────────────────
  async sendAbandonedCart(params: {
    email:       string;
    name:        string;
    storeName:   string;
    storeSlug:   string;
    items:       Array<{ name: string; price: number; quantity: number; image?: string }>;
    total:       number;
    currency:    string;
    recoveryUrl: string;
    brandColor:  string;
  }) {
    const { email, name, storeName, items, total, currency, recoveryUrl, brandColor } = params;
    const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${item.image ? `<td width="60" style="padding-right:14px;vertical-align:top;">
                <img src="${item.image}" width="60" height="60" style="border-radius:10px;object-fit:cover;display:block;" />
              </td>` : ''}
              <td style="vertical-align:top;">
                <div style="color:#ffffff;font-weight:700;font-size:14px;margin-bottom:4px;">${item.name}</div>
                <div style="color:rgba(255,255,255,0.45);font-size:12px;">Qty: ${item.quantity}</div>
              </td>
              <td style="vertical-align:top;text-align:right;">
                <div style="color:${brandColor};font-weight:800;font-size:15px;">${sym}${(item.price * item.quantity).toFixed(2)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('');

    await this.send({
      to:      email,
      subject: `${name}, you left something behind at ${storeName} 🛒`,
      html: this.baseTemplate(`
        <!-- Header -->
        <div style="text-align:center;padding:32px 0 24px;">
          <div style="display:inline-block;width:56px;height:56px;background:${brandColor}18;border-radius:16px;line-height:56px;font-size:26px;margin-bottom:16px;">🛒</div>
          <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
            Don't forget your cart!
          </h1>
          <p style="margin:0;color:rgba(255,255,255,0.45);font-size:15px;">
            Hey ${name}, you left some great items behind at <strong style="color:rgba(255,255,255,0.7);">${storeName}</strong>.
          </p>
        </div>

        <!-- Items -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px 24px;margin:0 0 24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${itemRows}
            <tr>
              <td style="padding-top:16px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="color:rgba(255,255,255,0.5);font-size:13px;">Cart total</td>
                    <td style="text-align:right;">
                      <span style="color:${brandColor};font-size:22px;font-weight:900;">${sym}${total.toFixed(2)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align:center;margin:0 0 28px;">
          <a href="${recoveryUrl}"
            style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,${brandColor},#f0c040);color:#000000;font-weight:900;font-size:16px;text-decoration:none;border-radius:14px;letter-spacing:0.3px;">
            Complete My Order →
          </a>
          <p style="margin:16px 0 0;color:rgba(255,255,255,0.3);font-size:12px;">
            Items in your cart are not reserved and may sell out
          </p>
        </div>

        <!-- Trust badges -->
        <div style="display:flex;gap:0;text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              ${[
                { icon: "🔒", label: "Secure Checkout" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "↩️", label: "Easy Returns" },
              ].map(b => `
                <td width="33%" style="text-align:center;padding:16px 8px;background:rgba(255,255,255,0.02);border-radius:12px;">
                  <div style="font-size:20px;margin-bottom:6px;">${b.icon}</div>
                  <div style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:600;">${b.label}</div>
                </td>
              `).join('<td width="8px"></td>')}
            </tr>
          </table>
        </div>

        <!-- Dismiss note -->
        <div style="text-align:center;margin-top:24px;">
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">
            Not interested? No worries — we'll only remind you once more.
          </p>
        </div>
      `),
    });
  }

  /** Public raw send — for fulfillment emails, etc. */
  async sendRaw(options: { to: string; subject: string; html: string }) {
    await this.send(options);
  }

}

export const emailService = new EmailService();