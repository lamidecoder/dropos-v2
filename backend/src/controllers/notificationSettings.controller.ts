// src/controllers/notification.settings.controller.ts
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { notificationService } from "../services/notification.service";
import { requireStoreOwner } from "./store.controller";

const settingsSchema = z.object({
  smsEnabled:        z.boolean().optional(),
  smsPhone:          z.string().optional().nullable(),
  whatsappEnabled:   z.boolean().optional(),
  whatsappPhone:     z.string().optional().nullable(),
  notifyOwnerSms:    z.boolean().optional(),
  notifyCustomerSms: z.boolean().optional(),
});

// ── GET /api/notifications/settings/:storeId ──────────────────────────────────
export const getNotificationSettings = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const store = await prisma.store.findUnique({
    where:  { id: storeId },
    select: {
      smsEnabled: true, smsPhone: true,
      whatsappEnabled: true, whatsappPhone: true,
      notifyOwnerSms: true, notifyCustomerSms: true,
    },
  });
  if (!store) throw new AppError("Store not found", 404);

  // Mask phone numbers in response (show only last 4 digits)
  const masked = (phone: string | null) => phone ? `****${phone.slice(-4)}` : null;

  return res.json({
    success: true,
    data: {
      ...store,
      smsPhoneMasked:       masked(store.smsPhone),
      whatsappPhoneMasked:  masked(store.whatsappPhone),
      twilioConfigured:     !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== "placeholder"),
    },
  });
};

// ── PUT /api/notifications/settings/:storeId ──────────────────────────────────
export const updateNotificationSettings = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const data = settingsSchema.parse(req.body);

  // Validate phone formats if provided (E.164 format: +<country><number>)
  const e164 = /^\+[1-9]\d{7,14}$/;
  if (data.smsPhone && !e164.test(data.smsPhone)) {
    throw new AppError("SMS phone must be in E.164 format (e.g. +2348012345678)", 400);
  }
  if (data.whatsappPhone && !e164.test(data.whatsappPhone)) {
    throw new AppError("WhatsApp phone must be in E.164 format (e.g. +2348012345678)", 400);
  }

  const updated = await prisma.store.update({
    where:  { id: storeId },
    data,
    select: {
      smsEnabled: true, smsPhone: true,
      whatsappEnabled: true, whatsappPhone: true,
      notifyOwnerSms: true, notifyCustomerSms: true,
    },
  });

  return res.json({ success: true, message: "Notification settings saved", data: updated });
};

// ── POST /api/notifications/test/:storeId ─────────────────────────────────────
export const sendTestNotification = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { channel, phone } = z.object({
    channel: z.enum(["sms", "whatsapp"]),
    phone:   z.string().regex(/^\+[1-9]\d{7,14}$/, "Must be E.164 format"),
  }).parse(req.body);

  const user = await prisma.user.findUnique({
    where:  { id: req.user!.userId },
    select: { name: true },
  });

  await notificationService.sendTest({
    phone,
    channel,
    name: user?.name || "there",
  });

  return res.json({ success: true, message: `Test ${channel} sent to ${phone}` });
};

// ── GET /api/notifications/logs/:storeId ──────────────────────────────────────
// Returns recent order events so dashboard can show notification history
export const getNotificationLogs = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  // Use recent orders as a proxy for notification activity
  const orders = await prisma.order.findMany({
    where:   { storeId },
    orderBy: { createdAt: "desc" },
    take:    20,
    select:  {
      id: true, orderNumber: true, customerName: true, customerPhone: true,
      customerEmail: true, status: true, total: true, currency: true, createdAt: true,
    },
  });

  const store = await prisma.store.findUnique({
    where:  { id: storeId },
    select: { smsEnabled: true, notifyCustomerSms: true, whatsappEnabled: true, notifyOwnerSms: true },
  });

  return res.json({
    success: true,
    data: orders.map(o => ({
      ...o,
      smsCustomerSent: !!(store?.notifyCustomerSms && o.customerPhone),
      smsOwnerSent:    !!(store?.smsEnabled && store?.notifyOwnerSms),
      waOwnerSent:     !!(store?.whatsappEnabled && store?.notifyOwnerSms),
    })),
  });
};
