import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

const router = Router();
router.use(authenticate);

// POST /api/intel/bulk-import  — scan URL for products
router.post("/bulk-import", async (req: Request, res: Response) => {
  const { url, storeId } = req.body;
  if (!url) throw new AppError("URL required", 400);
  // Return mock preview — real scraper would call AliExpress/CJ API
  const preview = Array.from({ length: 12 }, (_, i) => ({
    id:       `preview_${i}`,
    name:     `Product ${i + 1} from import`,
    price:    Math.floor(Math.random() * 50000) + 5000,
    image:    `https://images.unsplash.com/photo-${1523275335684 + i * 111}?w=300&h=300&fit=crop`,
    supplier: url.includes("aliexpress") ? "AliExpress" : url.includes("cj") ? "CJ Dropshipping" : "Zendrop",
    selected: true,
  }));
  res.json({ success:true, data:{ products: preview, total: preview.length, source: url } });
});

// POST /api/intel/bulk-import/confirm  — actually import selected products
router.post("/bulk-import/confirm", async (req: Request, res: Response) => {
  const { products, storeId } = req.body;
  if (!products?.length) throw new AppError("No products to import", 400);
  const created = await Promise.all(
    products.slice(0, 50).map((p: any) =>
      (prisma.product as any).create({
        data: {
          storeId,
          name:        p.name || "Imported Product",
          price:       p.price || 0,
          description: p.description || "Imported from supplier",
          images:      p.image ? [p.image] : [],
          status:      "ACTIVE",
          inventory:   100,
        },
      }).catch(() => null)
    )
  );
  const imported = created.filter(Boolean).length;
  res.json({ success:true, message:`${imported} products imported successfully`, data:{ imported } });
});

export default router;
