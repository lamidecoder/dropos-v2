// src/routes/push.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { pushToUser, PushTemplates } from "../services/push.service";
import { AppError } from "../utils/AppError";

const router = Router();

// ── GET /api/push/vapid-public-key — returns public VAPID key to client ─────
router.get("/vapid-public-key", (req: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) return res.json({ success: false, data: { key: null } });
  res.json({ success: true, data: { key } });
});

// ── POST /api/push/subscribe — save a new push subscription ─────────────────
router.post("/subscribe", authenticate, async (req: Request, res: Response) => {
  const { endpoint, keys, deviceName } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth)
    throw new AppError("endpoint, keys.p256dh, and keys.auth required", 400);

  // Validate endpoint is a real HTTPS push service URL (SSRF prevention)
  let endpointUrl: URL;
  try { endpointUrl = new URL(endpoint); } catch { throw new AppError("Invalid endpoint URL", 400); }
  if (endpointUrl.protocol !== "https:") throw new AppError("Endpoint must use HTTPS", 400);
  const ALLOWED_PUSH_HOSTS = [
    "fcm.googleapis.com", "updates.push.services.mozilla.com",
    "notify.windows.com", "push.apple.com", "web.push.apple.com",
  ];
  if (!ALLOWED_PUSH_HOSTS.some(h => endpointUrl.hostname.endsWith(h)))
    throw new AppError("Endpoint host not allowed", 400);

  // Sanitize deviceName
  const safeName = deviceName ? String(deviceName).slice(0, 100) : undefined;

  const userId = (req as any).user.userId;

  // Upsert — if endpoint already registered, just reactivate
  await prisma.pushSubscription.upsert({
    where:  { endpoint },
    create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, deviceName: safeName, isActive: true },
    update: { userId, p256dh: keys.p256dh, auth: keys.auth, deviceName: safeName, isActive: true },
  });

  res.json({ success: true, data: { message: "Subscribed successfully" } });
});

// ── DELETE /api/push/unsubscribe — remove subscription ──────────────────────
router.delete("/unsubscribe", authenticate, async (req: Request, res: Response) => {
  const { endpoint } = req.body;
  if (!endpoint) throw new AppError("endpoint required", 400);

  await prisma.pushSubscription.updateMany({
    where: { endpoint, userId: (req as any).user.userId },
    data:  { isActive: false },
  });

  res.json({ success: true });
});

// ── GET /api/push/subscriptions — list user's devices ───────────────────────
router.get("/subscriptions", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const subs = await prisma.pushSubscription.findMany({
    where:   { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    select:  { id: true, deviceName: true, createdAt: true, endpoint: true },
  });
  res.json({ success: true, data: subs });
});

// ── POST /api/push/test — send test notification to self ─────────────────────
router.post("/test", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const sent = await pushToUser(userId, {
    title: "🎉 DropOS Push Notifications",
    body:  "Push notifications are working perfectly!",
    tag:   "test",
    url:   "/dashboard/notifications",
  });
  if (sent === 0) throw new AppError("No active subscriptions or VAPID not configured", 400);
  res.json({ success: true, data: { sent } });
});

// ── POST /api/push/send/:storeId — manual push from dashboard ───────────────
router.post("/send/:storeId", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  const { title, body, url } = req.body;
  if (!title || !body) throw new AppError("title and body required", 400);
  if (typeof title !== "string" || title.length > 100) throw new AppError("title must be string under 100 chars", 400);
  if (typeof body  !== "string" || body.length  > 500) throw new AppError("body must be string under 500 chars", 400);
  // Validate URL if provided
  if (url) { try { new URL(url); } catch { throw new AppError("Invalid url", 400); } }

  const sent = await pushToUser(userId, { title, body, url, icon: "/icons/icon-192.png" });
  res.json({ success: true, data: { sent } });
});

export default router;
