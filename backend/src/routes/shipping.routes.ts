// src/routes/shipping.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";

const router = Router();

// GET /api/shipping/:storeId/rate?country=Nigeria&total=45  (public — before /:storeId)
router.get("/:storeId/rate", async (req: Request, res: Response) => {
  const { country, total } = req.query;
  const zones = await prisma.shippingZone.findMany({
    where:   { storeId: req.params.storeId },
    orderBy: { createdAt: "asc" },
  });
  const match = zones.find((z) =>
    z.countries.some((c) => c.toLowerCase() === String(country || "").toLowerCase())
  ) || zones.find((z) => z.countries.includes("Worldwide") || z.countries.includes("*"));

  if (!match) return res.json({ success: true, data: { rate: 0, zone: null, free: true } });

  const orderTotal = Number(total) || 0;
  const free = match.freeThreshold ? orderTotal >= match.freeThreshold : match.shippingRate === 0;
  res.json({ success: true, data: { rate: free ? 0 : match.shippingRate, zone: match.name, free, estimatedDays: match.estimatedDays, freeThreshold: match.freeThreshold } });
});

// GET /api/shipping/:storeId
router.get("/:storeId", authenticate, async (req: Request, res: Response) => {
  const zones = await prisma.shippingZone.findMany({ where: { storeId: req.params.storeId }, orderBy: { createdAt: "asc" } });
  res.json({ success: true, data: zones });
});

// POST /api/shipping/:storeId
router.post("/:storeId", authenticate, async (req: Request, res: Response) => {
  const { name, countries, shippingRate, freeThreshold, estimatedDays } = req.body;
  const zone = await (prisma.shippingZone as any).create({
    data: {
      storeId:       req.params.storeId,
      name,
      countries:     Array.isArray(countries) ? countries : [countries],
      shippingRate:  Number(shippingRate) || 0,
      freeThreshold: freeThreshold ? Number(freeThreshold) : null,
      estimatedDays: estimatedDays || null,
    },
  });
  res.status(201).json({ success: true, data: zone });
});

// PUT /api/shipping/:storeId/:id
router.put("/:storeId/:id", authenticate, async (req: Request, res: Response) => {
  const { name, countries, shippingRate, freeThreshold, estimatedDays } = req.body;
  const zone = await prisma.shippingZone.update({
    where: { id: req.params.id },
    data: {
      name,
      countries:     Array.isArray(countries) ? countries : [countries],
      shippingRate:  Number(shippingRate) || 0,
      freeThreshold: freeThreshold ? Number(freeThreshold) : null,
      estimatedDays: estimatedDays || null,
    },
  });
  res.json({ success: true, data: zone });
});

// DELETE
router.delete("/:storeId/:id", authenticate, async (req: Request, res: Response) => {
  await prisma.shippingZone.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});


// POST /api/shipping/rates — Calculate shipping rates for checkout
router.post("/rates", async (req: Request, res: Response) => {
  try {
    const { calculateShippingRates } = await import("../services/shipping.service");
    const { origin, destination, weightKg, valueNGN, storeId } = req.body;
    const rates = await calculateShippingRates({ origin, destination, weightKg: Number(weightKg)||0.5, valueNGN: Number(valueNGN)||0, storeId });
    res.json({ success: true, data: rates });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
