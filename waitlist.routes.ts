// backend/src/routes/waitlist.routes.ts
import { Router } from "express";
import { joinWaitlist, getWaitlistStats } from "../controllers/waitlist.controller";
import rateLimit from "express-rate-limit";

const router = Router();

// Extra rate limit at route level (belt + suspenders)
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max:      5,
  message:  { success: false, message: "Too many requests. Try again later." },
  standardHeaders: true,
  legacyHeaders:   false,
});

router.post("/",      waitlistLimiter, joinWaitlist);
router.get( "/stats", getWaitlistStats);

export default router;

// Admin route — protect with requireAuth + requireAdmin middleware
import { requireAuth } from "../middleware/auth.middleware";
router.get("/admin", requireAuth, getWaitlistEntries);
