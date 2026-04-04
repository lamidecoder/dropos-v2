// src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";
import { AppError } from "../utils/AppError";

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

export const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 hour
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many payment requests." },
});
