// ============================================================
// DropOS — Priority Features Routes
// Path: backend/src/routes/features.routes.ts
// Add to app.ts: app.use("/api/features", featuresRoutes);
// ============================================================
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  healthScore, productGrades, atRiskCustomers,
  achievements, revenueReplay, weeklyWinners,
  priceTest, liveSales, sendComeback, setupStatus,
} from "../controllers/features.controller";

const router = Router();
router.use(authenticate);

router.get ("/health/:storeId",          healthScore);
router.get ("/product-grades/:storeId",  productGrades);
router.get ("/at-risk/:storeId",         atRiskCustomers);
router.get ("/achievements/:storeId",    achievements);
router.get ("/replay/:storeId",          revenueReplay);
router.get ("/weekly-winners/:storeId",  weeklyWinners);
router.get ("/live-sales/:storeId",      liveSales);
router.get ("/setup-status",             setupStatus);
router.post("/price-test",               priceTest);
router.post("/send-comeback",            sendComeback);

export default router;
