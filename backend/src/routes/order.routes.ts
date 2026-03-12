// src/routes/order.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createOrder, getOrders, getOrder,
  updateOrderStatus, trackOrder,
} from "../controllers/order.controller";

const router = Router();

// Public
router.post("/",                        createOrder);
router.get ("/track/:orderNumber",      trackOrder);

// Authenticated store owners
router.get ("/:storeId",                authenticate, getOrders);
router.get ("/:storeId/:orderId",       authenticate, getOrder);
router.patch("/:storeId/:orderId/status", authenticate, updateOrderStatus);

export default router;
