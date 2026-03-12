// src/routes/abandonedCart.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  saveAbandonedCart,
  recoverCart,
  sendAbandonedCartReminders,
  getAbandonedCarts,
  deleteAbandonedCart,
  resendRecoveryEmail,
} from "../controllers/abandonedCart.controller";

const router = Router();

// Public — called by storefront JS (no auth needed)
router.post("/save",                    saveAbandonedCart);
router.get ("/recover/:token",          recoverCart);

// Internal trigger (protect with secret header or cron auth in production)
router.post("/send-reminders",          sendAbandonedCartReminders);

// Dashboard — authenticated
router.get ("/:storeId",                authenticate, getAbandonedCarts);
router.post("/:storeId/resend/:cartId", authenticate, resendRecoveryEmail);
router.delete("/:storeId/:cartId",      authenticate, deleteAbandonedCart);

export default router;
