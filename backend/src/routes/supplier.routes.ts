// src/routes/supplier.routes.ts
import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { requireStoreOwner } from "../controllers/store.controller";
import { supplierService, FulfillmentPayload } from "../services/supplier.service";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// ── All routes require auth ───────────────────────────────────────────────────
router.use(authenticate);

// ── GET /api/suppliers/:storeId — list all suppliers ─────────────────────────
router.get("/:storeId", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const suppliers = await prisma.supplier.findMany({
    where:   { storeId },
    include: {
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: suppliers });
});

// ── POST /api/suppliers/:storeId — create supplier ────────────────────────────
router.post("/:storeId", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const data = z.object({
    name:         z.string().min(1).max(200),
    type:         z.enum(["MANUAL","ALIEXPRESS","CSV","WEBHOOK"]).default("MANUAL"),
    websiteUrl:   z.string().url().optional().or(z.literal("")),
    apiKey:       z.string().optional(),
    apiSecret:    z.string().optional(),
    contactEmail: z.string().email().optional().or(z.literal("")),
    contactName:  z.string().optional(),
    notes:        z.string().optional(),
    autoFulfill:  z.boolean().default(false),
    fulfillEmail: z.string().email().optional().or(z.literal("")),
    webhookUrl:   z.string().url().optional().or(z.literal("")),
  }).parse(req.body);

  const supplier = await prisma.supplier.create({
    data: { ...data, storeId },
  });

  return res.status(201).json({ success: true, data: supplier });
});

// ── PUT /api/suppliers/:storeId/:supplierId — update supplier ─────────────────
router.put("/:storeId/:supplierId", async (req: AuthRequest, res: Response) => {
  const { storeId, supplierId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, storeId } });
  if (!supplier) throw new AppError("Supplier not found", 404);

  const data = z.object({
    name:         z.string().min(1).max(200).optional(),
    type:         z.enum(["MANUAL","ALIEXPRESS","CSV","WEBHOOK"]).optional(),
    websiteUrl:   z.string().optional(),
    apiKey:       z.string().optional(),
    apiSecret:    z.string().optional(),
    contactEmail: z.string().optional(),
    contactName:  z.string().optional(),
    notes:        z.string().optional(),
    isActive:     z.boolean().optional(),
    autoFulfill:  z.boolean().optional(),
    fulfillEmail: z.string().optional(),
    webhookUrl:   z.string().optional(),
  }).parse(req.body);

  const updated = await prisma.supplier.update({
    where: { id: supplierId },
    data,
  });

  return res.json({ success: true, data: updated });
});

// ── DELETE /api/suppliers/:storeId/:supplierId ────────────────────────────────
router.delete("/:storeId/:supplierId", async (req: AuthRequest, res: Response) => {
  const { storeId, supplierId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, storeId } });
  if (!supplier) throw new AppError("Supplier not found", 404);

  await prisma.supplier.delete({ where: { id: supplierId } });
  return res.json({ success: true, message: "Supplier deleted" });
});

// ── POST /api/suppliers/:storeId/import/url — scrape product from URL ─────────
router.post("/:storeId/import/url", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { url } = z.object({ url: z.string().url() }).parse(req.body);

  const scraped = await supplierService.scrapeProductUrl(url);
  return res.json({ success: true, data: scraped });
});

// ── POST /api/suppliers/:storeId/import/save — save scraped product ───────────
router.post("/:storeId/import/save", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const body = z.object({
    supplierId:      z.string().optional(),
    // Product fields
    name:            z.string().min(1),
    description:     z.string().default(""),
    price:           z.number().positive(),
    comparePrice:    z.number().optional(),
    costPrice:       z.number().optional(),   // supplier price
    images:          z.array(z.string()).default([]),
    category:        z.string().optional(),
    inventory:       z.number().int().min(0).default(50),
    status:          z.enum(["ACTIVE","DRAFT"]).default("DRAFT"),
    // Supplier link fields
    supplierUrl:     z.string().optional(),
    supplierSku:     z.string().optional(),
    supplierPrice:   z.number().optional(),
    supplierCurrency:z.string().default("USD"),
    processingDays:  z.number().optional(),
    shippingDays:    z.number().optional(),
  }).parse(req.body);

  // Check product plan limits
  const sub = await prisma.subscription.findFirst({
    where: { user: { stores: { some: { id: storeId } } } },
  });
  const plan = sub?.plan || "STARTER";
  const limits: Record<string, number> = { STARTER: 50, PRO: 500, ADVANCED: 999999 };
  const count = await prisma.product.count({ where: { storeId } });
  if (count >= (limits[plan] ?? 50)) {
    throw new AppError(`Product limit reached for your ${plan} plan`, 403);
  }

  // Slugify name
  const base = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = base;
  let i = 1;
  while (await prisma.product.findFirst({ where: { storeId, slug } })) {
    slug = `${base}-${i++}`;
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      storeId,
      slug,
      name:         body.name,
      description:  body.description,
      price:        body.price,
      comparePrice: body.comparePrice,
      costPrice:    body.costPrice ?? body.supplierPrice,
      images:       body.images,
      category:     body.category,
      inventory:    body.inventory,
      status:       body.status,
    },
  });

  // Link to supplier if supplierId provided
  if (body.supplierId && (body.supplierUrl || body.supplierSku)) {
    await prisma.supplierProduct.upsert({
      where:  { supplierId_productId: { supplierId: body.supplierId, productId: product.id } },
      create: {
        supplierId:       body.supplierId,
        productId:        product.id,
        supplierUrl:      body.supplierUrl,
        supplierSku:      body.supplierSku,
        supplierPrice:    body.supplierPrice,
        supplierCurrency: body.supplierCurrency,
        processingDays:   body.processingDays,
        shippingDays:     body.shippingDays,
        lastSynced:       new Date(),
        stockStatus:      "IN_STOCK",
      },
      update: {
        supplierUrl:      body.supplierUrl,
        supplierSku:      body.supplierSku,
        supplierPrice:    body.supplierPrice,
        supplierCurrency: body.supplierCurrency,
        processingDays:   body.processingDays,
        shippingDays:     body.shippingDays,
        lastSynced:       new Date(),
      },
    });
  }

  return res.status(201).json({ success: true, data: product });
});

// ── GET /api/suppliers/:storeId/products — list supplier-linked products ──────
router.get("/:storeId/products/linked", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const linked = await prisma.supplierProduct.findMany({
    where:   { product: { storeId } },
    include: {
      supplier: { select: { id: true, name: true, type: true } },
      product:  { select: { id: true, name: true, price: true, costPrice: true, status: true, images: true, inventory: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: linked });
});

// ── PUT /api/suppliers/:storeId/products/:productId/link ──────────────────────
router.put("/:storeId/products/:productId/link", async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const body = z.object({
    supplierId:       z.string(),
    supplierUrl:      z.string().optional(),
    supplierSku:      z.string().optional(),
    supplierPrice:    z.number().optional(),
    supplierCurrency: z.string().default("USD"),
    processingDays:   z.number().optional(),
    shippingDays:     z.number().optional(),
  }).parse(req.body);

  const link = await prisma.supplierProduct.upsert({
    where:  { supplierId_productId: { supplierId: body.supplierId, productId } },
    create: { ...body, productId, lastSynced: new Date(), stockStatus: "IN_STOCK" },
    update: { ...body, lastSynced: new Date() },
  });

  // Also update product costPrice
  if (body.supplierPrice) {
    await prisma.product.update({
      where: { id: productId },
      data:  { costPrice: body.supplierPrice },
    });
  }

  return res.json({ success: true, data: link });
});

// ── DELETE /api/suppliers/:storeId/products/:productId/link/:supplierId ────────
router.delete("/:storeId/products/:productId/link/:supplierId", async (req: AuthRequest, res: Response) => {
  const { storeId, productId, supplierId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  await prisma.supplierProduct.deleteMany({
    where: { productId, supplierId },
  });

  return res.json({ success: true, message: "Supplier link removed" });
});

// ── POST /api/suppliers/:storeId/fulfill/:orderId — manual trigger ─────────────
router.post("/:storeId/fulfill/:orderId", async (req: AuthRequest, res: Response) => {
  const { storeId, orderId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const order = await prisma.order.findFirst({
    where:   { id: orderId, storeId },
    include: { items: { include: { product: { include: { supplierProducts: { include: { supplier: true } } } } } } },
  });
  if (!order) throw new AppError("Order not found", 404);

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { name: true } });

  // Group items by supplier
  const bySupplier = new Map<string, { supplier: any; items: typeof order.items }>();

  for (const item of order.items) {
    const link = item.product.supplierProducts?.[0];
    if (!link?.supplier) continue;
    const sup = link.supplier;
    if (!bySupplier.has(sup.id)) bySupplier.set(sup.id, { supplier: sup, items: [] });
    bySupplier.get(sup.id)!.items.push(item);
  }

  if (bySupplier.size === 0) {
    return res.status(400).json({ success: false, message: "No suppliers linked to items in this order" });
  }

  const results: Array<{ supplierId: string; supplierName: string; method: string; success: boolean }> = [];

  for (const [, { supplier, items }] of bySupplier) {
    const payload: FulfillmentPayload = {
      orderNumber:     order.orderNumber,
      orderId:         order.id,
      customerName:    order.customerName,
      customerEmail:   order.customerEmail,
      customerPhone:   order.customerPhone,
      shippingAddress: order.shippingAddress,
      storeName:       store?.name ?? storeId,
      storeId,
      total:           order.total,
      currency:        order.currency,
      notes:           order.notes,
      items: items.map(i => ({
        name:        i.name,
        sku:         i.sku,
        quantity:    i.quantity,
        price:       i.price,
        supplierSku: i.product.supplierProducts?.[0]?.supplierSku ?? null,
        supplierUrl: i.product.supplierProducts?.[0]?.supplierUrl ?? null,
      })),
    };

    let method = "MANUAL";
    let success = false;

    if (supplier.webhookUrl) {
      method = "WEBHOOK";
      success = await supplierService.fulfillOrderByWebhook(supplier.webhookUrl, payload);
    } else if (supplier.fulfillEmail) {
      method = "EMAIL";
      success = await supplierService.fulfillOrderByEmail(supplier.fulfillEmail, supplier.name, payload);
    } else {
      method = "MANUAL";
      success = true; // logged as manual
    }

    // Record fulfillment
    await prisma.fulfillmentOrder.create({
      data: {
        orderId:    order.id,
        supplierId: supplier.id,
        storeId,
        status:     success ? "SENT" : "FAILED",
        sentAt:     success ? new Date() : undefined,
        method,
        payload:    payload as any,
      },
    });

    results.push({ supplierId: supplier.id, supplierName: supplier.name, method, success });
  }

  return res.json({ success: true, data: results });
});

// ── GET /api/suppliers/:storeId/fulfillments — list fulfillment records ────────
router.get("/:storeId/fulfillments", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const fulfillments = await prisma.fulfillmentOrder.findMany({
    where:   { storeId },
    include: { supplier: { select: { id: true, name: true, type: true } } },
    orderBy: { createdAt: "desc" },
    take:    50,
  });

  return res.json({ success: true, data: fulfillments });
});

// ── POST /api/suppliers/:storeId/import/url/batch — scrape multiple URLs ──────
router.post("/:storeId/import/url/batch", async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const { urls } = z.object({
    urls: z.array(z.string().url()).max(10),
  }).parse(req.body);

  const results = await Promise.allSettled(
    urls.map(url => supplierService.scrapeProductUrl(url))
  );

  const data = results.map((r, i) => ({
    url:     urls[i],
    success: r.status === "fulfilled",
    data:    r.status === "fulfilled" ? r.value : null,
    error:   r.status === "rejected"  ? r.reason?.message : null,
  }));

  return res.json({ success: true, data });
});

// ── GET /api/suppliers/:storeId/products/:productId/suppliers ─────────────────
router.get("/:storeId/products/:productId/suppliers", async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const assignments = await prisma.supplierProduct.findMany({
    where: { productId, product: { storeId } },
    include: { supplier: { select: { id: true, name: true, type: true, isActive: true } } },
    orderBy: { priority: "asc" },
  });

  return res.json({ success: true, data: assignments });
});

// ── POST /api/suppliers/:storeId/products/:productId/suppliers ────────────────
router.post("/:storeId/products/:productId/suppliers", async (req: AuthRequest, res: Response) => {
  const { storeId, productId } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const body = z.object({
    supplierId:    z.string(),
    supplierSku:   z.string().optional(),
    supplierPrice: z.number().optional(),
    supplierUrl:   z.string().optional(),
    priority:      z.number().int().min(1).default(1),
    notes:         z.string().optional(),
  }).parse(req.body);

  const existing = await prisma.supplierProduct.findFirst({
    where: { supplierId: body.supplierId, productId },
  });
  if (existing) throw new AppError("This supplier is already assigned to this product", 409);

  const assignment = await prisma.supplierProduct.create({
    data: { ...body, productId },
    include: { supplier: { select: { id: true, name: true, type: true } } },
  });

  return res.status(201).json({ success: true, data: assignment });
});

// ── PATCH /api/suppliers/:storeId/supplier-products/:id ───────────────────────
router.patch("/:storeId/supplier-products/:id", async (req: AuthRequest, res: Response) => {
  const { storeId, id } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);

  const body = z.object({
    priority:      z.number().int().min(1).optional(),
    isActive:      z.boolean().optional(),
    supplierSku:   z.string().optional(),
    supplierPrice: z.number().optional(),
    notes:         z.string().optional(),
    stockStatus:   z.string().optional(),
  }).parse(req.body);

  const updated = await prisma.supplierProduct.update({ where: { id }, data: body });
  return res.json({ success: true, data: updated });
});

// ── DELETE /api/suppliers/:storeId/supplier-products/:id ─────────────────────
router.delete("/:storeId/supplier-products/:id", async (req: AuthRequest, res: Response) => {
  const { storeId, id } = req.params;
  await requireStoreOwner(storeId, req.user!.userId, req.user!.role);
  await prisma.supplierProduct.delete({ where: { id } });
  return res.json({ success: true });
});


export default router;
