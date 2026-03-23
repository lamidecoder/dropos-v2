// src/routes/store.routes.ts
import { Router } from "express";
import { authenticate, requireOwner } from "../middleware/auth";
import {
  createStore, getMyStores, getStore,
  updateStore, deleteStore, updateDomain,
  getPublicStore,
} from "../controllers/store.controller";

const router = Router();

// Public
router.get("/public/:slug",          getPublicStore);

// Authenticated
router.post("/",                     authenticate, requireOwner, createStore);
router.get("/",                      authenticate, requireOwner, getMyStores);
router.get("/:id",                   authenticate, getStore);
router.put("/:id",                   authenticate, updateStore);
router.patch("/:id",                 authenticate, updateStore);
router.delete("/:id",                authenticate, deleteStore);
router.patch("/:id/domain",          authenticate, updateDomain);

export default router;