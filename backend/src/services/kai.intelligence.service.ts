// ============================================================
// KAI Intelligence Services — All 9 Features
// Path: backend/src/services/kai.intelligence.service.ts
//
// Dual-mode: every feature works in dashboard AND via KAI chat
// ============================================================
import prisma from "../lib/prisma";
import { getLocale, localiseQuery } from "../utils/kai.locale";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// ── Claude helper ─────────────────────────────────────────────
async function callClaude(prompt: string, useSearch = true, model = "claude-haiku-4-5-20251001", maxTokens = 1000) {
  const body: any = {
    model, max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  };
  if (useSearch) body.tools = [{ type: "web_search_20250305", name: "web_search" }];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey(), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data: any = await res.json();
  return data.content?.find((b: any) => b.type === "text")?.text || "";
}

function parseJSON<T>(text: string, fallback: T): T {
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return fallback; }
}

// ══════════════════════════════════════════════════════════════
// 1. AD SPY ENGINE — find winning ads globally
// ══════════════════════════════════════════════════════════════
export async function runAdSpy(params: {
  query:    string;       // product or niche
  platform: "tiktok" | "instagram" | "facebook" | "all";
  country:  string;
  storeId:  string;
}) {
  const locale  = getLocale(params.country);
  const country = locale.countryName;

  const platformMap: Record<string, string> = {
    tiktok:    `${locale.tiktokRegion}`,
    instagram: `Instagram ${country}`,
    facebook:  `Facebook ads ${country}`,
    all:       `${locale.tiktokRegion} Instagram ${country} Facebook ${country}`,
  };

  const platformStr = platformMap[params.platform] || platformMap.all;

  const text = await callClaude(`
You are an ad intelligence expert for ${country} ecommerce market.

Search: "${params.query} winning ads ${platformStr} 2026"
Also search: "${params.query} viral ${country} ${new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}"

Find the ACTUAL winning ads and hooks being used right now in ${country} for "${params.query}".
Focus on ${country}-specific content, not generic global ads.

Return ONLY JSON:
{
  "query": "${params.query}",
  "country": "${country}",
  "platform": "${params.platform}",
  "topHooks": [
    {"hook": "Opening line of the ad", "platform": "TikTok", "engagement": "high", "whyWorks": "why this hook works for ${country} audience"},
    {"hook": "...", "platform": "Instagram", "engagement": "medium", "whyWorks": "..."},
    {"hook": "...", "platform": "Facebook", "engagement": "high", "whyWorks": "..."},
    {"hook": "...", "platform": "TikTok", "engagement": "viral", "whyWorks": "..."}
  ],
  "winningAngles": [
    {"angle": "Problem/solution angle", "description": "what this angle emphasises for ${country} buyers"},
    {"angle": "Social proof angle", "description": "..."},
    {"angle": "Urgency angle", "description": "..."}
  ],
  "topProducts": [
    {"name": "product being heavily advertised", "estimatedSales": "high/medium/low", "platform": "TikTok"}
  ],
  "trendInsight": "One sentence about what's working in ${country} right now for this niche",
  "bestTimeToRun": "When to run ads in ${country} for max results",
  "avoidMistakes": ["common mistake ${country} sellers make with these ads", "mistake 2"]
}
`);

  const result = parseJSON(text, { query: params.query, country, topHooks: [], winningAngles: [], topProducts: [], trendInsight: "", bestTimeToRun: "", avoidMistakes: [] });

  // Cache for 12 hours
  const cacheKey = `adspy_${params.country}_${params.query.slice(0, 30)}_${params.platform}`;
  await prisma.kaiMarketCache.upsert({
    where:  { key: cacheKey },
    create: { key: cacheKey, category: "adspy", data: result as any, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
    update: { data: result as any, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), updatedAt: new Date() },
  });

  return result;
}

// ══════════════════════════════════════════════════════════════
// 2. TIKTOK VIDEO SCRIPT GENERATOR
// ══════════════════════════════════════════════════════════════
export async function generateTikTokScript(params: {
  productName:  string;
  productDesc?: string;
  price:        number;
  country:      string;
  duration:     15 | 30 | 60;
  angle?:       string;
}) {
  const locale = getLocale(params.country);
  const sym    = locale.currencySymbol;
  const price  = `${sym}${params.price.toLocaleString()}`;

  const text = await callClaude(`
Write a high-converting TikTok video script for ${locale.countryName} market.

Product: ${params.productName}
Price: ${price}
Duration: ${params.duration} seconds
Country: ${locale.countryName}
${params.angle ? `Angle: ${params.angle}` : ""}

Write a script that feels native to TikTok ${locale.countryName} culture.
Use ${locale.countryName} references, slang where appropriate.
The hook must grab attention in the first 2 seconds.

Return ONLY JSON:
{
  "title": "Script title",
  "duration": ${params.duration},
  "hook": "Opening line — first 2 seconds (MAX 8 words)",
  "sections": [
    {"time": "0-3s", "label": "HOOK", "action": "what to show on screen", "script": "exact words to say or text overlay", "tip": "filming tip"},
    {"time": "3-8s", "label": "PROBLEM", "action": "...", "script": "...", "tip": "..."},
    {"time": "8-18s", "label": "REVEAL", "action": "...", "script": "...", "tip": "..."},
    {"time": "18-25s", "label": "SOCIAL PROOF", "action": "...", "script": "...", "tip": "..."},
    {"time": "25-${params.duration}s", "label": "CTA", "action": "...", "script": "...", "tip": "..."}
  ],
  "soundSuggestion": "Type of music that works on ${locale.tiktokRegion} for this product",
  "hashtags": ["#relevant", "#nigerian", "#hashtags"],
  "hookVariants": [
    "Alternative hook A",
    "Alternative hook B",
    "Alternative hook C"
  ],
  "postTime": "Best time to post on ${locale.tiktokRegion}",
  "estimatedViews": "What kind of reach to expect",
  "proTip": "One ${locale.countryName}-specific tip for this ad"
}
`, false); // no search needed for script writing

  return parseJSON(text, { hook: "", sections: [], hookVariants: [], hashtags: [] });
}

// ══════════════════════════════════════════════════════════════
// 3. DAILY TOP 10 WITH ENGAGEMENT SIGNALS
// ══════════════════════════════════════════════════════════════
export async function getDailyTop10(storeId: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  const locale = getLocale(store?.country || "NG");
  const today  = new Date().toISOString().split("T")[0];
  const key    = `daily_top10_${locale.country}_${today}`;

  // Return cached if exists
  const cached = await prisma.kaiMarketCache.findUnique({ where: { key } }).catch(() => null);
  if (cached && new Date() < cached.expiresAt) return cached.data;

  const text = await callClaude(`
Find the TOP 10 products generating the most buzz in ${locale.countryName} ecommerce TODAY.

Search: "trending products ${locale.tiktokRegion} ${today}"
Search: "viral products ${locale.countryName} Instagram ${today}"
Search: "best selling dropshipping ${locale.countryName} ${new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}"

Focus ONLY on ${locale.countryName}. Real market signals, not global trends.

Return ONLY JSON array of 10:
[{
  "rank": 1,
  "name": "Product name",
  "category": "Category",
  "trendScore": 94,
  "trendDirection": "exploding",
  "engagementSignal": "What platform + signal shows this is trending",
  "adActivity": "heavy/moderate/light",
  "supplierCostUSD": 5.50,
  "supplierCostLocal": ${Math.round(5.5 * locale.exchangeRateToUSD)},
  "suggestedPriceLocal": ${Math.round(5.5 * locale.exchangeRateToUSD * 2.5)},
  "marginPercent": 60,
  "saturationLevel": "low",
  "windowDays": 14,
  "winningHook": "Best ad hook for ${locale.countryName}",
  "whyNow": "Why this specific product is trending TODAY in ${locale.countryName}",
  "targetAudience": "${locale.countryName} audience for this product",
  "symbol": "${locale.currencySymbol}"
}]
`);

  const result = parseJSON<any[]>(text, []);

  await prisma.kaiMarketCache.upsert({
    where:  { key },
    create: { key, category: "daily_top10", data: result as any, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
    update: { data: result as any, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000), updatedAt: new Date() },
  }).catch(() => {});

  return result;
}

// ══════════════════════════════════════════════════════════════
// 4. PROFIT PROTECTION RULES
// ══════════════════════════════════════════════════════════════
export async function getProfitRules(storeId: string) {
  return prisma.profitProtectionRule.findMany({
    where: { storeId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProfitRule(storeId: string, rule: {
  name:        string;
  trigger:     "price_rise" | "price_drop" | "out_of_stock" | "margin_below" | "margin_above";
  threshold:   number;
  action:      "alert" | "auto_reprice" | "hide_product" | "auto_reorder";
  actionValue?: number;
}) {
  return prisma.profitProtectionRule.create({
    data: { storeId, ...rule, isActive: true },
  });
}

export async function evaluateProfitRules(storeId: string): Promise<{ triggered: any[] }> {
  const [rules, products] = await Promise.all([
    prisma.profitProtectionRule.findMany({ where: { storeId, isActive: true } }),
    prisma.product.findMany({
      where: { storeId, isActive: true },
      select: { id: true, name: true, price: true, costPrice: true, stockQuantity: true, sourceUrl: true },
    }),
  ]);

  const triggered: any[] = [];

  for (const product of products) {
    const price     = Number(product.price);
    const cost      = Number(product.costPrice || 0);
    const margin    = cost > 0 ? Math.round(((price - cost) / price) * 100) : 0;
    const inStock   = (product.stockQuantity || 0) > 0;

    for (const rule of rules) {
      let fire = false;
      let message = "";

      if (rule.trigger === "margin_below" && margin < rule.threshold && cost > 0) {
        fire = true;
        message = `"${product.name}" margin is ${margin}% — below your ${rule.threshold}% rule`;
      }
      if (rule.trigger === "out_of_stock" && !inStock) {
        fire = true;
        message = `"${product.name}" is out of stock`;
      }

      if (fire) {
        triggered.push({ rule, product: { id: product.id, name: product.name, margin, price, cost, inStock }, message });

        // Auto-execute if action is not just alert
        if (rule.action === "hide_product") {
          await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
        }
        if (rule.action === "auto_reprice" && rule.actionValue) {
          const newPrice = Math.round(price * (1 + rule.actionValue / 100));
          await prisma.product.update({ where: { id: product.id }, data: { price: newPrice } });
        }
      }
    }
  }

  return { triggered };
}

// ══════════════════════════════════════════════════════════════
// 5. BULK PRODUCT IMPORT (supplier store URL)
// ══════════════════════════════════════════════════════════════
export async function bulkScrapeSupplierStore(params: {
  storeUrl: string;
  country:  string;
  limit?:   number;
}) {
  const locale = getLocale(params.country);
  const limit  = params.limit || 20;

  const text = await callClaude(`
Extract all products from this supplier store: ${params.storeUrl}

Search for products listed at: ${params.storeUrl}
Extract product data from this store page.

Get the top ${limit} products and for each one provide pricing for ${locale.countryName} market.
Exchange rate: $1 = ${locale.currencySymbol}${locale.exchangeRateToUSD}

Return ONLY JSON array:
[{
  "name": "Product name",
  "originalPriceUSD": 5.99,
  "localCost": ${Math.round(5.99 * locale.exchangeRateToUSD)},
  "suggestedLocalPrice": ${Math.round(5.99 * locale.exchangeRateToUSD * 2.5)},
  "marginPercent": 60,
  "category": "Category",
  "image": "image URL if found",
  "supplierUrl": "direct product URL",
  "rating": 4.5,
  "ordersCount": "50000+",
  "quickScore": "A/B/C/D/F",
  "reason": "One line why this grade"
}]
`, true, "claude-sonnet-4-20250514", 2000);

  return parseJSON<any[]>(text, []);
}

// ══════════════════════════════════════════════════════════════
// 6. AUTOMATIC ORDER FULFILLMENT
// ══════════════════════════════════════════════════════════════
export async function checkFulfillmentStatus(storeId: string) {
  const pendingOrders = await prisma.order.findMany({
    where: { storeId, status: "PAID", fulfillmentStatus: "UNFULFILLED" },
    include: {
      items: { include: { product: { select: { name: true, sourceUrl: true, metadata: true } } } },
      customer: { select: { name: true, email: true, address: true, phone: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  return pendingOrders.map(order => ({
    id:          order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    customer:    order.customer,
    items:       order.items.map(i => ({
      productName: i.product.name,
      quantity:    i.quantity,
      sourceUrl:   i.product.sourceUrl,
      canAutoFulfill: !!i.product.sourceUrl?.includes("aliexpress") || !!i.product.sourceUrl?.includes("cjdropshipping"),
    })),
    total:       order.total,
    createdAt:   order.createdAt,
    daysWaiting: Math.round((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
  }));
}

export async function markOrderFulfilling(orderId: string, trackingNumber?: string, carrier?: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status:            "SHIPPED",
      fulfillmentStatus: "FULFILLED",
      trackingNumber:    trackingNumber || null,
      carrier:           carrier || null,
      shippedAt:         new Date(),
    },
  });
}

// ══════════════════════════════════════════════════════════════
// 7. REAL-TIME PRICE + STOCK SYNC
// ══════════════════════════════════════════════════════════════
export async function syncPricesAndStock(storeId: string): Promise<{
  checked: number; priceChanges: any[]; stockChanges: any[];
}> {
  const products = await prisma.product.findMany({
    where: { storeId, isActive: true, sourceUrl: { not: null } },
    select: { id: true, name: true, price: true, costPrice: true, stockQuantity: true, sourceUrl: true },
    take: 15,
  });

  const priceChanges: any[] = [];
  const stockChanges: any[] = [];

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true } });
  const locale = getLocale(store?.country || "NG");

  for (const product of products) {
    if (!product.sourceUrl) continue;
    try {
      const text = await callClaude(`
Check the current price and stock status of this product: ${product.sourceUrl}

Search for: "${product.sourceUrl}"

Return ONLY JSON:
{"currentPriceUSD": 5.99, "inStock": true, "stockLevel": "high/medium/low/out", "found": true}
If cannot verify: {"currentPriceUSD": null, "inStock": null, "found": false}
`, true, "claude-haiku-4-5-20251001", 200);

      const data = parseJSON<any>(text, { found: false });
      if (!data.found) continue;

      const newCostLocal = data.currentPriceUSD ? Math.round(data.currentPriceUSD * locale.exchangeRateToUSD) : null;
      const oldCost = Number(product.costPrice || 0);

      if (newCostLocal && Math.abs(newCostLocal - oldCost) > oldCost * 0.08) {
        priceChanges.push({
          productId: product.id, productName: product.name,
          oldCost, newCost: newCostLocal,
          change: newCostLocal > oldCost ? "increased" : "decreased",
          changePercent: Math.round(Math.abs(newCostLocal - oldCost) / oldCost * 100),
          symbol: locale.currencySymbol,
        });
        await prisma.product.update({ where: { id: product.id }, data: { costPrice: newCostLocal } });
      }

      if (data.inStock === false && (product.stockQuantity || 0) > 0) {
        stockChanges.push({ productId: product.id, productName: product.name, status: "out_of_stock" });
        await prisma.product.update({ where: { id: product.id }, data: { stockQuantity: 0 } });
      }

      await new Promise(r => setTimeout(r, 1500));
    } catch {}
  }

  // Create pulse alerts for significant changes
  if (priceChanges.length > 0 || stockChanges.length > 0) {
    await prisma.kaiPulseAlert.create({
      data: {
        storeId, type: "price_sync", severity: "info",
        title: `Price/stock sync complete`,
        message: `${priceChanges.length} price changes, ${stockChanges.length} stock changes detected`,
        actionable: priceChanges.length > 0 || stockChanges.length > 0,
        data: { priceChanges, stockChanges } as any,
      },
    }).catch(() => {});
  }

  return { checked: products.length, priceChanges, stockChanges };
}

// ══════════════════════════════════════════════════════════════
// 8. COMPETITOR STORE SPY
// ══════════════════════════════════════════════════════════════
export async function spyCompetitorStore(params: {
  storeUrl: string;
  country:  string;
}) {
  const locale = getLocale(params.country);

  const text = await callClaude(`
Analyse this ecommerce store as a competitive intelligence expert for ${locale.countryName} market.

Store URL: ${params.storeUrl}
Search: "${params.storeUrl}" site analysis products prices
Search: "${params.storeUrl} reviews customers"

Return ONLY JSON:
{
  "storeName": "name if found",
  "niche": "what they sell",
  "country": "${locale.countryName}",
  "estimatedMonthlyRevenue": "${locale.currencySymbol}X-Y",
  "estimatedMonthlyOrders": "X-Y orders",
  "trafficLevel": "high/medium/low",
  "trafficSources": ["organic search", "instagram", "tiktok"],
  "topProducts": [
    {"name": "product", "estimatedPrice": "${locale.currencySymbol}X", "salesLevel": "high/medium/low"}
  ],
  "newArrivals": ["product recently added"],
  "pricingStrategy": "premium/budget/mid-market",
  "adActivity": "Are they running paid ads? Where?",
  "socialPresence": {"instagram": "@handle if found", "tiktok": "@handle if found"},
  "strengths": ["what they do well"],
  "weaknesses": ["where they fall short"],
  "opportunities": ["how you can beat them specifically in ${locale.countryName}"],
  "estimatedAdSpend": "low/medium/high",
  "verdict": "2-sentence assessment for a ${locale.countryName} competitor"
}
`);

  return parseJSON(text, { storeName: "Unknown", niche: "", topProducts: [], weaknesses: [], opportunities: [] });
}

// ══════════════════════════════════════════════════════════════
// 9. SUPPLIER ALTERNATIVES FINDER
// ══════════════════════════════════════════════════════════════
export async function findSupplierAlternatives(params: {
  productName:  string;
  currentUrl?:  string;
  country:      string;
  maxPriceUSD?: number;
}) {
  const locale = getLocale(params.country);
  const sym    = locale.currencySymbol;

  const text = await callClaude(`
Find the best supplier alternatives for "${params.productName}" for a seller in ${locale.countryName}.

Search: "${params.productName} supplier aliexpress cjdropshipping 2026"
Search: "${params.productName} wholesale ${locale.countryName} supplier"
${params.currentUrl ? `Current supplier: ${params.currentUrl}` : ""}
${params.maxPriceUSD ? `Max budget: $${params.maxPriceUSD}` : ""}

Find suppliers that ship to or within ${locale.countryName}.
Include both international (AliExpress, CJ) and local if possible.

Return ONLY JSON array of up to 5 suppliers:
[{
  "supplierName": "Supplier name",
  "type": "international/local",
  "platform": "AliExpress/CJDropshipping/Local market/etc",
  "priceUSD": 4.50,
  "priceLocal": ${Math.round(4.5 * locale.exchangeRateToUSD)},
  "currency": "${sym}",
  "shippingDaysToCountry": 14,
  "minimumOrder": 1,
  "qualityScore": 8,
  "reliabilityScore": 9,
  "hasLocalWarehouse": false,
  "url": "URL if available",
  "whyBetter": "Why this is better than current supplier for ${locale.countryName}",
  "verified": true
}]
`);

  return parseJSON<any[]>(text, []);
}
