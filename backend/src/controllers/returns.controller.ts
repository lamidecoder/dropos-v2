// src/controllers/returns.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import { emailService } from "../services/email.service";

const createReturnSchema = z.object({
  customerEmail: z.string().email(),
  reason:        z.string().min(5),
  description:   z.string().optional(),
  photos:        z.array(z.string()).default([]),
});

// POST /returns/:orderNumber  — public, customer submits
export const requestReturn = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const data = createReturnSchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.customerEmail !== data.customerEmail) throw new AppError("Email does not match order", 400);
  if (!["COMPLETED","DELIVERED"].includes(order.status)) throw new AppError("Order must be completed to request a return", 400);

  const existing = await prisma.returnRequest.findFirst({ where: { orderId: order.id, status: { in: ["REQUESTED","APPROVED"] } } });
  if (existing) throw new AppError("A return request already exists for this order", 409);

  const returnReq = await prisma.returnRequest.create({
    data: { orderId: order.id, storeId: order.storeId, customerEmail: data.customerEmail, reason: data.reason, description: data.description, photos: data.photos },
  });

  // Notify store owner via email
  const store = await prisma.store.findUnique({ where: { id: order.storeId }, select: { supportEmail: true, name: true, owner: { select: { email: true } } } });
  await emailService.send({
    to: store?.supportEmail || store?.owner?.email || "",
    subject: `Return Request — ${orderNumber}`,
    html: `<p>A return has been requested for order <strong>${orderNumber}</strong> by ${data.customerEmail}.</p><p>Reason: ${data.reason}</p><p>Login to your dashboard to review.</p>`,
  });

  res.status(201).json({ success: true, data: returnReq, message: "Return request submitted. You'll hear back within 2-3 business days." });
};

// GET /returns/:storeId  — owner views all
export const getReturns = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { status, page = 1, limit = 20 } = req.query as any;
  const where: any = { storeId };
  if (status) where.status = status;

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where, skip: (Number(page)-1)*Number(limit), take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true, customerName: true, total: true } } },
    }),
    prisma.returnRequest.count({ where }),
  ]);

  res.json({ success: true, data: returns, pagination: { total, page: Number(page), pages: Math.ceil(total/Number(limit)) } });
};

// PATCH /returns/:storeId/:returnId
export const updateReturn = async (req: AuthRequest, res: Response) => {
  const { storeId, returnId } = req.params;
  const { status, adminNote, trackingNumber } = req.body;

  const ret = await prisma.returnRequest.findFirst({ where: { id: returnId, storeId }, include: { order: true } });
  if (!ret) throw new AppError("Return not found", 404);

  const updated = await prisma.returnRequest.update({
    where: { id: returnId },
    data: { status, adminNote, trackingNumber, resolvedAt: ["APPROVED","REJECTED","REFUNDED"].includes(status) ? new Date() : undefined },
  });

  await emailService.send({
    to: ret.customerEmail,
    subject: `Return Update — ${ret.order.orderNumber}`,
    html: `<p>Your return request for order <strong>${ret.order.orderNumber}</strong> has been updated to: <strong>${status}</strong>.</p>${adminNote ? `<p>Note: ${adminNote}</p>` : ""}`,
  });

  res.json({ success: true, data: updated });
};

// ────────────────────────────────────────────────────────────────────────────
// Flash Sale Controller
// ────────────────────────────────────────────────────────────────────────────

const flashSaleSchema = z.object({
  name:        z.string().min(2),
  discountPct: z.number().min(1).max(100),
  productIds:  z.array(z.string()).min(1),
  startsAt:    z.string().datetime(),
  endsAt:      z.string().datetime(),
  bannerText:  z.string().optional(),
});

export const createFlashSale = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const data = flashSaleSchema.parse(req.body);

  const sale = await prisma.flashSale.create({
    data: { storeId, ...data, startsAt: new Date(data.startsAt), endsAt: new Date(data.endsAt) },
  });
  res.status(201).json({ success: true, data: sale });
};

export const getFlashSales = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const sales = await prisma.flashSale.findMany({ where: { storeId }, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: sales });
};

export const updateFlashSale = async (req: AuthRequest, res: Response) => {
  const { storeId, saleId } = req.params;
  const updated = await prisma.flashSale.update({ where: { id: saleId }, data: req.body });
  res.json({ success: true, data: updated });
};

export const deleteFlashSale = async (req: AuthRequest, res: Response) => {
  const { storeId, saleId } = req.params;
  await prisma.flashSale.deleteMany({ where: { id: saleId, storeId } });
  res.json({ success: true });
};

// Public: get active flash sales for a store
export const getActiveFlashSales = async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const now = new Date();
  const sales = await prisma.flashSale.findMany({
    where: { storeId, isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
  });
  res.json({ success: true, data: sales });
};

// ────────────────────────────────────────────────────────────────────────────
// Store Export Controller
// ────────────────────────────────────────────────────────────────────────────

export const exportStoreData = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { type } = req.query as { type?: string }; // "orders" | "products" | "customers"

  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: req.user!.userId } });
  if (!store) throw new AppError("Unauthorized", 403);

  if (type === "orders") {
    const orders = await prisma.order.findMany({
      where: { storeId }, orderBy: { createdAt: "desc" },
      include: { items: true, payment: { select: { gateway: true, status: true } } },
    });

    const rows = orders.flatMap(o => o.items.map(item => ({
      "Order Number": o.orderNumber, "Date": o.createdAt.toISOString().split("T")[0],
      "Customer Name": o.customerName, "Customer Email": o.customerEmail,
      "Product": item.name, "Qty": item.quantity, "Price": item.price, "Item Total": item.total,
      "Order Total": o.total, "Status": o.status, "Payment": o.payment?.gateway || "",
      "Tracking": o.trackingNumber || "",
    })));

    return sendCsv(res, rows, `orders-${storeId}-${Date.now()}.csv`);
  }

  if (type === "products") {
    const products = await prisma.product.findMany({ where: { storeId }, include: { variants: true } });
    const rows = products.map(p => ({
      "Name": p.name, "SKU": p.sku || "", "Price": p.price, "Compare Price": p.comparePrice || "",
      "Inventory": p.inventory, "Category": p.category || "", "Status": p.status,
      "Description": p.description || "", "Tags": p.tags.join("|"),
    }));
    return sendCsv(res, rows, `products-${storeId}-${Date.now()}.csv`);
  }

  if (type === "customers") {
    const customers = await prisma.storeCustomer.findMany({ where: { storeId }, orderBy: { totalSpent: "desc" } });
    const rows = customers.map(c => ({
      "Name": c.name, "Email": c.email, "Phone": c.phone || "",
      "Total Orders": c.orderCount, "Total Spent": c.totalSpent, "Joined": c.createdAt.toISOString().split("T")[0],
    }));
    return sendCsv(res, rows, `customers-${storeId}-${Date.now()}.csv`);
  }

  throw new AppError("type must be orders, products, or customers", 400);
};

function sendCsv(res: Response, rows: Record<string, any>[], filename: string) {
  if (!rows.length) { res.json({ success: true, data: [], message: "No data to export" }); return; }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g,'""')}"`).join(","))
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
}
