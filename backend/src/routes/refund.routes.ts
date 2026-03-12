import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createRefund, getRefunds, processRefund, customerRequestRefund } from "../controllers/refund.controller";
const r = Router();
r.post("/customer/:orderNumber", customerRequestRefund);
r.post("/:storeId/:orderId", authenticate, createRefund);
r.get("/:storeId", authenticate, getRefunds);
r.patch("/:storeId/:refundId/process", authenticate, processRefund);
export default r;
