// src/controllers/payment.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { calculateFee, detectGateway } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import {
  createStripePaymentIntent, constructStripeEvent,
  initializePaystack, verifyPaystack, verifyPaystackWebhook,
  initializeFlutterwave, verifyFlutterwave, verifyFlutterwaveWebhook,
} from "../services/payment.service";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

// ── Initialize Payment ────────────────────────────────────────────────────────
export const initializePayment = async (req: Request, res: Response) => {
  const schema = z.object({
    orderId:   z.string().uuid(),
    gateway:   z.enum(["STRIPE","PAYSTACK","FLUTTERWAVE"]).optional(),
    country:   z.string().optional(),
  });
  const { orderId, gateway: manualGateway, country } = schema.parse(req.body);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true },
  });
  if (!order) throw new AppError("Order not found", 404);
  if (order.payment) throw new AppError("Payment already initiated for this order", 400);

  // Auto-detect gateway
  const gateway = manualGateway || detectGateway(country);

  const feePercent = await getPlatformFee();
  const { platformFee, storeEarnings } = calculateFee(order.total, feePercent);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const storeSlug   = order.store?.slug || "";
  // Correct callback URL: points to the actual payment/callback page with real orderId
  const callbackUrl = `${frontendUrl}/store/${storeSlug}/payment/callback?orderId=${orderId}`;

  let initData: any = {};

  if (gateway === "STRIPE") {
    initData = await createStripePaymentIntent({
      amount:        order.total,
      currency:      order.currency,
      orderId:       order.id,
      storeId:       order.storeId,
      customerEmail: order.customerEmail,
    });
  } else if (gateway === "PAYSTACK") {
    initData = await initializePaystack({
      amount:      order.total,
      currency:    order.currency === "NGN" ? "NGN" : "NGN",
      email:       order.customerEmail,
      orderId:     order.id,
      storeId:     order.storeId,
      callbackUrl,
    });
  } else if (gateway === "FLUTTERWAVE") {
    initData = await initializeFlutterwave({
      amount:      order.total,
      currency:    order.currency,
      email:       order.customerEmail,
      name:        order.customerName,
      phone:       order.customerPhone || undefined,
      orderId:     order.id,
      storeId:     order.storeId,
      redirectUrl: callbackUrl,
    });
  }

  // Create pending payment record
  await prisma.payment.create({
    data: {
      orderId,
      storeId:           order.storeId,
      gateway:           gateway as any,
      amount:            order.total,
      currency:          order.currency,
      platformFee,
      platformFeePercent: feePercent,
      storeEarnings,
      status:            "PENDING",
      metadata:          initData,
    },
  });

  return res.json({
    success: true,
    data: { gateway, ...initData, amount: order.total, currency: order.currency },
  });
};

// ── Stripe Webhook ────────────────────────────────────────────────────────────
export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const event = constructStripeEvent(req.body as Buffer, sig);

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as any;
    const orderId = intent.metadata?.orderId;
    if (orderId) await completePayment(orderId, intent.id, "STRIPE");
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as any;
    const orderId = intent.metadata?.orderId;
    if (orderId) await failPayment(orderId, "STRIPE");
  }

  return res.json({ received: true });
};

// ── Paystack Webhook ──────────────────────────────────────────────────────────
export const paystackWebhook = async (req: Request, res: Response) => {
  const sig     = req.headers["x-paystack-signature"] as string;
  const payload = (req.body as Buffer).toString();

  if (!verifyPaystackWebhook(payload, sig)) {
    throw new AppError("Invalid webhook signature", 400);
  }

  let event: any;
  try { event = JSON.parse(payload); } catch { return res.json({ received: true }); }

  if (event.event === "charge.success") {
    const orderId = event.data?.metadata?.orderId;
    if (orderId) await completePayment(orderId, event.data.reference, "PAYSTACK");
  }

  return res.json({ received: true });
};

// ── Flutterwave Webhook ───────────────────────────────────────────────────────
export const flutterwaveWebhook = async (req: Request, res: Response) => {
  const sig     = req.headers["verif-hash"] as string;
  const payload = (req.body as Buffer).toString();

  if (sig !== process.env.FLUTTERWAVE_SECRET_KEY) {
    throw new AppError("Invalid webhook signature", 400);
  }

  let event: any;
  try { event = JSON.parse(payload); } catch { return res.json({ received: true }); }

  if (event.status === "successful") {
    const orderId = event.meta?.orderId;
    if (orderId) await completePayment(orderId, String(event.id), "FLUTTERWAVE");
  }

  return res.json({ received: true });
};

// ── Verify Payment (after redirect) ──────────────────────────────────────────
export const verifyPayment = async (req: Request, res: Response) => {
  const { orderId, reference, transaction_id } = req.query;
  if (!orderId) throw new AppError("orderId required", 400);

  const payment = await prisma.payment.findUnique({ where: { orderId: orderId as string } });
  if (!payment) throw new AppError("Payment not found", 404);

  if (payment.status === "SUCCESS") {
    return res.json({ success: true, data: { status: "SUCCESS", payment } });
  }

  // Verify with gateway
  if (payment.gateway === "PAYSTACK" && reference) {
    const result = await verifyPaystack(reference as string);
    if (result.status === "success") {
      await completePayment(orderId as string, result.reference, "PAYSTACK");
    }
  }

  if (payment.gateway === "FLUTTERWAVE" && transaction_id) {
    const result = await verifyFlutterwave(transaction_id as string);
    if (result.status === "successful") {
      await completePayment(orderId as string, String(result.id), "FLUTTERWAVE");
    }
  }

  const updated = await prisma.payment.findUnique({ where: { orderId: orderId as string } });

  // Return order data alongside payment so the callback page can render the success screen
  const orderData = await prisma.order.findUnique({
    where:   { id: orderId as string },
    include: { items: true, store: { select: { name: true, slug: true, primaryColor: true } } },
  });

  return res.json({ success: true, data: { ...updated, order: orderData } });
};

// ── Admin: Get All Payments ───────────────────────────────────────────────────
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, gateway } = req.query;
  const take = Math.min(Number(limit), 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const where: any = {};
  if (status)  where.status  = status;
  if (gateway) where.gateway = gateway;

  const [payments, total] = await Promise.all([
    await prisma.payment.findMany({
      where, take, skip,
      include: {
        order: { select: { orderNumber: true, customerName: true, customerEmail: true } },
        store: { select: { name: true, owner: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    await prisma.payment.count({ where }),
  ]);

  const totals = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum:  { amount: true, platformFee: true, storeEarnings: true },
  });

  return res.json({
    success: true,
    data: payments,
    totals: totals._sum,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// ── Helpers ──────────────────────────────────────────────────────────────────
async function getPlatformFee(): Promise<number> {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  return settings?.platformFeePercent || Number(process.env.PLATFORM_FEE_PERCENT || 10);
}

async function completePayment(orderId: string, reference: string, gateway: string) {
  try {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data:  { status: "SUCCESS", gatewayReference: reference, paidAt: new Date() },
      }),
      prisma.order.update({
        where: { id: orderId },
        data:  { status: "PROCESSING" },
      }),
    ]);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, items: true },
    });
    if (order) {
      // ── Customer confirmation email (with real line items) ─────────────────
      await emailService.sendOrderConfirmation({
        email:       order.customerEmail,
        name:        order.customerName,
        orderNumber: order.orderNumber,
        total:       order.total,
        currency:    order.currency,
        storeName:   order.store?.name || "Store",
        storeEmail:  order.store?.supportEmail || undefined,
        items:       (order.items as any[]).map(i => ({
          name:     i.name,
          quantity: i.quantity,
          price:    i.price,
        })),
      });

      // ── Store owner new-order alert ────────────────────────────────────────
      const owner = await prisma.user.findUnique({
        where:  { id: order.store!.ownerId },
        select: { email: true, name: true, phone: true },
      });
      if (owner) {
        emailService.sendNewOrderAlert({
          ownerEmail:   owner.email,
          ownerName:    owner.name,
          orderNumber:  order.orderNumber,
          customerName: order.customerName,
          total:        order.total,
          currency:     order.currency,
          storeName:    order.store!.name,
          itemCount:    (order.items as any[]).length,
        }).catch(() => {/* non-fatal */});
      }

      // ── Update customer spend stats ────────────────────────────────────────
      if (order.customerId) {
        await prisma.storeCustomer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: { increment: order.total },
            orderCount: { increment: 1 },
          },
        });
      }
    }
  } catch (err) {
    logger.error("completePayment error:", err);
  }
}

async function failPayment(orderId: string, gateway: string) {
  try {
    await prisma.payment.update({
      where: { orderId },
      data:  { status: "FAILED" },
    });
    logger.warn(`Payment failed for order ${orderId} via ${gateway}`);

    // Notify customer
    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { store: true },
    });
    if (order) {
      const { emailService } = await import("../services/email.service");
      emailService.sendPaymentFailed(
        order.customerEmail,
        order.customerName,
        order.orderNumber,
        `$${order.total.toFixed(2)}`,
        order.store?.name || "Store"
      );
    }
  } catch (err) {
    logger.error("failPayment error:", err);
  }
}
