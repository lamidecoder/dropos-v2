// ============================================================
// KAI — Power Features Routes
// Path: backend/src/routes/kai.power.routes.ts
// Add to app.ts: app.use("/api/kai/power", kaiPowerRoutes);
// ============================================================
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import {
  productPage, adCopy, winningProducts,
  profitCalc, nicheResearch, competitorAnalysis, buyerMotivation,
} from "../controllers/kai.power.controller";

const router = Router();

// These calls use Claude Sonnet — limit more strictly
const powerLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: "Rate limit reached — wait a moment" },
});

router.use(authenticate);

router.post("/product-page",      powerLimit, productPage);
router.post("/ad-copy",           powerLimit, adCopy);
router.get ("/winning-products",  powerLimit, winningProducts);
router.post("/profit-calc",       profitCalc);   // no limit — pure calculation
router.post("/niche-research",    powerLimit, nicheResearch);
router.post("/competitor",        powerLimit, competitorAnalysis);
router.post("/buyer-motivation",  powerLimit, buyerMotivation);

export default router;
