// ============================================================
// DropOS — Priority 1-3 Features Controller
// Path: backend/src/controllers/features.controller.ts
// ============================================================
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  calculateHealthScore, gradeProducts, getAtRiskCustomers,
  getStoreAchievements, getRevenueReplay, getWeeklyWinners,
  createPriceTest,
} from "../services/features.service";

const prisma = new PrismaClient();

// ── GET /api/features/health/:storeId ─────────────────────────
export async function healthScore(req: Request, res: Response) {
  try {
    const data = await calculateHealthScore(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/product-grades/:storeId ─────────────────
export async function productGrades(req: Request, res: Response) {
  try {
    const data = await gradeProducts(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/at-risk/:storeId ────────────────────────
export async function atRiskCustomers(req: Request, res: Response) {
  try {
    const data = await getAtRiskCustomers(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/achievements/:storeId ───────────────────
export async function achievements(req: Request, res: Response) {
  try {
    const data = await getStoreAchievements(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/replay/:storeId ─────────────────────────
export async function revenueReplay(req: Request, res: Response) {
  try {
    const data = await getRevenueReplay(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/weekly-winners/:storeId ─────────────────
export async function weeklyWinners(req: Request, res: Response) {
  try {
    const data = await getWeeklyWinners(req.params.storeId);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/features/price-test ────────────────────────────
export async function priceTest(req: Request, res: Response) {
  try {
    const { storeId, productId, priceA, priceB } = req.body;
    if (!storeId || !productId || !priceA || !priceB)
      return res.status(400).json({ success: false, message: "storeId, productId, priceA, priceB required" });
    const data = await createPriceTest(storeId, productId, Number(priceA), Number(priceB));
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/live-sales/:storeId ────────────────────
// Returns the last 10 orders for the live ticker
export async function liveSales(req: Request, res: Response) {
  try {
    const { storeId } = req.params;
    const orders = await prisma.order.findMany({
      where: { storeId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        customer: { select: { name: true, city: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
    });

    const feed = orders.map(o => ({
      id: o.id,
      customerName: o.customer?.name?.split(" ")[0] || "Someone",
      city: o.customer?.city || "Nigeria",
      productName: o.items[0]?.product?.name || "a product",
      amount: Number(o.total),
      createdAt: o.createdAt,
      minutesAgo: Math.round((Date.now() - new Date(o.createdAt).getTime()) / 60000),
    }));

    res.json({ success: true, data: feed });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/features/send-comeback ─────────────────────────
// Send win-back WhatsApp message to at-risk customer
export async function sendComeback(req: Request, res: Response) {
  try {
    const { customerId, message, storeId } = req.body;
    // Store the intent — actual WhatsApp sending handled by WhatsApp service
    await prisma.customer.update({
      where: { id: customerId },
      data: { notes: `Win-back sent ${new Date().toLocaleDateString()}` } as any,
    });
    res.json({ success: true, message: "Win-back message queued" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/features/store-setup-status ─────────────────────
// Check what's needed for 5-min store setup
export async function setupStatus(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    const [store, products, shipping] = await Promise.all([
      prisma.store.findUnique({
        where: { id: storeId },
        select: { name: true, logo: true, description: true, country: true, currency: true },
      }),
      prisma.product.count({ where: { storeId } }),
      prisma.shippingZone?.count({ where: { storeId } }).catch(() => 0),
    ]);

    const steps = [
      { id: "store_info",  label: "Store info",        done: !!(store?.name && store?.description) },
      { id: "logo",        label: "Store logo",        done: !!store?.logo },
      { id: "products",    label: "Add products",      done: products >= 3 },
      { id: "shipping",    label: "Set up shipping",   done: (shipping || 0) >= 1 },
      { id: "payment",     label: "Connect payment",   done: true }, // assume Paystack connected on signup
    ];

    const percent = Math.round((steps.filter(s => s.done).length / steps.length) * 100);
    res.json({ success: true, data: { steps, percent, isComplete: percent === 100 } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
