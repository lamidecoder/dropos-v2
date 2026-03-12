// src/controllers/giftCard.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { emailService } from "../services/email.service";
import crypto from "crypto";

const createGiftCardSchema = z.object({
  amount:      z.number().positive(),
  currency:    z.string().default("USD"),
  assignedTo:  z.string().email().optional(),
  expiresAt:   z.string().datetime().optional(),
  note:        z.string().optional(),
  purchasedBy: z.string().email().optional(),
});

function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 16 }, (_, i) =>
    (i > 0 && i % 4 === 0 ? "-" : "") + chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// POST /gift-cards/:storeId
export const createGiftCard = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyStoreOwner(storeId, req.user!.userId);

  const data = createGiftCardSchema.parse(req.body);
  const code = generateGiftCode();

  const giftCard = await prisma.giftCard.create({
    data: {
      storeId, code, balance: data.amount, initialAmount: data.amount,
      currency: data.currency, assignedTo: data.assignedTo,
      purchasedBy: data.purchasedBy, note: data.note,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
  });

  // Email recipient if assigned
  if (data.assignedTo) {
    await emailService.send({
      to: data.assignedTo,
      subject: "You received a Gift Card! 🎁",
      html: `<p>You've received a gift card worth <strong>${data.currency} ${data.amount.toFixed(2)}</strong>!</p><p>Your code: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p>${data.note ? `<p>Message: ${data.note}</p>` : ""}${data.expiresAt ? `<p>Expires: ${new Date(data.expiresAt).toLocaleDateString()}</p>` : ""}`,
    });
  }

  res.status(201).json({ success: true, data: giftCard });
};

// GET /gift-cards/:storeId
export const getGiftCards = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyStoreOwner(storeId, req.user!.userId);

  const giftCards = await prisma.giftCard.findMany({
    where: { storeId }, orderBy: { createdAt: "desc" },
    include: { usages: { select: { amount: true, orderId: true, createdAt: true } } },
  });

  res.json({ success: true, data: giftCards });
};

// POST /gift-cards/validate  — public, validate a code at checkout
export const validateGiftCard = async (req: Request, res: Response) => {
  const { code, storeId } = req.body;
  if (!code || !storeId) throw new AppError("Code and storeId required", 400);

  const gc = await prisma.giftCard.findFirst({
    where: { code: code.toUpperCase().replace(/\s/g,""), storeId, isActive: true },
  });

  if (!gc) throw new AppError("Invalid gift card code", 404);
  if (gc.balance <= 0) throw new AppError("This gift card has no remaining balance", 400);
  if (gc.expiresAt && gc.expiresAt < new Date()) throw new AppError("This gift card has expired", 400);

  res.json({ success: true, data: { id: gc.id, balance: gc.balance, currency: gc.currency } });
};

// PATCH /gift-cards/:storeId/:id/deactivate
export const deactivateGiftCard = async (req: AuthRequest, res: Response) => {
  const { storeId, id } = req.params;
  await verifyStoreOwner(storeId, req.user!.userId);

  const gc = await prisma.giftCard.update({ where: { id }, data: { isActive: false } });
  res.json({ success: true, data: gc });
};

async function verifyStoreOwner(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: userId } });
  if (!store) throw new AppError("Unauthorized", 403);
}
