// src/services/push.service.ts
import webpush from "web-push";
import { prisma } from "../config/database";

// VAPID keys — set these in .env
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL   = process.env.VAPID_EMAIL       || "mailto:push@dropos.io";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ── Payload shapes ────────────────────────────────────────────────────────────
export interface PushPayload {
  title:   string;
  body:    string;
  icon?:   string;
  badge?:  string;
  url?:    string;
  tag?:    string;
  image?:  string;
  actions?: { action: string; title: string }[];
}

// ── Send to one subscription ──────────────────────────────────────────────────
async function sendToSubscription(sub: any, payload: PushPayload): Promise<boolean> {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24 }  // 24h TTL
    );
    return true;
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired — remove it
      await prisma.pushSubscription.updateMany({
        where: { endpoint: sub.endpoint },
        data:  { isActive: false },
      });
    }
    return false;
  }
}

// ── Send to all subscriptions for a user ─────────────────────────────────────
export async function pushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return 0;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId, isActive: true },
  });

  const results = await Promise.allSettled(
    subs.map(s => sendToSubscription(s, payload))
  );
  return results.filter(r => r.status === "fulfilled" && r.value).length;
}

// ── Send to all store owner subs ──────────────────────────────────────────────
export async function pushToStoreOwner(storeId: string, payload: PushPayload): Promise<number> {
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { userId: true } });
  if (!store) return 0;
  return pushToUser(store.userId, payload);
}

// ── Pre-built notification templates ────────────────────────────────────────
export const PushTemplates = {
  newOrder: (orderRef: string, amount: string) => ({
    title:   "💰 New Order!",
    body:    `Order ${orderRef} — ${amount}`,
    tag:     "new-order",
    url:     "/dashboard/orders",
    icon:    "/icons/icon-192.png",
  }),

  lowStock: (productName: string, qty: number) => ({
    title:   "⚠️ Low Stock Alert",
    body:    `${productName} has only ${qty} units left`,
    tag:     "low-stock",
    url:     "/dashboard/inventory",
    icon:    "/icons/icon-192.png",
  }),

  abandonedCart: (count: number) => ({
    title:   "🛒 Abandoned Carts",
    body:    `${count} cart${count > 1 ? "s" : ""} abandoned in the last 24h — recover them now`,
    tag:     "abandoned-carts",
    url:     "/dashboard/abandoned-carts",
    icon:    "/icons/icon-192.png",
  }),

  reviewReceived: (productName: string, rating: number) => ({
    title:   `⭐ New ${rating}-star Review`,
    body:    `Someone left a review on "${productName}"`,
    tag:     "review",
    url:     "/dashboard/reviews",
    icon:    "/icons/icon-192.png",
  }),

  payoutReady: (amount: string) => ({
    title:   "💸 Payout Ready",
    body:    `${amount} commission payout is ready to be claimed`,
    tag:     "payout",
    url:     "/dashboard/billing",
    icon:    "/icons/icon-192.png",
  }),

  flashSaleLive: (saleName: string) => ({
    title:   "🔥 Flash Sale Live",
    body:    `Your "${saleName}" flash sale has started — share it now!`,
    tag:     "flash-sale",
    url:     "/dashboard/discounts",
    icon:    "/icons/icon-192.png",
  }),

  dailySummary: (revenue: string, orders: number) => ({
    title:   "📊 Today's Summary",
    body:    `${orders} orders · ${revenue} revenue`,
    tag:     "daily-summary",
    url:     "/dashboard/analytics",
    icon:    "/icons/icon-192.png",
  }),
};
