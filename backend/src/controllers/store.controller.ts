// src/controllers/store.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { slugify, paginate } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";

const storeSchema = z.object({
  name:            z.string().min(2).max(100),
  description:     z.string().max(500).optional(),
  primaryColor:    z.string().optional(),
  secondaryColor:  z.string().optional(),
  accentColor:     z.string().optional(),
  theme:           z.string().optional(),
  fontFamily:      z.string().optional(),
  borderRadius:    z.string().optional(),
  tagline:         z.string().max(200).optional(),
  showReviews:     z.boolean().optional(),
  showInventory:   z.boolean().optional(),
  productsPerRow:  z.number().min(1).max(6).optional(),
  currency:        z.string().default("USD"),
  country:         z.string().optional(),
  supportEmail:    z.string().email().optional().or(z.literal("")),
  supportPhone:    z.string().optional(),
  taxRate:         z.number().min(0).max(100).optional(),
  shippingEnabled: z.boolean().optional(),
  freeShippingMin: z.number().optional(),
  metaTitle:         z.string().optional(),
  metaDescription:   z.string().optional(),
  supportedCurrencies: z.array(z.string()).optional(),
  autoDetectCurrency:  z.boolean().optional(),
  smsEnabled:        z.boolean().optional(),
  smsPhone:          z.string().optional().nullable(),
  whatsappEnabled:   z.boolean().optional(),
  whatsappPhone:     z.string().optional().nullable(),
  notifyOwnerSms:    z.boolean().optional(),
  notifyCustomerSms: z.boolean().optional(),
});

// Create store
export const createStore = async (req: AuthRequest, res: Response) => {
  const data = storeSchema.parse(req.body);
  const userId = req.user!.userId;

  // Check subscription limits
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) throw new AppError("No active subscription", 402);

  const limits: Record<string, number> = { STARTER: 1, PRO: 3, ADVANCED: 999 };
  const maxStores = limits[sub.plan] || 1;

  const existingCount = await prisma.store.count({ where: { ownerId: userId } });
  if (existingCount >= maxStores) {
    throw new AppError(`Your ${sub.plan} plan allows max ${maxStores} store(s). Upgrade to add more.`, 403);
  }

  const slug = await uniqueSlug(slugify(data.name));

  const store = await prisma.store.create({
    data: {
      ...data,
      ownerId: userId,
      slug,
      domain:  `${slug}.dropos.io`,
      status:  "ACTIVE",
    },
  });

  return res.status(201).json({ success: true, message: "Store created", data: store });
};

// Get my stores
export const getMyStores = async (req: AuthRequest, res: Response) => {
  const stores = await prisma.store.findMany({
    where: { ownerId: req.user!.userId },
    include: {
      _count: { select: { products: true, orders: true, customers: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: stores });
};

// Get single store (owner)
export const getStore = async (req: AuthRequest, res: Response) => {
  const store = await requireStoreOwner(req.params.id, req.user!.userId, req.user!.role);
  const full  = await prisma.store.findUnique({
    where: { id: store.id },
    include: {
      _count: { select: { products: true, orders: true, customers: true } },
      shippingZones: true,
    },
  });
  return res.json({ success: true, data: full });
};

// Update store
export const updateStore = async (req: AuthRequest, res: Response) => {
  const store = await requireStoreOwner(req.params.id, req.user!.userId, req.user!.role);
  const data  = storeSchema.partial().parse(req.body);

  const updated = await prisma.store.update({ where: { id: store.id }, data });
  return res.json({ success: true, message: "Store updated", data: updated });
};

// Delete store
export const deleteStore = async (req: AuthRequest, res: Response) => {
  const store = await requireStoreOwner(req.params.id, req.user!.userId, req.user!.role);
  await prisma.store.delete({ where: { id: store.id } });
  return res.json({ success: true, message: "Store deleted" });
};

// Update custom domain
export const updateDomain = async (req: AuthRequest, res: Response) => {
  const store  = await requireStoreOwner(req.params.id, req.user!.userId, req.user!.role);
  const { customDomain } = z.object({ customDomain: z.string().optional() }).parse(req.body);

  if (customDomain) {
    const existing = await prisma.store.findFirst({
      where: { customDomain, id: { not: store.id } },
    });
    if (existing) throw new AppError("Domain already in use", 409);
  }

  const updated = await prisma.store.update({
    where: { id: store.id },
    data:  { customDomain: customDomain || null },
  });
  return res.json({ success: true, message: "Domain updated", data: updated });
};

// Public store by slug
export const getPublicStore = async (req: Request, res: Response) => {
  const store = await prisma.store.findFirst({
    where: {
      OR: [{ slug: req.params.slug }, { customDomain: req.params.slug }],
      status: "ACTIVE",
    },
    select: {
      id: true, name: true, slug: true, description: true,
      logo: true, banner: true, domain: true, customDomain: true,
      primaryColor: true, secondaryColor: true, accentColor: true,
      theme: true, fontFamily: true, borderRadius: true, tagline: true,
      showReviews: true, showInventory: true, productsPerRow: true,
      currency: true, supportEmail: true, supportPhone: true,
      supportedCurrencies: true, autoDetectCurrency: true,
      shippingEnabled: true, metaTitle: true, metaDescription: true,
    },
  });
  if (!store) throw new AppError("Store not found", 404);
  return res.json({ success: true, data: store });
};

// ── Helpers ──────────────────────────────────────────────────────────────────
async function uniqueSlug(base: string): Promise<string> {
  let slug = base, i = 1;
  while (await prisma.store.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function requireStoreOwner(storeId: string, userId: string, role: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new AppError("Store not found", 404);
  if (store.ownerId !== userId && role !== "SUPER_ADMIN") {
    throw new AppError("Not authorized to access this store", 403);
  }
  return store;
}
