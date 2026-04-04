// ============================================================
// KAI Intelligence Controller + Routes
// Path: backend/src/controllers/kai.intelligence.controller.ts
// Add to app.ts: app.use("/api/intel", intelRoutes);
// ============================================================
import { Request, Response } from "express";
import {
  runAdSpy, generateTikTokScript, getDailyTop10,
  getProfitRules, createProfitRule, evaluateProfitRules,
  bulkScrapeSupplierStore, checkFulfillmentStatus, markOrderFulfilling,
  syncPricesAndStock, spyCompetitorStore, findSupplierAlternatives,
} from "../services/kai.intelligence.service";
import prisma from "../lib/prisma";

const wrap = (fn: Function) => async (req: Request, res: Response) => {
  try {
    const data = await fn(req);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Failed" });
  }
};

// ── Ad Spy ────────────────────────────────────────────────────
export const adSpy = wrap(async (req: Request) => {
  const { query, platform = "all", storeId } = req.body;
  if (!query) throw new Error("query required");
  const store  = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  return runAdSpy({ query, platform, country: store?.country || "NG", storeId });
});

// ── TikTok Script ─────────────────────────────────────────────
export const tikTokScript = wrap(async (req: Request) => {
  const { productName, productDesc, price, storeId, duration = 30, angle } = req.body;
  if (!productName || !price) throw new Error("productName and price required");
  const store  = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  return generateTikTokScript({ productName, productDesc, price: Number(price), country: store?.country || "NG", duration, angle });
});

// ── Daily Top 10 ──────────────────────────────────────────────
export const dailyTop10 = wrap(async (req: Request) => {
  const { storeId } = req.query as any;
  return getDailyTop10(storeId);
});

// ── Profit Rules ──────────────────────────────────────────────
export const listProfitRules = wrap(async (req: Request) => {
  return getProfitRules(req.params.storeId);
});
export const addProfitRule = wrap(async (req: Request) => {
  const { storeId, ...rule } = req.body;
  return createProfitRule(storeId, rule);
});
export const deleteProfitRule = wrap(async (req: Request) => {
  await prisma.profitProtectionRule.update({ where: { id: req.params.id }, data: { isActive: false } });
  return { deleted: true };
});
export const runProfitCheck = wrap(async (req: Request) => {
  return evaluateProfitRules(req.params.storeId);
});

// ── Bulk Import ───────────────────────────────────────────────
export const bulkImport = wrap(async (req: Request) => {
  const { storeUrl, storeId, limit } = req.body;
  if (!storeUrl) throw new Error("storeUrl required");
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  return bulkScrapeSupplierStore({ storeUrl, country: store?.country || "NG", limit: Number(limit) || 20 });
});

export const confirmBulkImport = wrap(async (req: Request) => {
  const { storeId, products, pricingRule } = req.body;
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  const { getLocale } = require("../utils/kai.locale");
  const locale = getLocale(store?.country || "NG");

  const created = await Promise.all(
    (products as any[]).map((p: any) => {
      const sellingPrice = pricingRule === "2x" ? p.localCost * 2
        : pricingRule === "2.5x" ? p.localCost * 2.5
        : pricingRule === "3x"   ? p.localCost * 3
        : p.suggestedLocalPrice || p.localCost * 2.5;

      return prisma.product.create({
        data: {
          storeId, name: p.name,
          price: Math.round(sellingPrice),
          costPrice: p.localCost,
          stockQuantity: 50,
          category: p.category || "General",
          images: p.image ? [p.image] : [],
          sourceUrl: p.supplierUrl,
          isActive: true,
        },
      }).catch(() => null);
    })
  );

  return { imported: created.filter(Boolean).length, total: products.length };
});

// ── Fulfillment ───────────────────────────────────────────────
export const fulfillmentQueue = wrap(async (req: Request) => {
  const { storeId } = req.query as any;
  return checkFulfillmentStatus(storeId);
});

export const fulfillOrder = wrap(async (req: Request) => {
  const { orderId, trackingNumber, carrier } = req.body;
  return markOrderFulfilling(orderId, trackingNumber, carrier);
});

// ── Price Sync ────────────────────────────────────────────────
export const priceSync = wrap(async (req: Request) => {
  const { storeId } = req.params;
  return syncPricesAndStock(storeId);
});

// ── Competitor Spy ────────────────────────────────────────────
export const competitorSpy = wrap(async (req: Request) => {
  const { storeUrl, storeId } = req.body;
  if (!storeUrl) throw new Error("storeUrl required");
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  return spyCompetitorStore({ storeUrl, country: store?.country || "NG" });
});

// ── Supplier Finder ───────────────────────────────────────────
export const supplierFinder = wrap(async (req: Request) => {
  const { productName, currentUrl, storeId, maxPriceUSD } = req.body;
  if (!productName) throw new Error("productName required");
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  return findSupplierAlternatives({ productName, currentUrl, country: store?.country || "NG", maxPriceUSD });
});

// ── ROUTES ────────────────────────────────────────────────────
import { Router }    from "express";
import rateLimit     from "express-rate-limit";
import { authenticate } from "../middleware/auth";

const router   = Router();
const aiLimit  = rateLimit({ windowMs: 60000, max: 10, message: { success: false, message: "Too many AI requests — wait a moment" } });

router.use(authenticate);

// Ad Spy
router.post("/ad-spy",                aiLimit, adSpy);

// TikTok Scripts
router.post("/tiktok-script",         aiLimit, tikTokScript);

// Daily Top 10
router.get ("/daily-top10",           aiLimit, dailyTop10);

// Profit Rules
router.get ("/profit-rules/:storeId", listProfitRules);
router.post("/profit-rules",          addProfitRule);
router.delete("/profit-rules/:id",    deleteProfitRule);
router.post("/profit-rules/:storeId/run", aiLimit, runProfitCheck);

// Bulk Import
router.post("/bulk-import",           aiLimit, bulkImport);
router.post("/bulk-import/confirm",   confirmBulkImport);

// Fulfillment
router.get ("/fulfillment",           fulfillmentQueue);
router.post("/fulfillment/fulfill",   fulfillOrder);

// Price Sync
router.post("/price-sync/:storeId",   aiLimit, priceSync);

// Competitor Spy
router.post("/competitor-spy",        aiLimit, competitorSpy);

// Supplier Finder
router.post("/suppliers",             aiLimit, supplierFinder);

export default router;
