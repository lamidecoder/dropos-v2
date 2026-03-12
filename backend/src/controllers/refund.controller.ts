// src/controllers/refund.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { emailService } from "../services/email.service";

const createRefundSchema = z.object({
  amount:      z.number().positive(),
  reason:      z.enum(["DAMAGED","NOT_RECEIVED","WRONG_ITEM","NOT_AS_DESCRIBED","CHANGED_MIND","OTHER"]),
  description: z.string().optional(),
  photos:      z.array(z.string()).default([]),
});

const processRefundSchema = z.object({
  status:    z.enum(["APPROVED","REJECTED"]),
  adminNote: z.string().optional(),
});

// POST /refunds/:storeId/:orderId  — store owner requests or customer requests
export const createRefund = async (req: AuthRequest, res: Response) => {
  const { storeId, orderId } = req.params;
  const data = createRefundSchema.parse(req.body);

  const order = await prisma.order.findFirst({ where: { id: orderId, storeId } });
  if (!order) throw new AppError("Order not found", 404);
  if (!["COMPLETED","DELIVERED"].includes(order.status)) throw new AppError("Order must be completed/delivered to refund", 400);

  const existing = await prisma.refund.findFirst({ where: { orderId, status: { in: ["PENDING","APPROVED"] } } });
  if (existing) throw new AppError("A refund request already exists for this order", 409);

  if (data.amount > order.total) throw new AppError("Refund amount exceeds order total", 400);

  const refund = await prisma.refund.create({
    data: { orderId, storeId, amount: data.amount, reason: data.reason, description: data.description, photos: data.photos },
  });

  // Notify store owner (in-app)
  const storeForNotif = await prisma.store.findUnique({ where: { id: order.storeId }, select: { ownerId: true } });
  if (storeForNotif?.ownerId) {
    await prisma.notification.create({
      data: {
        userId: storeForNotif.ownerId, type: "warning",
        title: "Refund Request",
        message: `Refund of $${data.amount.toFixed(2)} requested for order ${order.orderNumber}`,
        link: `/dashboard/refunds`,
      },
    }).catch(() => {}); // non-blocking
  }

  res.status(201).json({ success: true, data: refund });
};

// GET /refunds/:storeId
export const getRefunds = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { status, page = 1, limit = 20 } = req.query as any;

  const where: any = { storeId };
  if (status) where.status = status;

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where, skip: (Number(page) - 1) * Number(limit), take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true, customerName: true, customerEmail: true, total: true } } },
    }),
    prisma.refund.count({ where }),
  ]);

  res.json({ success: true, data: refunds, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
};

// PATCH /refunds/:storeId/:refundId/process — store owner approves/rejects
export const processRefund = async (req: AuthRequest, res: Response) => {
  const { storeId, refundId } = req.params;
  const data = processRefundSchema.parse(req.body);

  const refund = await prisma.refund.findFirst({ where: { id: refundId, storeId }, include: { order: true } });
  if (!refund) throw new AppError("Refund not found", 404);
  if (refund.status !== "PENDING") throw new AppError("Refund already processed", 400);

  const updated = await prisma.refund.update({
    where: { id: refundId },
    data: { status: data.status, adminNote: data.adminNote, processedAt: new Date() },
  });

  if (data.status === "APPROVED") {
    // Update order status to REFUNDED
    await prisma.order.update({ where: { id: refund.orderId }, data: { status: "REFUNDED", refundAmount: refund.amount } });
    // Update payment status
    await prisma.payment.updateMany({ where: { orderId: refund.orderId }, data: { status: "REFUNDED", refundedAt: new Date() } });
    // Email customer
    await emailService.send({
      to: refund.order.customerEmail,
      subject: `Refund Approved — ${refund.order.orderNumber}`,
      html: `<p>Hi ${refund.order.customerName},</p><p>Your refund of <strong>$${refund.amount.toFixed(2)}</strong> for order <strong>${refund.order.orderNumber}</strong> has been approved. Funds will appear within 5-10 business days.</p>`,
    });
  } else {
    await emailService.send({
      to: refund.order.customerEmail,
      subject: `Refund Update — ${refund.order.orderNumber}`,
      html: `<p>Hi ${refund.order.customerName},</p><p>Unfortunately your refund request for order <strong>${refund.order.orderNumber}</strong> was not approved.</p>${data.adminNote ? `<p>Reason: ${data.adminNote}</p>` : ""}`,
    });
  }

  res.json({ success: true, data: updated });
};

// Customer-side: submit refund request publicly
export const customerRequestRefund = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const data = createRefundSchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw new AppError("Order not found", 404);

  const existing = await prisma.refund.findFirst({ where: { orderId: order.id, status: { in: ["PENDING","APPROVED"] } } });
  if (existing) throw new AppError("Refund already requested", 409);

  const refund = await prisma.refund.create({
    data: { orderId: order.id, storeId: order.storeId, amount: data.amount, reason: data.reason, description: data.description, photos: data.photos },
  });

  res.status(201).json({ success: true, data: refund, message: "Refund request submitted. You'll be contacted within 2 business days." });
};
