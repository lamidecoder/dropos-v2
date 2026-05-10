import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();
router.use(authenticate);

// GET /api/bundles/:storeId
router.get("/:storeId", async (req: any, res: Response) => {
  try {
    const bundles = await prisma.bundle.findMany({
      where: { storeId: req.params.storeId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: bundles });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bundles/:storeId
router.post("/:storeId", async (req: any, res: Response) => {
  try {
    const { name, productIds, discountPercent } = req.body;
    if (!name || !productIds?.length) return res.status(400).json({ success: false, message: "Name and products required" });

    // Get products to calculate price
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const originalPrice = products.reduce((a: number, p: any) => a + (p.price || 0), 0);
    const bundlePrice   = originalPrice * (1 - (discountPercent || 10) / 100);

    const bundle = await (prisma.bundle as any).create({
      data: { storeId: req.params.storeId, name, productIds, discountPercent: discountPercent || 10, originalPrice, bundlePrice },
    });
    res.status(201).json({ success: true, data: bundle });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/bundles/:storeId/:bundleId
router.delete("/:storeId/:bundleId", async (req: any, res: Response) => {
  try {
    await prisma.bundle.delete({ where: { id: req.params.bundleId } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
