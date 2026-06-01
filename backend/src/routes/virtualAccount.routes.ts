import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getOrCreateVirtualAccount } from "../services/virtualAccount.service";

const router = Router();
router.use(authenticate);

// GET /api/virtual-account/:storeId — get or create virtual account
router.get("/:storeId", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const user = (req as any).user;
    const va = await getOrCreateVirtualAccount(storeId, user.name || user.email, user.email);
    res.json({ success: true, data: va });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/virtual-account/:storeId/create — force create
router.post("/:storeId/create", async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const user = (req as any).user;
    const va = await getOrCreateVirtualAccount(storeId, user.name || user.email, user.email);
    res.json({ success: true, data: va });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
