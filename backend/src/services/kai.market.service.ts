// ============================================================
// KAI Market Service — UPDATED WITH LOCALE ENGINE
// Path: backend/src/services/kai.market.service.ts
// REPLACES previous version
// All market data fetched per country
// ============================================================
import { PrismaClient }     from "@prisma/client";
import { getLocale, localiseQuery, getSeasonalContext } from "../utils/kai.locale";

const prisma = new PrismaClient();

// ── Forex Rates ───────────────────────────────────────────────
export async function fetchForexRates(): Promise<Record<string, number>> {
  const cached = await prisma.kaiMarketCache.findUnique({ where: { key: "forex_rates" } }).catch(() => null);
  if (cached && new Date() < cached.expiresAt) return cached.data as any;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("API failed");
    const data: any = await res.json();
    const rates = {
      NGN: data.rates?.NGN || 1580,
      GHS: data.rates?.GHS || 15.2,
      KES: data.rates?.KES || 130,
      ZAR: data.rates?.ZAR || 18.5,
      GBP: data.rates?.GBP || 0.79,
      EUR: data.rates?.EUR || 0.92,
    };
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.kaiMarketCache.upsert({
      where: { key: "forex_rates" },
      create: { key: "forex_rates", category: "forex", data: rates, expiresAt },
      update: { data: rates, expiresAt, updatedAt: new Date() },
    });
    return rates;
  } catch {
    return { NGN: 1580, GHS: 15.2, KES: 130, ZAR: 18.5, GBP: 0.79, EUR: 0.92 };
  }
}

// ── Get market context for a store (country-specific) ─────────
export async function getMarketContext(countryCode = "NG"): Promise<string> {
  const locale   = getLocale(countryCode);
  const [forex]  = await Promise.all([fetchForexRates()]);
  const seasonal = getSeasonalContext(countryCode);
  const usdToLocal = forex[locale.currency] || locale.exchangeRateToUSD;

  const lines = [
    `LIVE MARKET DATA — ${locale.countryName.toUpperCase()}:`,
    `Exchange rate: $1 = ${locale.currencySymbol}${usdToLocal.toLocaleString()} | Use this for all price calculations`,
    `Seasonal context: ${seasonal}`,
    `Shopping platforms in ${locale.countryName}: ${locale.shoppingPlatforms.join(", ")}`,
    `Social platforms: ${locale.socialPlatforms.join(", ")}`,
    `Trending searches on: ${locale.tiktokRegion}`,
  ];

  // Add cached trending data for this country
  const today    = new Date().toISOString().split("T")[0];
  const cacheKey = `trending_${countryCode}_${today}`;
  const trending = await prisma.kaiMarketCache.findUnique({ where: { key: cacheKey } }).catch(() => null);
  if ((trending?.data as any)?.products?.length > 0) {
    lines.push(`Trending in ${locale.countryName} today: ${(trending!.data as any).products.slice(0, 5).join(", ")}`);
  }

  return lines.join("\n");
}

// ── Daily market fetch — per country ──────────────────────────
export async function runDailyMarketFetch(apiKey: string): Promise<void> {
  const countries = ["NG", "GH", "KE", "ZA", "GB", "US"];
  const today = new Date().toISOString().split("T")[0];

  for (const countryCode of countries) {
    const locale   = getLocale(countryCode);
    const cacheKey = `trending_${countryCode}_${today}`;

    // Skip if already fetched today
    const existing = await prisma.kaiMarketCache.findUnique({ where: { key: cacheKey } }).catch(() => null);
    if (existing) continue;

    try {
      // Build country-specific search query
      const searchQuery = localiseQuery("trending products to sell online this week", countryCode);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Search: "${searchQuery}"
Find products trending on ${locale.tiktokRegion} and ${locale.socialPlatforms[1]} this week.
Return ONLY JSON: {"products":["product1","product2","product3","product4","product5"],"categories":["cat1","cat2"],"summary":"one sentence about what's hot in ${locale.countryName} this week"}`,
          }],
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        const textBlock = data.content?.find((b: any) => b.type === "text");
        if (textBlock?.text) {
          try {
            const parsed = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
            await prisma.kaiMarketCache.upsert({
              where: { key: cacheKey },
              create: { key: cacheKey, category: "trending", data: parsed, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
              update: { data: parsed, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), updatedAt: new Date() },
            });
            console.log(`[Market] ${locale.countryName}: fetched trending data`);
          } catch {}
        }
      }

      // Delay between countries to avoid rate limits
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error(`[Market] ${locale.countryName} fetch failed:`, err);
    }
  }

  // Always refresh forex
  await fetchForexRates();
}

// ── Skills for a store ────────────────────────────────────────
export async function getKaiSkills(storeId: string) {
  const [storeSkills, globalSkills] = await Promise.all([
    prisma.kaiSkill.findMany({ where: { storeId }, orderBy: [{ usageCount: "desc" }] }),
    prisma.kaiSkill.findMany({ where: { isGlobal: true }, orderBy: { usageCount: "desc" }, take: 10 }),
  ]);
  return { storeSkills, globalSkills };
}
