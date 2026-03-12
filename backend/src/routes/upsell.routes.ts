// src/routes/upsell.routes.ts
import { Router } from "express";
import { getUpsellProducts, getFrequentlyBoughtTogether, getCartUpsell } from "../controllers/upsell.controller";

const r = Router();

// All public — no auth needed
r.get ("/:storeId/:productId/related",              getUpsellProducts);
r.get ("/:storeId/:productId/bought-together",      getFrequentlyBoughtTogether);
r.post("/:storeId/cart-suggestions",                getCartUpsell);

export default r;
