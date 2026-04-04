// src/routes/payment.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { paymentRateLimiter } from "../middleware/rateLimiter";
import {
  initializePayment, verifyPayment,
  stripeWebhook, paystackWebhook, flutterwaveWebhook,
  getAllPayments,
} from "../controllers/payment.controller";

const router = Router();

// Webhooks
router.post("/webhook/stripe",      stripeWebhook);
router.post("/webhook/paystack",    paystackWebhook);
router.post("/webhook/flutterwave", flutterwaveWebhook);

// Public checkout
router.post("/initialize",          paymentRateLimiter, initializePayment);
router.get ("/verify",              verifyPayment);

// Admin
router.get ("/admin/all",           authenticate, getAllPayments);

export default router;