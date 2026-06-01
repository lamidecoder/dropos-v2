import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { getDeliveryQuotes, bookDelivery, trackDelivery } from "../services/delivery.service";

const router = Router();
router.use(authenticate);

// GET /api/delivery/quotes — get price quotes
router.get("/quotes", async (req: Request, res: Response) => {
  try {
    const { pickupLga, deliveryLga, packageValue } = req.query;
    const quotes = await getDeliveryQuotes(
      pickupLga as string || "Lagos",
      deliveryLga as string || "Lagos",
      Number(packageValue) || 5000
    );
    res.json({ success: true, data: quotes });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POST /api/delivery/book — book a rider
router.post("/book", async (req: Request, res: Response) => {
  try {
    const result = await bookDelivery(req.body);
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// GET /api/delivery/track/:bookingId — track a delivery
router.get("/track/:bookingId", async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { provider } = req.query;
    const result = await trackDelivery(bookingId, (provider as any) || "gig");
    res.json({ success: true, data: result });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
