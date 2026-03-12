// src/services/payment.service.ts
import Stripe from "stripe";
import axios from "axios";
import { calculateFee, detectGateway } from "../utils/helpers";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

// ── Stripe ────────────────────────────────────────────────────────────────────
export const createStripePaymentIntent = async (params: {
  amount:      number;
  currency:    string;
  orderId:     string;
  storeId:     string;
  customerEmail: string;
  metadata?:   Record<string, string>;
}) => {
  const { platformFee } = calculateFee(
    params.amount,
    Number(process.env.PLATFORM_FEE_PERCENT || 10)
  );

  const intent = await stripe.paymentIntents.create({
    amount:               Math.round(params.amount * 100), // cents
    currency:             params.currency.toLowerCase(),
    receipt_email:        params.customerEmail,
    metadata: {
      orderId:    params.orderId,
      storeId:    params.storeId,
      platformFee: String(platformFee),
      ...params.metadata,
    },
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
};

export const constructStripeEvent = (payload: Buffer, sig: string) => {
  try {
    return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    throw new AppError(`Stripe webhook error: ${err.message}`, 400);
  }
};

// ── Paystack ──────────────────────────────────────────────────────────────────
const PAYSTACK_BASE = "https://api.paystack.co";
const paystackHeaders = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export const initializePaystack = async (params: {
  amount:      number;
  currency:    string;
  email:       string;
  orderId:     string;
  storeId:     string;
  callbackUrl: string;
}) => {
  try {
    const { data } = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        amount:       Math.round(params.amount * 100), // kobo
        currency:     params.currency,
        email:        params.email,
        callback_url: params.callbackUrl,
        metadata: {
          orderId: params.orderId,
          storeId: params.storeId,
        },
      },
      { headers: paystackHeaders }
    );
    return { authorizationUrl: data.data.authorization_url, reference: data.data.reference };
  } catch (err: any) {
    logger.error("Paystack init error:", err.response?.data || err.message);
    throw new AppError("Failed to initialize Paystack payment", 500);
  }
};

export const verifyPaystack = async (reference: string) => {
  try {
    const { data } = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      { headers: paystackHeaders }
    );
    return data.data;
  } catch (err: any) {
    throw new AppError("Failed to verify Paystack payment", 500);
  }
};

export const verifyPaystackWebhook = (payload: string, signature: string): boolean => {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest("hex");
  return hash === signature;
};

// ── Flutterwave ───────────────────────────────────────────────────────────────
const FW_BASE = "https://api.flutterwave.com/v3";
const fwHeaders = {
  Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export const initializeFlutterwave = async (params: {
  amount:      number;
  currency:    string;
  email:       string;
  name:        string;
  phone?:      string;
  orderId:     string;
  storeId:     string;
  redirectUrl: string;
}) => {
  try {
    const { data } = await axios.post(
      `${FW_BASE}/payments`,
      {
        tx_ref:       `dropos-${params.orderId}-${Date.now()}`,
        amount:       params.amount,
        currency:     params.currency,
        redirect_url: params.redirectUrl,
        customer: {
          email:       params.email,
          phonenumber: params.phone,
          name:        params.name,
        },
        meta: { orderId: params.orderId, storeId: params.storeId },
        customizations: {
          title: process.env.PLATFORM_NAME || "DropOS",
        },
      },
      { headers: fwHeaders }
    );
    return { paymentLink: data.data.link, txRef: data.meta?.tx_ref };
  } catch (err: any) {
    logger.error("Flutterwave init error:", err.response?.data || err.message);
    throw new AppError("Failed to initialize Flutterwave payment", 500);
  }
};

export const verifyFlutterwave = async (transactionId: string) => {
  try {
    const { data } = await axios.get(
      `${FW_BASE}/transactions/${transactionId}/verify`,
      { headers: fwHeaders }
    );
    return data.data;
  } catch {
    throw new AppError("Failed to verify Flutterwave payment", 500);
  }
};

export const verifyFlutterwaveWebhook = (payload: string, signature: string): boolean => {
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha256", process.env.FLUTTERWAVE_SECRET_KEY!)
    .update(payload)
    .digest("hex");
  return hash === signature;
};

export { detectGateway, calculateFee };
