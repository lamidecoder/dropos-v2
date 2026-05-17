import { Request, Response } from "express";
import { scrapeAnyUrl, scrapeMultipleUrls, researchMarket, getTrendingProducts, calculateProfit } from "../services/kai.scraper.service";
import { generateMorningBrief } from "../services/kai.memory.service";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// ── POST /api/kai/scrape-url ──────────────────────────────────────────────────
export async function scrapeUrlHandler(req: Request, res: Response) {
  const { url, storeId } = req.body;
  if (!url) return res.status(400).json({ success: false, message: "url required" });
  if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true, currency: true } });
    const product = await scrapeAnyUrl(url, store?.country || "NG", store?.currency || "NGN");
    return res.json({ success: true, data: product });
  } catch (err: any) {
    const msg = err.message?.includes("restricted") || err.message?.includes("login")
      ? "That page requires login or is restricted. Try pasting the product URL directly from the browser."
      : err.message?.includes("extract")
      ? "Couldn't extract product data. Make sure it's a direct product page URL, not a search results page."
      : "Couldn't scrape that URL. Try a different product page.";
    return res.status(422).json({ success: false, message: msg });
  }
}

// ── POST /api/kai/scrape-batch ────────────────────────────────────────────────
export async function scrapeBatchHandler(req: Request, res: Response) {
  const { urls, storeId } = req.body;
  if (!urls?.length) return res.status(400).json({ success: false, message: "urls array required" });
  if (urls.length > 10) return res.status(400).json({ success: false, message: "Max 10 URLs at once" });

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true, currency: true } });
    const results = await scrapeMultipleUrls(urls, store?.country || "NG", store?.currency || "NGN");
    return res.json({ success: true, data: results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/research-market ─────────────────────────────────────────────
export async function researchTopicHandler(req: Request, res: Response) {
  const { query, storeId } = req.body;
  if (!query) return res.status(400).json({ success: false, message: "query required" });

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = await researchMarket(query, store?.country || "NG");
    return res.json({ success: true, data: { research: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/trending ─────────────────────────────────────────────────────
export async function trendingHandler(req: Request, res: Response) {
  const { storeId, niche } = req.query as any;

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = await getTrendingProducts(store?.country || "NG", niche);
    return res.json({ success: true, data: { trending: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/profit-calc ─────────────────────────────────────────────────
export async function profitCalcHandler(req: Request, res: Response) {
  const { supplierPriceUSD, sellingPriceLocal, shippingCostLocal, adSpendPerSaleLocal, storeId } = req.body;

  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = calculateProfit({
      supplierPriceUSD:    Number(supplierPriceUSD || 0),
      sellingPriceLocal:   Number(sellingPriceLocal || 0),
      shippingCostLocal:   Number(shippingCostLocal || 0),
      adSpendPerSaleLocal: Number(adSpendPerSaleLocal || 0),
      country:             store?.country || "NG",
    });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/morning-brief ────────────────────────────────────────────────
export async function getMorningBriefHandler(req: Request, res: Response) {
  const { storeId } = req.query as any;
  if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });

  try {
    const opportunity = await generateMorningBrief(storeId, apiKey());
    return res.json({ success: true, data: { opportunity } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
