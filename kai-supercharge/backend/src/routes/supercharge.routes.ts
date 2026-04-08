// ============================================================
// Supercharge Routes
// Path: backend/src/routes/supercharge.routes.ts
// Add to app.ts: app.use("/api/super", superchargeRoutes);
// ============================================================
import { Router }    from "express";
import rateLimit     from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import {
  listBroadcasts, createBroadcastHandler, sendBroadcastHandler,
  generateMessageHandler, audiencePreview,
  removeBg, generateLifestyle, generateAd,
  forecast, scrapeProduct, importScrapedProduct,
} from "../controllers/supercharge.controller";

const router  = Router();
const aiLimit = rateLimit({ windowMs: 60000, max: 15, message: { success: false, message: "Rate limit" } });

router.use(authenticate);

// Broadcasts
router.get  ("/broadcasts",               listBroadcasts);
router.post ("/broadcasts",               createBroadcastHandler);
router.post ("/broadcasts/:broadcastId/send", sendBroadcastHandler);
router.post ("/broadcasts/generate",      aiLimit, generateMessageHandler);
router.get  ("/broadcasts/audience",      audiencePreview);

// Image Studio
router.post ("/images/remove-bg",         aiLimit, removeBg);
router.post ("/images/lifestyle",         aiLimit, generateLifestyle);
router.post ("/images/ad-creative",       aiLimit, generateAd);

// Forecasting
router.get  ("/forecast",                 aiLimit, forecast);

// Product Scraper
router.post ("/scrape",                   aiLimit, scrapeProduct);
router.post ("/import",                   importScrapedProduct);

export default router;
