// src/routes/payment.routes.ts
import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { paymentRateLimiter } from "../middleware/rateLimiter";
import {
  initializePayment, verifyPayment,
  stripeWebhook, paystackWebhook, flutterwaveWebhook,
  getAllPayments,
} from "../controllers/payment.controller";

const router = Router();

// Webhooks (raw body already configured in app.ts)
router.post("/webhook/stripe",         stripeWebhook);
router.post("/webhook/paystack",       paystackWebhook);
router.post("/webhook/flutterwave",    flutterwaveWebhook);

// Public checkout
router.post("/initialize",             paymentRateLimiter, initializePayment);
router.get ("/verify",                 verifyPayment);

// Admin only
router.get ("/admin/all",              authenticate, requireAdmin, getAllPayments);

export default router;
