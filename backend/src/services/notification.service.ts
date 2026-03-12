// src/services/notification.service.ts
/**
 * NotificationService
 * ────────────────────
 * Wraps Twilio to send SMS and WhatsApp messages.
 * All methods are fire-and-forget (non-blocking) — a Twilio failure
 * never breaks an order flow.
 *
 * DEV MODE: when TWILIO_ACCOUNT_SID is absent or "placeholder",
 * messages are logged to console instead of sent.
 *
 * WhatsApp: uses the Twilio Sandbox by default.
 * Production: replace TWILIO_WHATSAPP_FROM with an approved WA Business number.
 */

import { logger } from "../utils/logger";

// ── Twilio lazy-load so the service boots even without the package installed ──
let twilioClient: any = null;

function getTwilio() {
  if (twilioClient) return twilioClient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = require("twilio");
    const sid  = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    if (sid && auth && sid !== "placeholder" && auth !== "placeholder") {
      twilioClient = twilio(sid, auth);
      return twilioClient;
    }
  } catch { /* twilio not installed yet */ }
  return null;
}

const DEV_MODE = () =>
  !process.env.TWILIO_ACCOUNT_SID ||
  process.env.TWILIO_ACCOUNT_SID === "placeholder";

const SMS_FROM       = () => process.env.TWILIO_PHONE_NUMBER       || "placeholder";
const WA_FROM        = () => process.env.TWILIO_WHATSAPP_FROM      || "whatsapp:+14155238886"; // Twilio sandbox default
const STORE_URL      = () => process.env.FRONTEND_URL              || "http://localhost:3000";

// ── Currency formatter ────────────────────────────────────────────────────────
const fmt = (amount: number, currency = "USD") => {
  const sym: Record<string, string> = { USD: "$", GBP: "£", EUR: "€", NGN: "₦" };
  return `${sym[currency] || currency}${amount.toFixed(2)}`;
};

// ── Shared send helper ────────────────────────────────────────────────────────
async function sendMessage(opts: {
  to:       string;
  body:     string;
  channel:  "sms" | "whatsapp";
  context?: string;
}) {
  const { to, body, channel, context = "" } = opts;

  if (DEV_MODE()) {
    logger.info(`[${channel.toUpperCase()}${context ? " " + context : ""}] → ${to}\n${body}`);
    return;
  }

  const client = getTwilio();
  if (!client) {
    logger.warn("[Notification] Twilio client unavailable — message not sent");
    return;
  }

  try {
    const from = channel === "whatsapp" ? WA_FROM() : SMS_FROM();
    const toFormatted = channel === "whatsapp" ? `whatsapp:${to}` : to;

    await client.messages.create({ from, to: toFormatted, body });
    logger.info(`[${channel.toUpperCase()}] Sent to ${to} ✓`);
  } catch (err: any) {
    // Log but never throw — notifications must not break order flow
    logger.error(`[${channel.toUpperCase()}] Failed to send to ${to}: ${err.message}`);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  MESSAGE TEMPLATES
// ══════════════════════════════════════════════════════════════════════════════

export class NotificationService {

  // ── 1. New order alert → store owner ─────────────────────────────────────
  async notifyOwnerNewOrder(params: {
    ownerPhone:   string | null;
    ownerWA:      string | null;
    smsEnabled:   boolean;
    waEnabled:    boolean;
    storeName:    string;
    orderNumber:  string;
    customerName: string;
    total:        number;
    currency:     string;
    itemCount:    number;
    storeSlug:    string;
  }) {
    const { ownerPhone, ownerWA, smsEnabled, waEnabled, storeName, orderNumber, customerName, total, currency, itemCount, storeSlug } = params;

    const dashUrl = `${STORE_URL()}/dashboard/orders`;
    const smsBody = `🛍️ New order on ${storeName}!\n\n#${orderNumber}\nFrom: ${customerName}\n${itemCount} item${itemCount !== 1 ? "s" : ""} · ${fmt(total, currency)}\n\nView: ${dashUrl}`;

    const waBody  = `*🛍️ New Order — ${storeName}*\n\nOrder: *#${orderNumber}*\nCustomer: ${customerName}\nItems: ${itemCount} · Total: *${fmt(total, currency)}*\n\n👉 ${dashUrl}`;

    const sends: Promise<void>[] = [];
    if (smsEnabled && ownerPhone) sends.push(sendMessage({ to: ownerPhone, body: smsBody, channel: "sms",       context: "new-order-owner" }));
    if (waEnabled  && ownerWA)    sends.push(sendMessage({ to: ownerWA,    body: waBody,  channel: "whatsapp",  context: "new-order-owner" }));
    await Promise.allSettled(sends);
  }

  // ── 2. Order confirmation → customer ─────────────────────────────────────
  async notifyCustomerOrderConfirmed(params: {
    customerPhone: string | null | undefined;
    smsEnabled:    boolean;
    storeName:     string;
    orderNumber:   string;
    total:         number;
    currency:      string;
    storeSlug:     string;
  }) {
    const { customerPhone, smsEnabled, storeName, orderNumber, total, currency, storeSlug } = params;
    if (!smsEnabled || !customerPhone) return;

    const trackUrl = `${STORE_URL()}/store/${storeSlug}/track`;
    const body = `✅ Order confirmed!\n\n${storeName} · #${orderNumber}\nTotal: ${fmt(total, currency)}\n\nTrack your order: ${trackUrl}`;

    await sendMessage({ to: customerPhone, body, channel: "sms", context: "order-confirmed-customer" });
  }

  // ── 3. Order status update → customer ────────────────────────────────────
  async notifyCustomerStatusUpdate(params: {
    customerPhone:  string | null | undefined;
    smsEnabled:     boolean;
    storeName:      string;
    orderNumber:    string;
    status:         string;
    trackingNumber: string | null | undefined;
    storeSlug:      string;
  }) {
    const { customerPhone, smsEnabled, storeName, orderNumber, status, trackingNumber, storeSlug } = params;
    if (!smsEnabled || !customerPhone) return;

    const STATUS_EMOJI: Record<string, string> = {
      CONFIRMED:  "✅",
      PROCESSING: "⚙️",
      SHIPPED:    "🚚",
      DELIVERED:  "📦",
      CANCELLED:  "❌",
      REFUNDED:   "💰",
    };
    const emoji = STATUS_EMOJI[status] || "📋";
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    const trackUrl = `${STORE_URL()}/store/${storeSlug}/track`;

    let body = `${emoji} Your order is ${label}!\n\n${storeName} · #${orderNumber}`;
    if (trackingNumber) body += `\nTracking: ${trackingNumber}`;
    body += `\n\nTrack: ${trackUrl}`;

    await sendMessage({ to: customerPhone, body, channel: "sms", context: `status-${status}` });
  }

  // ── 4. Abandoned cart recovery nudge → customer ───────────────────────────
  async notifyCustomerAbandonedCart(params: {
    customerPhone: string | null;
    smsEnabled:    boolean;
    storeName:     string;
    total:         number;
    currency:      string;
    recoveryUrl:   string;
  }) {
    const { customerPhone, smsEnabled, storeName, total, currency, recoveryUrl } = params;
    if (!smsEnabled || !customerPhone) return;

    const body = `👋 You left ${fmt(total, currency)} in your cart at ${storeName}!\n\nComplete your order: ${recoveryUrl}`;
    await sendMessage({ to: customerPhone, body, channel: "sms", context: "abandoned-cart" });
  }

  // ── 5. Low stock alert → owner ────────────────────────────────────────────
  async notifyOwnerLowStock(params: {
    ownerPhone:   string | null;
    ownerWA:      string | null;
    smsEnabled:   boolean;
    waEnabled:    boolean;
    storeName:    string;
    products:     Array<{ name: string; inventory: number; sku?: string }>;
  }) {
    const { ownerPhone, ownerWA, smsEnabled, waEnabled, storeName, products } = params;
    if (!smsEnabled && !waEnabled) return;

    const list  = products.slice(0, 5).map(p => `• ${p.name}${p.sku ? ` (${p.sku})` : ""}: ${p.inventory} left`).join("\n");
    const more  = products.length > 5 ? `\n+${products.length - 5} more` : "";
    const body  = `⚠️ Low stock alert — ${storeName}\n\n${list}${more}\n\nRestock: ${STORE_URL()}/dashboard/products`;

    const sends: Promise<void>[] = [];
    if (smsEnabled && ownerPhone) sends.push(sendMessage({ to: ownerPhone, body, channel: "sms",      context: "low-stock" }));
    if (waEnabled  && ownerWA)    sends.push(sendMessage({ to: ownerWA,    body, channel: "whatsapp", context: "low-stock" }));
    await Promise.allSettled(sends);
  }

  // ── 6. Payment failed → owner ─────────────────────────────────────────────
  async notifyOwnerPaymentFailed(params: {
    ownerPhone:   string | null;
    smsEnabled:   boolean;
    storeName:    string;
    orderNumber:  string;
    amount:       string;
  }) {
    const { ownerPhone, smsEnabled, storeName, orderNumber, amount } = params;
    if (!smsEnabled || !ownerPhone) return;

    const body = `❌ Payment failed on ${storeName}\n\nOrder #${orderNumber} · ${amount}\n\nView: ${STORE_URL()}/dashboard/orders`;
    await sendMessage({ to: ownerPhone, body, channel: "sms", context: "payment-failed" });
  }

  // ── 7. Send test message ───────────────────────────────────────────────────
  async sendTest(params: {
    phone:   string;
    channel: "sms" | "whatsapp";
    name:    string;
  }) {
    const body = `👋 Hi ${params.name}! This is a test ${params.channel === "whatsapp" ? "WhatsApp" : "SMS"} message from DropOS.\n\nYour notifications are configured correctly! 🎉`;
    await sendMessage({ to: params.phone, body, channel: params.channel, context: "test" });
  }
}

export const notificationService = new NotificationService();
