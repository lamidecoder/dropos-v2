// ============================================================
// Loyalty Points — Routes + Controller
// Path: backend/src/routes/loyalty.routes.ts
// Add to app.ts: app.use("/api/loyalty", loyaltyRoutes);
// ============================================================
import { Router, Request, Response } from "express";
import { authenticate }       from "../middleware/auth";
import { awardPoints, redeemPoints, getLoyaltyStatus } from "../services/loyalty.service";

const router = Router();
router.use(authenticate);

// GET /api/loyalty/status?customerId=X&storeId=Y
router.get("/status", async (req: Request, res: Response) => {
  try {
    const { customerId, storeId } = req.query as { customerId: string; storeId: string };
    const data = await getLoyaltyStatus(customerId, storeId);
    res.json({ success: true, data });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/loyalty/award (called internally after order paid)
router.post("/award", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    await awardPoints(orderId);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/loyalty/redeem
router.post("/redeem", async (req: Request, res: Response) => {
  try {
    const { customerId, storeId, pointsToRedeem, orderId } = req.body;
    const result = await redeemPoints({ customerId, storeId, pointsToRedeem: Number(pointsToRedeem), orderId });
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
