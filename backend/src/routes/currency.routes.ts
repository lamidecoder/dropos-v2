// src/routes/currency.routes.ts
import { Router, Request, Response } from "express";
import { currencyService, CURRENCY_META, COUNTRY_TO_CURRENCY } from "../services/currency.service";
import axios from "axios";

const router = Router();

// ── GET /api/currency/rates — all rates relative to USD ──────────────────────
router.get("/rates", async (_req: Request, res: Response) => {
  try {
    const rates = await currencyService.getRates();
    return res.json({ success: true, data: { rates, base: "USD", updatedAt: new Date().toISOString() } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch rates" });
  }
});

// ── GET /api/currency/available — list all supported currencies ───────────────
router.get("/available", (_req: Request, res: Response) => {
  const currencies = Object.entries(CURRENCY_META).map(([code, meta]) => ({
    code, ...meta,
  }));
  return res.json({ success: true, data: currencies });
});

// ── GET /api/currency/detect — detect currency from visitor IP ───────────────
router.get("/detect", async (req: Request, res: Response) => {
  try {
    // Extract real IP (works behind proxies / Vercel / Railway)
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket.remoteAddress ||
      "";

    // Skip for localhost / private IPs
    const isLocal = !ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168") || ip.startsWith("10.");

    if (isLocal) {
      return res.json({
        success:  true,
        data: { currency: "USD", country: "US", countryName: "United States", ip, source: "default" },
      });
    }

    // Free tier geo IP — no API key needed
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`, {
      timeout: 3000,
    });

    const { status, country, countryCode } = geoRes.data;
    if (status !== "success") throw new Error("Geo lookup failed");

    const currency = COUNTRY_TO_CURRENCY[countryCode] ?? "USD";
    return res.json({
      success: true,
      data: { currency, country: countryCode, countryName: country, ip, source: "geo" },
    });
  } catch (err: any) {
    // Graceful fallback — never hard-fail
    return res.json({
      success: true,
      data: { currency: "USD", country: "US", countryName: "United States", ip: "", source: "fallback" },
    });
  }
});

// ── POST /api/currency/convert — convert a price ─────────────────────────────
router.post("/convert", async (req: Request, res: Response) => {
  try {
    const { amount, from, to } = req.body;
    if (!amount || !from || !to) {
      return res.status(400).json({ success: false, message: "amount, from, and to are required" });
    }
    const converted = await currencyService.convert(Number(amount), String(from), String(to));
    return res.json({ success: true, data: { amount, from, to, converted, rate: converted / amount } });
  } catch {
    return res.status(500).json({ success: false, message: "Conversion failed" });
  }
});

// ── GET /api/currency/rates/:code — rates relative to a specific base ─────────
router.get("/rates/:base", async (req: Request, res: Response) => {
  try {
    const { base } = req.params;
    const usdRates = await currencyService.getRates();
    const baseRate = usdRates[base.toUpperCase()] ?? 1;

    // Rebase all rates to the requested currency
    const rebased: Record<string, number> = {};
    for (const [code, usdRate] of Object.entries(usdRates)) {
      rebased[code] = usdRate / baseRate;
    }

    return res.json({ success: true, data: { rates: rebased, base: base.toUpperCase() } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to rebase rates" });
  }
});

export default router;
