// ============================================================
// KAI — Power Features Controller
// Path: backend/src/controllers/kai.power.controller.ts
// ============================================================
import { Request, Response } from "express";
import {
  generateProductPage, generateAdCopy, getWinningProducts,
  calculateProfit, researchNiche, analyzeCompetitor,
  analyzeBuyerMotivation,
} from "../services/kai.power.service";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// POST /api/kai/power/product-page
export async function productPage(req: Request, res: Response) {
  try {
    const { url, productName, productDescription, language = "English", niche } = req.body;
    const user = (req as any).user;
    const storeId = user?.stores?.[0]?.id;

    // Get store country
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true, currency: true } });
    const country = store?.country || "NG";

    const page = await generateProductPage({ url, productName, productDescription, country, language, niche, apiKey: apiKey() });
    res.json({ success: true, data: page });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/kai/power/ad-copy
export async function adCopy(req: Request, res: Response) {
  try {
    const { productName, productDescription, targetAudience, platform, angle } = req.body;
    if (!productName || !platform)
      return res.status(400).json({ success: false, message: "productName and platform required" });

    const user = (req as any).user;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true } });

    const copy = await generateAdCopy({
      productName, productDescription: productDescription || productName,
      targetAudience: targetAudience || "general audience",
      platform, country: store?.country || "NG", angle, apiKey: apiKey(),
    });
    res.json({ success: true, data: copy });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/kai/power/winning-products
export async function winningProducts(req: Request, res: Response) {
  try {
    const { storeId, niche, count = 10 } = req.query as any;
    const user = (req as any).user;

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true } });

    const products = await getWinningProducts({
      storeId: storeId || user?.stores?.[0]?.id,
      niche, country: store?.country || "NG",
      count: Math.min(Number(count), 20),
      apiKey: apiKey(),
    });
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/kai/power/profit-calc
export async function profitCalc(req: Request, res: Response) {
  try {
    const { supplierCostUSD, shippingCostLocal, sellingPriceLocal, adSpendDaily, expectedConversionRate } = req.body;
    if (!supplierCostUSD || !sellingPriceLocal)
      return res.status(400).json({ success: false, message: "supplierCostUSD and sellingPriceLocal required" });

    const user = (req as any).user;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true } });

    // Get forex rate from market cache
    const cache = await prisma.kaiMarketCache.findUnique({ where: { key: "forex_rates" } });
    const rates = cache?.data as any || {};
    const country = store?.country || "NG";
    const exchangeRate = country === "NG" ? (rates.NGN || 1580)
      : country === "GH" ? (rates.GHS || 15.2)
      : country === "KE" ? (rates.KES || 130)
      : 1;

    const result = calculateProfit({
      supplierCostUSD: Number(supplierCostUSD),
      shippingCostLocal: Number(shippingCostLocal || 0),
      sellingPriceLocal: Number(sellingPriceLocal),
      exchangeRate,
      country,
      adSpendDaily: adSpendDaily ? Number(adSpendDaily) : undefined,
      expectedConversionRate: expectedConversionRate ? Number(expectedConversionRate) : undefined,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/kai/power/niche-research
export async function nicheResearch(req: Request, res: Response) {
  try {
    const { niche } = req.body;
    if (!niche) return res.status(400).json({ success: false, message: "niche required" });

    const user = (req as any).user;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true } });

    const research = await researchNiche({ niche, country: store?.country || "NG", apiKey: apiKey() });
    res.json({ success: true, data: research });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/kai/power/competitor
export async function competitorAnalysis(req: Request, res: Response) {
  try {
    const { storeUrl } = req.body;
    if (!storeUrl) return res.status(400).json({ success: false, message: "storeUrl required" });

    const user = (req as any).user;
    const analysis = await analyzeCompetitor({ storeUrl, storeId: user?.stores?.[0]?.id, apiKey: apiKey() });
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/kai/power/buyer-motivation
export async function buyerMotivation(req: Request, res: Response) {
  try {
    const { productName } = req.body;
    if (!productName) return res.status(400).json({ success: false, message: "productName required" });

    const user = (req as any).user;
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findFirst({ where: { ownerId: user?.id }, select: { country: true } });

    const analysis = await analyzeBuyerMotivation({ productName, country: store?.country || "NG", apiKey: apiKey() });
    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
