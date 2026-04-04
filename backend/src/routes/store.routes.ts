// backend/src/routes/store.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createStore, getMyStores, getStore,
  updateStore, deleteStore, updateDomain,
  getPublicStore,
} from "../controllers/store.controller";

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

export default router;