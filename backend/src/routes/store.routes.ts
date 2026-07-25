// backend/src/routes/store.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
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


// Custom domain management
router.get("/:storeId/custom-domain", authenticate, async (req, res) => {
  const { storeId } = req.params;
  const store = await (req.app.get("prisma") || require("../config/database").prisma).store.findUnique({
    where: { id: storeId },
    select: { customDomain: true, domain: true },
  });
  return res.json({ success: true, data: { customDomain: store?.customDomain || null, subdomain: store?.domain || null } });
});

router.post("/:storeId/custom-domain", authenticate, async (req, res) => {
  const { storeId } = req.params;
  const { domain } = req.body;
  const { prisma } = require("../config/database");
  await prisma.store.update({ where: { id: storeId }, data: { customDomain: domain || null } });
  return res.json({ success: true, message: domain ? "Custom domain saved" : "Custom domain removed" });
});


// ── Product Collections ─────────────────────────────────────────────────────
router.get("/:storeId/collections", authenticate, async (req, res) => {
  const { prisma } = require("../config/database");
  const collections = await (prisma.collection as any).findMany({
    where: { storeId: req.params.storeId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);
  return res.json({ success: true, data: collections });
});

router.post("/:storeId/collections", authenticate, async (req, res) => {
  const { prisma } = require("../config/database");
  const { name, description, emoji, productIds } = req.body;
  const col = await (prisma.collection as any).create({
    data: { storeId: req.params.storeId, name, description, emoji, productIds: productIds || [] },
  });
  return res.json({ success: true, data: col });
});

router.put("/:storeId/collections/:id", authenticate, async (req, res) => {
  const { prisma } = require("../config/database");
  const { name, description, emoji, productIds } = req.body;
  const col = await (prisma.collection as any).update({
    where: { id: req.params.id },
    data: { name, description, emoji, productIds: productIds || [] },
  });
  return res.json({ success: true, data: col });
});

router.delete("/:storeId/collections/:id", authenticate, async (req, res) => {
  const { prisma } = require("../config/database");
  await (prisma.collection as any).delete({ where: { id: req.params.id } }).catch(() => {});
  return res.json({ success: true });
});

export default router;
// Custom domain lookup — used by frontend for custom domain routing
router.get("/domain/:hostname", async (req: any, res: any) => {
  try {
    const { hostname } = req.params;
    const store = await prisma.store.findFirst({
      where: {
        customDomain: hostname,
        status: { not: "SUSPENDED" } as any,
      },
      select: { slug: true, id: true, name: true },
    });
    if (!store) return res.status(404).json({ success: false });
    return res.json({ success: true, data: store });
  } catch {
    return res.status(500).json({ success: false });
  }
});
