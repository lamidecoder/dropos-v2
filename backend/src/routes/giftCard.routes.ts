import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createGiftCard, getGiftCards, validateGiftCard, deactivateGiftCard } from "../controllers/giftCard.controller";
const r = Router();
r.post("/validate", validateGiftCard);
r.post("/:storeId", authenticate, createGiftCard);
r.get("/:storeId", authenticate, getGiftCards);
r.patch("/:storeId/:id/deactivate", authenticate, deactivateGiftCard);
export default r;
