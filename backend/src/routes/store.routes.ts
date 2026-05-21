// backend/src/routes/store.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createStore, getMyStores, getStore,
  updateStore, deleteStore, updateDomain,
  getPublicStore,
} from "../controllers/store.controller";
import {
  createFlashSale, getFlashSales, updateFlashSale,
  deleteFlashSale, getActiveFlashSales,
} from "../controllers/returns.controller";

const router = Router();

// Public
router.get("/public/:slug", getPublicStore);

// Authenticated
router.post("/",            authenticate, createStore);
router.get("/",             authenticate, getMyStores);
router.get("/:id",          authenticate, getStore);
router.put("/:id",          authenticate, updateStore);
router.patch("/:id",        authenticate, updateStore);
router.delete("/:id",       authenticate, deleteStore);
router.patch("/:id/domain", authenticate, updateDomain);

// Flash Sales — frontend calls /stores/:id/flash-sales
router.get("/:id/flash-sales/active", getActiveFlashSales);
router.get("/:id/flash-sales",        authenticate, getFlashSales);
router.post("/:id/flash-sales",       authenticate, createFlashSale);
router.patch("/:id/flash-sales/:saleId", authenticate, updateFlashSale);
router.delete("/:id/flash-sales/:saleId", authenticate, deleteFlashSale);

export default router;