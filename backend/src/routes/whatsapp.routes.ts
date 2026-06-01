import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { generateWhatsAppLink, generateBroadcastMessage } from "../services/whatsappCommerce.service";

const router = Router();
router.use(authenticate);

// POST /api/whatsapp/link — generate WhatsApp share link
router.post("/link", async (req: Request, res: Response) => {
  try {
    const { storeId, productId, customMessage, discount } = req.body;
    const result = await generateWhatsAppLink(storeId, { storeSlug:"", productId, customMessage, discount });
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/whatsapp/broadcast — generate broadcast message
router.post("/broadcast", async (req: Request, res: Response) => {
  try {
    const { storeId, type, options } = req.body;
    const result = await generateBroadcastMessage(storeId, type, options || {});
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
