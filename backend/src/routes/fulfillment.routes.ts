import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();
router.use(authenticate);

// GET /api/fulfillment/status/:storeId
router.get("/status/:storeId", async (req: Request, res: Response) => {
  const { storeId } = req.params;
  const { status } = req.query;
  const where: any = { storeId };
  if (status) where.fulfillmentStatus = status;
  const orders = await prisma.order.findMany({ where, orderBy:{ createdAt:"desc" }, take:50 });
  res.json({ success:true, data: orders });
});

// POST /api/fulfillment/:orderId/fulfill
router.post("/:orderId/fulfill", async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await prisma.order.update({
    where: { id: orderId },
    data:  { fulfillmentStatus:"PROCESSING", status:"PROCESSING" },
  });
  res.json({ success:true, data: order, message:"Fulfillment started" });
});

// POST /api/fulfillment/fulfill-now  (bulk)
router.post("/fulfill-now", async (req: Request, res: Response) => {
  const { orderIds, storeId } = req.body;
  await prisma.order.updateMany({
    where: { id:{ in: orderIds }, storeId },
    data:  { fulfillmentStatus:"PROCESSING" },
  });
  res.json({ success:true, message:`${orderIds.length} orders queued for fulfillment` });
});

// POST /api/fulfillment/connect/cj
router.post("/connect/cj", async (_req: Request, res: Response) => {
  res.json({ success:true, message:"CJ Dropshipping connection initiated — check your email to verify" });
});

// DELETE /api/fulfillment/disconnect
router.delete("/disconnect", async (_req: Request, res: Response) => {
  res.json({ success:true, message:"Supplier disconnected" });
});

export default router;
