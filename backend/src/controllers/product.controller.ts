// src/controllers/product.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { slugify, paginate } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import { requireStoreOwner } from "./store.controller";

const productSchema = z.object({
  name:          z.string().min(2).max(200),
  description:   z.string().optional(),
  price:         z.number().positive(),
  comparePrice:  z.number().optional(),
  costPrice:     z.number().optional(),
  sku:           z.string().optional(),
  barcode:       z.string().optional(),
  inventory:     z.number().int().min(0).default(0),
  trackInventory:z.boolean().default(true),
  allowBackorder:z.boolean().default(false),
  images:        z.array(z.string()).default([]),
  category:      z.string().optional(),
  tags:          z.array(z.string()).default([]),
  status:        z.enum(["ACTIVE","DRAFT","ARCHIVED"]).default("DRAFT"),
  isDigital:     z.boolean().default(false),
  weight:        z.number().optional(),
  metaTitle:     z.string().optional(),
  metaDescription: z.string().optional(),
});

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  // Check product limits
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
  const limits: Record<string, number> = { STARTER: 50, PRO: 500, ADVANCED: 999999 };
  const max = limits[sub?.plan || "STARTER"];
  const count = await prisma.product.count({ where: { storeId } });
  if (count >= max) throw new AppError(`Product limit (${max}) reached for your plan`, 403);

  const data = productSchema.parse(req.body);
  const slug = await uniqueProductSlug(storeId, slugify(data.name));

  const product = await prisma.product.create({
    data: { ...data, storeId, slug },
  });

  return res.status(201).json({ success: true, message: "Product created", data: product });
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { page = 1, limit = 20, status, search, category } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where: any = { storeId };
  if (status)   where.status   = status;
  if (category) where.category = category;
  if (search)   where.name = { contains: search as string, mode: "insensitive" };

  const [products, total] = await Promise.all([
    await prisma.product.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    await prisma.product.count({ where }),
  ]);

  return res.json({
    success: true,
    data: products,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
    include: { variants: true },
  });
  if (!product) throw new AppError("Product not found", 404);
  return res.json({ success: true, data: product });
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new AppError("Product not found", 404);

  const data = productSchema.partial().parse(req.body);
  const updated = await prisma.product.update({ where: { id: productId }, data });
  return res.json({ success: true, message: "Product updated", data: updated });
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
  if (!product) throw new AppError("Product not found", 404);

  await prisma.product.delete({ where: { id: productId } });
  return res.json({ success: true, message: "Product deleted" });
};

// Bulk create from CSV data — returns per-row success/failure details
export const bulkCreateProducts = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const store = await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  // Check plan limits before doing anything
  const sub  = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
  const plan = sub?.plan || "STARTER";
  const limits: Record<string, number> = { STARTER: 50, PRO: 500, ADVANCED: 999999 };
  const maxProducts  = limits[plan] ?? 50;
  const currentCount = await prisma.product.count({ where: { storeId } });
  const remainingSlots = maxProducts - currentCount;

  const rawProducts = z.object({
    products: z.array(z.any()).max(500),
  }).parse(req.body).products;

  if (rawProducts.length > remainingSlots) {
    return res.status(403).json({
      success: false,
      message: `Your ${plan} plan allows ${maxProducts} products. You have ${currentCount} and are trying to add ${rawProducts.length} more (only ${remainingSlots} slots left).`,
      data: [],
    });
  }

  const results: Array<{ index: number; success: boolean; name?: string; error?: string }> = [];
  const created: any[] = [];

  for (let i = 0; i < rawProducts.length; i++) {
    try {
      const parsed = productSchema.parse(rawProducts[i]);
      const slug   = await uniqueProductSlug(storeId, slugify(parsed.name));
      const product = await prisma.product.create({ data: { ...parsed, storeId, slug } });
      created.push(product);
      results.push({ index: i, success: true, name: parsed.name });
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || "Invalid product data";
      results.push({ index: i, success: false, name: rawProducts[i]?.name || `Row ${i+1}`, error: msg });
    }
  }

  const failCount = results.filter(r => !r.success).length;
  return res.status(201).json({
    success: true,
    message: `${created.length} created${failCount > 0 ? `, ${failCount} failed` : ""}`,
    data: created,
    results,
    summary: { total: rawProducts.length, created: created.length, failed: failCount },
  });
};

// Public product listing
export const getPublicProducts = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { page = 1, limit = 20, category, search, minPrice, maxPrice } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where: any = { storeId, status: "ACTIVE" };
  if (category) where.category = category;
  if (search)   where.name = { contains: search as string, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const [products, total] = await Promise.all([
    await prisma.product.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    await prisma.product.count({ where }),
  ]);

  return res.json({
    success: true,
    data: products,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// Public single product
export const getPublicProduct = async (req: Request, res: Response) => {
  const { storeId, slug } = req.params;
  // Accept both slug and UUID id
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const product = await prisma.product.findFirst({
    where: isUUID
      ? { storeId, id: slug, status: "ACTIVE" }
      : { storeId, slug, status: "ACTIVE" },
    include: { variants: true },
  });
  if (!product) throw new AppError("Product not found", 404);
  return res.json({ success: true, data: product });
};

async function uniqueProductSlug(storeId: string, base: string): Promise<string> {
  let slug = base, i = 1;
  while (await prisma.product.findFirst({ where: { storeId, slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

// ─── Product Variants ─────────────────────────────────────────────────────────

const variantSchema = z.object({
  name:      z.string().min(1),  // e.g. "Size", "Color"
  value:     z.string().min(1),  // e.g. "L", "Red"
  price:     z.number().optional(),
  inventory: z.number().int().min(0).default(0),
  sku:       z.string().optional(),
  image:     z.string().optional(),
});

export const createVariant = async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  const data = variantSchema.parse(req.body);
  const variant = await prisma.productVariant.create({ data: { productId, ...data } });
  res.status(201).json({ success: true, data: variant });
};

export const updateVariant = async (req: AuthRequest, res: Response) => {
  const { storeId, productId, variantId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  const data = variantSchema.partial().parse(req.body);
  const variant = await prisma.productVariant.update({ where: { id: variantId }, data });
  res.json({ success: true, data: variant });
};

export const deleteVariant = async (req: AuthRequest, res: Response) => {
  const { storeId, productId, variantId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  await prisma.productVariant.delete({ where: { id: variantId } });
  res.json({ success: true });
};

export const getVariants = async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  const variants = await prisma.productVariant.findMany({ where: { productId }, orderBy: { createdAt: "asc" } });
  res.json({ success: true, data: variants });
};