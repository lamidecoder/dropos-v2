// ============================================================
// Product Intel Controller + Routes
// Path: backend/src/controllers/product.intel.controller.ts
// ============================================================
import { Request, Response } from "express";
import { analyseProductFull, importReviewsFromUrl, generateMarketingAngles } from "../services/kai.product.intel.service";
import { scrapeProductFromUrl } from "../services/forecast.service";
import prisma from "../lib/prisma";

// ── POST /api/products/analyse ────────────────────────────────
// Scrape + Score + Angles in one call
export async function analyseProduct(req: Request, res: Response) {
  try {
    const { url, storeId } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "URL required" });

    const store = await prisma.store.findUnique({
      where:  { id: storeId },
      select: { country: true },
    });

    const apiKey = process.env.ANTHROPIC_API_KEY || "";

    // Step 1: Scrape the product
    const scrapedData = await scrapeProductFromUrl(url, store?.country || "NG", apiKey);

    // Step 2: Score + Angles in parallel
    const result = await analyseProductFull({ url, storeId, scrapedData });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || "Analysis failed" });
  }
}

// ── POST /api/products/angles ─────────────────────────────────
// Generate angles for an already-scraped product
export async function getAngles(req: Request, res: Response) {
  try {
    const { productName, productDesc, category, country } = req.body;
    const angles = await generateMarketingAngles({ productName, productDesc, category, country });
    res.json({ success: true, data: angles });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/products/import-reviews ────────────────────────
export async function importReviews(req: Request, res: Response) {
  try {
    const { url, storeId, productId, count } = req.body;
    if (!url || !productId) return res.status(400).json({ success: false, message: "url and productId required" });

    const result = await importReviewsFromUrl({ url, storeId, productId, count });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/products/import-confirmed ──────────────────────
// Full import: scrape → confirm angle → save product + reviews
export async function importConfirmed(req: Request, res: Response) {
  try {
    const { storeId, scrapedData, selectedAngle, sellingPrice, importReviews: doReviews } = req.body;
    const user = (req as any).user;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: user.id },
      select: { id: true, country: true },
    });
    if (!store) return res.status(403).json({ success: false, message: "Not your store" });

    // Create the product
    const product = await prisma.product.create({
      data: {
        storeId,
        name:          scrapedData.name,
        description:   scrapedData.description,
        shortDesc:     scrapedData.shortDescription,
        price:         Number(sellingPrice || scrapedData.suggestedLocalPrice?.replace(/[^\d]/g, "") || 0),
        costPrice:     scrapedData.supplierCostLocal || 0,
        stockQuantity: 50,
        category:      scrapedData.category || "General",
        tags:          scrapedData.tags || [],
        images:        scrapedData.images || [],
        sourceUrl:     scrapedData.supplierUrl,
        seoTitle:      scrapedData.seoTitle,
        seoDescription: scrapedData.seoDescription,
        isActive:      true,
        metadata: {
          angle:           selectedAngle,
          bulletPoints:    scrapedData.bulletPoints,
          specifications:  scrapedData.specifications,
          importedAt:      new Date().toISOString(),
          supplierName:    scrapedData.supplierName,
          whyItSells:      scrapedData.whyItSells,
        } as any,
      },
    });

    let reviewsImported = 0;

    // Import reviews if requested
    if (doReviews && scrapedData.supplierUrl) {
      const apiKey = process.env.ANTHROPIC_API_KEY || "";
      const reviewResult = await importReviewsFromUrl({
        url:       scrapedData.supplierUrl,
        storeId,
        productId: product.id,
        count:     8,
      });
      reviewsImported = reviewResult.imported;
    }

    res.json({
      success: true,
      data: { product, reviewsImported },
      message: `Product added${reviewsImported > 0 ? ` with ${reviewsImported} imported reviews` : ""}`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── Routes ────────────────────────────────────────────────────
import { Router }    from "express";
import { authenticate } from "../middleware/auth";
import rateLimit     from "express-rate-limit";

const router   = Router();
const aiLimit  = rateLimit({ windowMs: 60000, max: 10 });

router.use(authenticate);
router.post("/analyse",          aiLimit, analyseProduct);
router.post("/angles",           aiLimit, getAngles);
router.post("/import-reviews",   aiLimit, importReviews);
router.post("/import-confirmed",          importConfirmed);

export default router;

// Add to app.ts:
// import productIntelRoutes from "./controllers/product.intel.controller";
// app.use("/api/products/intel", productIntelRoutes);
