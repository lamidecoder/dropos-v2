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


// Virtual dedicated account endpoints
router.get("/virtual-account/:storeId", authenticate, async (req, res) => {
  const { prisma } = require("../config/database");
  const store = await prisma.store.findUnique({
    where: { id: req.params.storeId },
    select: { virtualAccountNumber: true, virtualAccountBank: true, virtualAccountName: true } as any,
  }).catch(() => null);
  if (!store?.virtualAccountNumber) return res.json({ success: true, data: null });
  return res.json({ success: true, data: {
    accountNumber: store.virtualAccountNumber,
    bankName:      store.virtualAccountBank || "Wema Bank",
    accountName:   store.virtualAccountName,
  } });
});

router.post("/virtual-account/:storeId", authenticate, async (req, res) => {
  const PAYSTACK_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_KEY) return res.status(400).json({ success: false, message: "Paystack not configured" });
  
  const { prisma } = require("../config/database");
  const { name, email } = req.body;
  const storeId = req.params.storeId;

  try {
    // Create Paystack dedicated virtual account
    const paystackRes = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: { Authorization: `Bearer ${PAYSTACK_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ customer: email, first_name: name?.split(" ")[0], last_name: name?.split(" ")[1] || "", preferred_bank: "wema-bank" }),
    });
    const paystackData: any = await paystackRes.json();

    if (!paystackData.status) {
      return res.status(400).json({ success: false, message: paystackData.message || "Could not create virtual account" });
    }

    const acct = paystackData.data;
    await prisma.store.update({
      where: { id: storeId },
      data: {
        virtualAccountNumber: acct.account_number,
        virtualAccountBank:   acct.bank?.name || "Wema Bank",
        virtualAccountName:   acct.account_name,
      } as any,
    });

    return res.json({ success: true, data: { accountNumber: acct.account_number, bankName: acct.bank?.name, accountName: acct.account_name } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Failed" });
  }
});

export default router;