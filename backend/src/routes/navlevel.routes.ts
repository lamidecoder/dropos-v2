import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();
router.use(authenticate);

// GET /api/nav-level/:storeId
router.get("/:storeId", async (req: any, res: Response) => {
  try {
    const storeId = req.params.storeId;
    const [productCount, orderCount, store] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId } }),
      prisma.store.findUnique({ where: { id: storeId }, select: { paystackConnected: true } }),
    ]);
    res.json({
      success: true,
      data: { productCount, orderCount, hasPaystack: store?.paystackConnected ?? false },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
