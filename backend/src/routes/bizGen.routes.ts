import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { generateBusiness, applyGeneratedBusiness, importGeneratedProducts } from "../services/bizGenerator.service";

const router = Router();
router.use(authenticate);

// Generate a complete business idea
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { interest, budget, experience, location } = req.body;
    const user    = (req as any).user;
    const result  = await generateBusiness({ userId:user.userId, interest, budget, experience, location });
    res.json({ success:true, data:result });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// Apply the generated business to a store
router.post("/apply/:storeId", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const { business } = req.body;
    await applyGeneratedBusiness(storeId, business);
    res.json({ success:true, message:"Business identity applied" });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

// Import all suggested products
router.post("/import-products/:storeId", async (req: Request, res: Response) => {
  try {
    const { storeId }  = req.params;
    const { products } = req.body;
    const user         = (req as any).user;
    const result       = await importGeneratedProducts(storeId, products, user.userId);
    res.json({ success:true, data:result });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

export default router;
