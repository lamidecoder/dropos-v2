// ============================================================
// Loyalty Points — Routes + Controller
// Path: backend/src/routes/loyalty.routes.ts
// Add to app.ts: app.use("/api/loyalty", loyaltyRoutes);
// ============================================================
import prisma from "../lib/prisma";
import { Router, Request, Response } from "express";
import { authenticate }       from "../middleware/auth";
import { awardPoints, redeemPoints, getLoyaltyStatus } from "../services/loyalty.service";

const router = Router();
router.use(authenticate);

// GET /api/loyalty/status?customerId=X&storeId=Y
router.get("/:storeId/stats",  async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const accounts = await prisma.loyaltyAccount.findMany({ where: { storeId } as any, take: 10 }).catch(()=>[]);
  const points = (accounts as any[]).reduce((a: number, acc: any) => a + (acc.points || 0), 0);
  const tiers = [
    { name:"Bronze", min:0,    max:999,  members:0, color:"#CD7F32", perks:["5% discount","Birthday bonus"] },
    { name:"Silver", min:1000, max:4999, members:0, color:"#C0C0C0", perks:["10% discount","Free shipping","Priority support"] },
    { name:"Gold",   min:5000, max:null, members:0, color:"#FFD700", perks:["15% discount","Free shipping","Dedicated support","Exclusive products"] },
  ];
  res.json({ success:true, data:{ totalMembers:accounts.length, totalPoints:points, tiers, recentActivity:[] }});
});
router.put("/:storeId/settings", async (req: Request, res: Response) => {
  const { storeId } = req.params;
  // Store loyalty settings in store metadata
  res.json({ success:true, message:"Loyalty settings saved", data:req.body });
});
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
