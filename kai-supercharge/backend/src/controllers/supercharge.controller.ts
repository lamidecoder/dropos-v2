// ============================================================
// Supercharge Controller
// Path: backend/src/controllers/supercharge.controller.ts
// ============================================================
import { Request, Response } from "express";
import { PrismaClient }         from "@prisma/client";
import { createBroadcast, getBroadcasts, sendBroadcastNow, generateBroadcastMessage, getAudience } from "../services/broadcast.service";
import { removeBackground, generateLifestyleImage, generateAdCreative, cloudinaryRemoveBg } from "../services/image.studio.service";
import { generateForecast, scrapeProductFromUrl } from "../services/forecast.service";

const prisma  = new PrismaClient();
const apiKey  = () => process.env.ANTHROPIC_API_KEY || "";
const repKey  = () => process.env.REPLICATE_API_TOKEN || "";

// ── Broadcasts ─────────────────────────────────────────────────
export async function listBroadcasts(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    const data = await getBroadcasts(storeId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function createBroadcastHandler(req: Request, res: Response) {
  try {
    const { storeId, message, segment, scheduledAt } = req.body;
    const data = await createBroadcast(storeId, { message, segment, scheduledAt });
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function sendBroadcastHandler(req: Request, res: Response) {
  try {
    const { broadcastId } = req.params;
    const result = await sendBroadcastNow(broadcastId);
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function generateMessageHandler(req: Request, res: Response) {
  try {
    const { storeId, type, productName, discount } = req.body;
    const message = await generateBroadcastMessage({ storeId, type, productName, discount, apiKey: apiKey() });
    res.json({ success: true, data: { message } });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function audiencePreview(req: Request, res: Response) {
  try {
    const { storeId, segment } = req.query as { storeId: string; segment: string };
    const audience = await getAudience(storeId, segment);
    res.json({ success: true, data: { count: audience.length, preview: audience.slice(0, 5) } });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

// ── Image Studio ───────────────────────────────────────────────
export async function removeBg(req: Request, res: Response) {
  try {
    const { imageUrl } = req.body;
    let result: string;

    if (repKey()) {
      result = await removeBackground(imageUrl, repKey());
    } else {
      result = await cloudinaryRemoveBg(imageUrl);
    }
    res.json({ success: true, data: { url: result } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function generateLifestyle(req: Request, res: Response) {
  try {
    if (!repKey()) return res.status(503).json({ success: false, message: "REPLICATE_API_TOKEN not configured. Add it to Render env vars.", setupUrl: "https://replicate.com" });

    const { imageUrl, backgroundStyle, productName } = req.body;
    const url = await generateLifestyleImage({ productImageUrl: imageUrl, backgroundStyle, productName, replicateKey: repKey() });
    res.json({ success: true, data: { url } });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function generateAd(req: Request, res: Response) {
  try {
    if (!repKey()) return res.status(503).json({ success: false, message: "REPLICATE_API_TOKEN not configured.", setupUrl: "https://replicate.com" });

    const { productName, hook, backgroundColor } = req.body;
    const url = await generateAdCreative({ productName, hook, backgroundColor, replicateKey: repKey() });
    res.json({ success: true, data: { url } });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

// ── Forecasting ────────────────────────────────────────────────
export async function forecast(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    const data = await generateForecast(storeId, apiKey());
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

// ── Product Scraper ────────────────────────────────────────────
export async function scrapeProduct(req: Request, res: Response) {
  try {
    const { url, storeId } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "URL required" });

    const user = (req as any).user;
    const store = await prisma.store.findFirst({
      where: { ownerId: user?.id },
      select: { country: true },
    });

    const data = await scrapeProductFromUrl(url, store?.country || "NG", apiKey());
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

// ── Import scraped product ────────────────────────────────────
export async function importScrapedProduct(req: Request, res: Response) {
  try {
    const { storeId, product } = req.body;
    const created = await prisma.product.create({
      data: {
        storeId,
        name: product.name,
        description: product.description,
        price: Number(product.sellingPrice || product.suggestedLocalPrice?.replace(/[^\d]/g, "") || 0),
        costPrice: Number(product.supplierCostLocal || 0),
        stockQuantity: 50,
        category: product.category || "General",
        tags: product.tags || [],
        images: product.images || [],
        sourceUrl: product.supplierUrl,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        isActive: true,
      },
    });
    res.json({ success: true, data: created });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}
