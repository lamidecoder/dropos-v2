// src/controllers/upsell.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";

// ─── Get related/upsell products for a given product ─────────────────────────
// Strategy: same category > same price range > most reviewed > newest
export const getUpsellProducts = async (req: Request, res: Response) => {
  const { storeId, productId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 4, 8);

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId, status: "ACTIVE" },
    select: { id: true, price: true, category: true, name: true },
  });
  if (!product) throw new AppError("Product not found", 404);

  // 1. Same category (exclude self)
  let related = await prisma.product.findMany({
    where: {
      storeId,
      status: "ACTIVE",
      id: { not: productId },
      category: product.category || undefined,
    },
    orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true, name: true, price: true, comparePrice: true,
      images: true, slug: true, inventory: true,
      _count: { select: { reviews: true } },
    },
  });

  // 2. If not enough, fill with price-range products
  if (related.length < limit) {
    const priceLow  = product.price * 0.6;
    const priceHigh = product.price * 1.6;
    const existingIds = [productId, ...related.map(r => r.id)];

    const extras = await prisma.product.findMany({
      where: {
        storeId, status: "ACTIVE",
        id: { notIn: existingIds },
        price: { gte: priceLow, lte: priceHigh },
      },
      orderBy: { createdAt: "desc" },
      take: limit - related.length,
      select: {
        id: true, name: true, price: true, comparePrice: true,
        images: true, slug: true, inventory: true,
        _count: { select: { reviews: true } },
      },
    });
    related = [...related, ...extras];
  }

  // 3. Still not enough — just return latest active products
  if (related.length < limit) {
    const existingIds = [productId, ...related.map(r => r.id)];
    const extras = await prisma.product.findMany({
      where: { storeId, status: "ACTIVE", id: { notIn: existingIds } },
      orderBy: { createdAt: "desc" },
      take: limit - related.length,
      select: {
        id: true, name: true, price: true, comparePrice: true,
        images: true, slug: true, inventory: true,
        _count: { select: { reviews: true } },
      },
    });
    related = [...related, ...extras];
  }

  res.json({ success: true, data: related });
};

// ─── Get "frequently bought together" (based on co-occurrence in orders) ──────
export const getFrequentlyBoughtTogether = async (req: Request, res: Response) => {
  const { storeId, productId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 3, 6);

  // Find orders that contain this product
  const orderIds = await prisma.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
    take: 200, // look at last 200 orders containing this product
  });

  if (orderIds.length === 0) {
    return res.json({ success: true, data: [] });
  }

  const ids = orderIds.map(o => o.orderId);

  // Find other products in those orders
  const coItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: {
      orderId: { in: ids },
      productId: { not: productId },
    },
    _count: { productId: true },
    orderBy: { _count: { productId: "desc" } },
    take: limit,
  });

  if (coItems.length === 0) return res.json({ success: true, data: [] });

  const productIds = coItems.map(i => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId, status: "ACTIVE" },
    select: {
      id: true, name: true, price: true, comparePrice: true, images: true, slug: true,
    },
  });

  // Sort by co-occurrence frequency
  const sorted = productIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  res.json({ success: true, data: sorted });
};

// ─── Cart upsell: items to suggest at checkout based on cart contents ─────────
export const getCartUpsell = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const productIds: string[] = req.body.productIds || [];
  const limit = Math.min(Number(req.query.limit) || 3, 6);

  if (!productIds.length) return res.json({ success: true, data: [] });

  // Get categories of cart items
  const cartProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, storeId },
    select: { category: true, price: true },
  });

  const categories = [...new Set(cartProducts.map(p => p.category).filter(Boolean))];
  const avgPrice   = cartProducts.reduce((s, p) => s + p.price, 0) / cartProducts.length;

  // Find complementary items — same category, not already in cart, lower price (accessories)
  const suggestions = await prisma.product.findMany({
    where: {
      storeId, status: "ACTIVE",
      id: { notIn: productIds },
      category: categories.length ? { in: categories as string[] } : undefined,
      price: { lte: avgPrice * 0.7 }, // suggest items that are cheaper (accessories)
    },
    orderBy: [{ reviews: { _count: "desc" } }],
    take: limit,
    select: {
      id: true, name: true, price: true, comparePrice: true, images: true, slug: true,
    },
  });

  res.json({ success: true, data: suggestions });
};
