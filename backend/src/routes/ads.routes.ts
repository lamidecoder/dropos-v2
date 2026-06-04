import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { generateAdContent, getAdHistory, getTikTokAuthUrl, getMetaAuthUrl } from "../services/ads.service";

const router = Router();
router.use(authenticate);

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { storeId, productId, platform, format, goal, budget, targetAudience } = req.body;
    if (!storeId || !platform || !format || !goal)
      return res.status(400).json({ success:false, error:"storeId, platform, format, goal required" });
    const content = await generateAdContent({ storeId, productId, platform, format, goal, budget, targetAudience });
    res.json({ success:true, data:content });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/history/:storeId", async (req: Request, res: Response) => {
  try {
    const history = await getAdHistory(req.params.storeId);
    res.json({ success:true, data:history });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/connect/tiktok/:storeId", (req: Request, res: Response) => {
  const url = getTikTokAuthUrl(req.params.storeId);
  if (!url) return res.json({ success:false, error:"TikTok API not configured" });
  res.json({ success:true, data:{ url } });
});

router.get("/connect/meta/:storeId", (req: Request, res: Response) => {
  const url = getMetaAuthUrl(req.params.storeId);
  if (!url) return res.json({ success:false, error:"Meta API not configured" });
  res.json({ success:true, data:{ url } });
});

export default router;
