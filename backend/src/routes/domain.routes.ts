import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { searchDomains, getDomainPrice, registerDomain, getStoreDomains, renewDomain } from "../services/domain.service";

const router = Router();
router.use(authenticate);

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success:false, error:"Query required" });
    const results = await searchDomains(String(q));
    res.json({ success:true, data:results });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/price", async (req: Request, res: Response) => {
  try {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ success:false, error:"domain required" });
    const price = await getDomainPrice(String(domain));
    res.json({ success:true, data:price });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.get("/store/:storeId", async (req: Request, res: Response) => {
  try {
    const domains = await getStoreDomains(req.params.storeId);
    res.json({ success:true, data:domains });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const result = await registerDomain(req.body);
    res.json({ success: result.success, data:result, error:result.error });
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

router.post("/renew", async (req: Request, res: Response) => {
  try {
    const { domain, years } = req.body;
    const result = await renewDomain(domain, years);
    res.json(result);
  } catch (e:any) { res.status(500).json({ success:false, error:e.message }); }
});

export default router;
