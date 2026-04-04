// backend/src/routes/waitlist.routes.ts
import { Router } from "express";
import {
  joinWaitlist,
  getWaitlistStats,
  getWaitlistEntries,
  deleteWaitlistEntry,
  resendWaitlistEmail,
} from "../controllers/waitlist.controller";
import { authenticate } from "../middleware/auth";
import rateLimit from "express-rate-limit";

const router = Router();

const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      100, // raise for testing, lower to 5 in production
  message:  { success: false, message: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// Public
router.post("/",      waitlistLimiter, joinWaitlist);
router.get( "/stats", getWaitlistStats);

// Admin — requires login
router.get(   "/admin",           authenticate, getWaitlistEntries);
router.delete("/admin/:id",       authenticate, deleteWaitlistEntry);
router.post(  "/admin/:id/resend",authenticate, resendWaitlistEmail);

export default router;