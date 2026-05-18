import { Request, Response } from "express";
import { scrapeAnyUrl, scrapeMultipleUrls, researchMarket, getTrendingProducts, calculateProfit, searchFacebookAds, spyTikTokAds, detectSaturation } from "../services/kai.scraper.service";
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

// ── POST /api/kai/fb-ads ──────────────────────────────────────────────────────
export async function fbAdsHandler(req: Request, res: Response) {
  const { product, storeId } = req.body;
  if (!product) return res.status(400).json({ success: false, message: "product required" });
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = await searchFacebookAds({ product, country: store?.country || "NG" });
    return res.json({ success: true, data: { research: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/tiktok-spy ──────────────────────────────────────────────────
export async function tiktokSpyHandler(req: Request, res: Response) {
  const { product, storeId } = req.body;
  if (!product) return res.status(400).json({ success: false, message: "product required" });
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = await spyTikTokAds({ product, country: store?.country || "NG" });
    return res.json({ success: true, data: { research: result } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/saturation ──────────────────────────────────────────────────
export async function saturationHandler(req: Request, res: Response) {
  const { product, storeId } = req.body;
  if (!product) return res.status(400).json({ success: false, message: "product required" });
  try {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
    const result = await detectSaturation({ product, country: store?.country || "NG" });
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/generate-image ──────────────────────────────────────────────
export async function generateImageHandler(req: Request, res: Response) {
  const { prompt, storeId } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: "prompt required" });

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (!replicateToken) {
    return res.status(503).json({
      success: false,
      message: "Image generation not configured. Add REPLICATE_API_TOKEN to your Render environment variables.",
    });
  }

  try {
    // Use Replicate SDXL for fast, high-quality product images
    const createRes = await fetch("https://api.replicate.com/v1/models/stability-ai/sdxl/predictions", {
      method: "POST",
      headers: { Authorization: `Token ${replicateToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: {
          prompt: `${prompt}, product photography, white background, professional, high quality, 4k`,
          negative_prompt: "blurry, low quality, watermark, text, logo",
          width: 1024, height: 1024, num_inference_steps: 30,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error((err as any).detail || "Replicate API error");
    }

    const prediction: any = await createRes.json();
    const pollUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;

    // Poll until complete (max 60s)
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(pollUrl, { headers: { Authorization: `Token ${replicateToken}` } });
      const status: any = await pollRes.json();
      if (status.status === "succeeded") {
        const url = Array.isArray(status.output) ? status.output[0] : status.output;
        return res.json({ success: true, data: { url, prompt } });
      }
      if (status.status === "failed") {
        throw new Error(status.error || "Generation failed");
      }
    }
    throw new Error("Image generation timed out");
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
