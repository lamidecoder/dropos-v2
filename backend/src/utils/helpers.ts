// src/utils/helpers.ts
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Generate order number e.g. ORD-20250728-7821
export const generateOrderNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${date}-${rand}`;
};

// Generate secure random token
export const generateToken = (bytes = 32): string => {
  return crypto.randomBytes(bytes).toString("hex");
};

// Slugify a string
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Calculate platform fee
export const calculateFee = (amount: number, feePercent: number) => {
  const platformFee   = parseFloat((amount * (feePercent / 100)).toFixed(2));
  const storeEarnings = parseFloat((amount - platformFee).toFixed(2));
  return { platformFee, storeEarnings };
};

// Detect payment gateway by country/IP
export const detectGateway = (country?: string): "STRIPE" | "PAYSTACK" | "FLUTTERWAVE" => {
  const africaPaystack = ["NG", "GH", "ZA", "KE"];
  const africaFlutter  = ["EG", "ET", "TZ", "UG", "RW", "CM", "CI", "SN"];
  if (country && africaPaystack.includes(country.toUpperCase())) return "PAYSTACK";
  if (country && africaFlutter.includes(country.toUpperCase()))  return "FLUTTERWAVE";
  return "STRIPE";
};

// Paginate helper
export const paginate = (page = 1, limit = 20) => {
  const take = Math.min(limit, 100);
  const skip = (Math.max(page, 1) - 1) * take;
  return { take, skip };
};

// API response helper
export const sendSuccess = (res: any, data: any, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res: any, message: string, statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

// Sanitize user object (remove password)
export const sanitizeUser = (user: any) => {
  const { password, refreshToken, emailVerifyToken, passwordResetToken, twoFASecret, ...safe } = user;
  return safe;
};
