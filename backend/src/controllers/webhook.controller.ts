// src/controllers/webhook.controller.ts
import { Response } from "express";
import nodeFetch from "node-fetch";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import crypto from "crypto";

const VALID_EVENTS = [
  "order.created","order.paid","order.shipped","order.completed","order.cancelled","order.refunded",
  "product.created","product.updated","product.deleted",
  "customer.created","review.submitted",
];

const createSchema = z.object({
  url:    z.string().url(),
  events: z.array(z.enum(VALID_EVENTS as [string,...string[]])).min(1),
});

// POST /webhooks/:storeId
export const createWebhook = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const data = createSchema.parse(req.body);
  const secret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

  const count = await prisma.storeWebhook.count({ where: { storeId, isActive: true } });
  if (count >= 5) throw new AppError("Maximum 5 webhooks per store", 400);

  const webhook = await prisma.storeWebhook.create({
    data: { storeId, url: data.url, events: data.events, secret },
    select: { id: true, url: true, events: true, isActive: true, createdAt: true, secret: true },
  });

  res.status(201).json({ success: true, data: { ...webhook, warning: "Store your signing secret securely — used to verify webhook authenticity." } });
};

// GET /webhooks/:storeId
export const getWebhooks = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const webhooks = await prisma.storeWebhook.findMany({
    where: { storeId },
    select: { id: true, url: true, events: true, isActive: true, lastFiredAt: true, failCount: true, createdAt: true },
    include: { deliveries: { take: 5, orderBy: { createdAt: "desc" }, select: { event: true, success: true, statusCode: true, createdAt: true } } },
  });

  res.json({ success: true, data: webhooks });
};

// DELETE /webhooks/:storeId/:webhookId
export const deleteWebhook = async (req: AuthRequest, res: Response) => {
  const { storeId, webhookId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  await prisma.storeWebhook.deleteMany({ where: { id: webhookId, storeId } });
  res.json({ success: true });
};

// PATCH /webhooks/:storeId/:webhookId
export const updateWebhook = async (req: AuthRequest, res: Response) => {
  const { storeId, webhookId } = req.params;
  await verifyOwner(storeId, req.user!.userId);
  const { events, isActive } = req.body;

  const updated = await prisma.storeWebhook.update({
    where: { id: webhookId }, data: { events, isActive },
    select: { id: true, url: true, events: true, isActive: true },
  });

  res.json({ success: true, data: updated });
};

// POST /webhooks/:storeId/:webhookId/test
export const testWebhook = async (req: AuthRequest, res: Response) => {
  const { storeId, webhookId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const webhook = await prisma.storeWebhook.findFirst({ where: { id: webhookId, storeId } });
  if (!webhook) throw new AppError("Webhook not found", 404);

  const payload = { event: "test", storeId, timestamp: new Date().toISOString(), data: { message: "Test delivery from DropOS" } };
  const body = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");

  try {
    const response = await nodeFetch(webhook.url, {
      method: "POST", body,
      headers: { "Content-Type": "application/json", "X-DropOS-Signature": `sha256=${sig}`, "X-DropOS-Event": "test" },
      timeout: 10000,
    } as any);

    await prisma.storeWebhook.update({ where: { id: webhookId }, data: { lastFiredAt: new Date() } });
    await prisma.webhookDelivery.create({ data: { webhookId, event: "test", payload, statusCode: response.status, success: response.ok } });

    res.json({ success: true, data: { statusCode: response.status, ok: response.ok } });
  } catch (err: any) {
    await prisma.webhookDelivery.create({ data: { webhookId, event: "test", payload, success: false, response: err.message } });
    res.json({ success: false, message: `Delivery failed: ${err.message}` });
  }
};

// Internal: fire webhook for an event
export async function fireWebhook(storeId: string, event: string, data: any) {
  const webhooks = await prisma.storeWebhook.findMany({ where: { storeId, events: { has: event }, isActive: true } });

  for (const wh of webhooks) {
    const payload = { event, storeId, timestamp: new Date().toISOString(), data };
    const body = JSON.stringify(payload);
    const sig = crypto.createHmac("sha256", wh.secret).update(body).digest("hex");

    try {
      const res = await nodeFetch(wh.url, {
        method: "POST", body,
        headers: { "Content-Type": "application/json", "X-DropOS-Signature": `sha256=${sig}`, "X-DropOS-Event": event },
        timeout: 15000,
      });

      await prisma.storeWebhook.update({ where: { id: wh.id }, data: { lastFiredAt: new Date(), failCount: res.ok ? 0 : { increment: 1 } } });
      await prisma.webhookDelivery.create({ data: { webhookId: wh.id, event, payload, statusCode: (res as any).status as number, success: !!(res as any).ok } });
    } catch (err: any) {
      await prisma.storeWebhook.update({ where: { id: wh.id }, data: { failCount: { increment: 1 } } });
      await prisma.webhookDelivery.create({ data: { webhookId: wh.id, event, payload, success: false, response: err.message } });
    }
  }
}

async function verifyOwner(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: userId } });
  if (!store) throw new AppError("Unauthorized", 403);
}
