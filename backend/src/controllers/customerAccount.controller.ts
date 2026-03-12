// src/controllers/customerAccount.controller.ts
import { Request, Response } from "express";
import { CustomerAuthRequest } from "../middleware/customerAuth";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { emailService } from "../services/email.service";
import crypto from "crypto";

const registerSchema = z.object({
  storeId:  z.string().uuid(),
  email:    z.string().email(),
  name:     z.string().min(2),
  phone:    z.string().optional(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  storeId:  z.string().uuid(),
  email:    z.string().email(),
  password: z.string(),
});

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function signToken(id: string, storeId: string) {
  return jwt.sign({ id, storeId, type: "customer" }, JWT_SECRET, { expiresIn: "7d" });
}

// POST /customer-auth/register
export const registerCustomer = async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const store = await prisma.store.findFirst({ where: { id: data.storeId, status: "ACTIVE" } });
  if (!store) throw new AppError("Store not found", 404);

  const existing = await prisma.customerAccount.findUnique({ where: { storeId_email: { storeId: data.storeId, email: data.email } } });
  if (existing) throw new AppError("An account with this email already exists", 409);

  const passwordHash = await bcrypt.hash(data.password, 12);
  const verifyToken = crypto.randomBytes(32).toString("hex");

  const account = await prisma.customerAccount.create({
    data: { storeId: data.storeId, email: data.email, name: data.name, phone: data.phone, passwordHash, verifyToken },
    select: { id: true, email: true, name: true, emailVerified: true, createdAt: true },
  });

  await emailService.send({
    to: data.email,
    subject: `Verify your ${store.name} account`,
    html: `<p>Hi ${data.name}, welcome to ${store.name}!</p><p><a href="${process.env.STOREFRONT_URL}/store/${store.slug}/verify-email?token=${verifyToken}">Verify your email</a></p>`,
  });

  const token = signToken(account.id, data.storeId);
  res.status(201).json({ success: true, data: { account, token } });
};

// POST /customer-auth/login
export const loginCustomer = async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const account = await prisma.customerAccount.findUnique({ where: { storeId_email: { storeId: data.storeId, email: data.email } } });
  if (!account) throw new AppError("Invalid credentials", 401);

  const valid = await bcrypt.compare(data.password, account.passwordHash);
  if (!valid) throw new AppError("Invalid credentials", 401);

  // Get order history
  const orders = await prisma.order.findMany({
    where: { storeId: data.storeId, customerEmail: data.email },
    orderBy: { createdAt: "desc" }, take: 20,
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, items: { select: { name: true, quantity: true } } },
  });

  const token = signToken(account.id, data.storeId);
  res.json({ success: true, data: { account: { id: account.id, email: account.email, name: account.name, emailVerified: account.emailVerified, defaultAddress: account.defaultAddress, wishlist: account.wishlist }, token, orders } });
};

// GET /customer-auth/profile — requires customer JWT
export const getCustomerProfile = async (req: CustomerAuthRequest, res: Response) => {
  const { accountId, storeId } = req.customer!;
  const account = await prisma.customerAccount.findUnique({
    where: { id: accountId },
    select: { id: true, email: true, name: true, phone: true, emailVerified: true, defaultAddress: true, savedAddresses: true, wishlist: true, createdAt: true },
  });
  if (!account) throw new AppError("Account not found", 404);

  const orders = await prisma.order.findMany({
    where: { storeId, customerEmail: account.email },
    orderBy: { createdAt: "desc" }, take: 50,
    select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, trackingNumber: true, items: { select: { name: true, quantity: true, price: true, image: true } } },
  });

  res.json({ success: true, data: { account, orders } });
};

// PATCH /customer-auth/profile
export const updateCustomerProfile = async (req: CustomerAuthRequest, res: Response) => {
  const { accountId } = req.customer!;
  const { name, phone, defaultAddress, savedAddresses } = req.body;

  const updated = await prisma.customerAccount.update({
    where: { id: accountId },
    data: { name, phone, defaultAddress, savedAddresses },
    select: { id: true, email: true, name: true, phone: true, defaultAddress: true, savedAddresses: true },
  });

  res.json({ success: true, data: updated });
};

// POST /customer-auth/wishlist/toggle
export const toggleWishlist = async (req: CustomerAuthRequest, res: Response) => {
  const { accountId } = req.customer!;
  const { productId } = req.body;
  if (!productId) throw new AppError("productId required", 400);

  const account = await prisma.customerAccount.findUnique({ where: { id: accountId }, select: { wishlist: true } });
  if (!account) throw new AppError("Not found", 404);

  const inList = account.wishlist.includes(productId);
  const wishlist = inList ? account.wishlist.filter(id => id !== productId) : [...account.wishlist, productId];

  await prisma.customerAccount.update({ where: { id: accountId }, data: { wishlist } });

  res.json({ success: true, data: { wishlist, added: !inList } });
};

// GET /customer-auth/wishlist
export const getWishlist = async (req: CustomerAuthRequest, res: Response) => {
  const { accountId, storeId } = req.customer!;
  const account = await prisma.customerAccount.findUnique({ where: { id: accountId }, select: { wishlist: true } });
  if (!account) throw new AppError("Not found", 404);

  const products = account.wishlist.length > 0
    ? await prisma.product.findMany({ where: { id: { in: account.wishlist }, storeId, status: "ACTIVE" }, select: { id: true, name: true, price: true, comparePrice: true, images: true, slug: true } })
    : [];

  res.json({ success: true, data: products });
};

// POST /customer-auth/forgot-password
export const customerForgotPassword = async (req: Request, res: Response) => {
  const { storeId, email } = req.body;
  const account = await prisma.customerAccount.findUnique({ where: { storeId_email: { storeId, email } } });

  // Always respond 200 (security)
  if (!account) return res.json({ success: true, message: "If that email exists, a reset link was sent." });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.customerAccount.update({ where: { id: account.id }, data: { resetToken: token, resetExpiry: new Date(Date.now() + 3600000) } });

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { slug: true, name: true } });
  await emailService.send({
    to: email, subject: "Reset your password",
    html: `<p>Click to reset: <a href="${process.env.STOREFRONT_URL}/store/${store!.slug}/reset-password?token=${token}">Reset Password</a></p><p>Link expires in 1 hour.</p>`,
  });

  res.json({ success: true, message: "If that email exists, a reset link was sent." });
};
