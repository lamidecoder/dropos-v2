// ============================================================
// KAI Power Service — UPDATED WITH LOCALE ENGINE
// Path: backend/src/services/kai.power.service.ts
// REPLACES previous version
// All searches now country-specific by default
// ============================================================
import { PrismaClient }      from "@prisma/client";
import { getLocale, localiseQuery } from "../utils/kai.locale";

const prisma = new PrismaClient();

async function getStoreLocale(apiKey_or_storeId?: string, storeId?: string) {
  // Get store country
  const id = storeId;
  if (!id) return getLocale("NG");
  const store = await prisma.store.findUnique({ where: { id }, select: { country: true } }).catch(() => null);
  return getLocale(store?.country || "NG");
}

// ── URL → Complete Product Page ───────────────────────────────
export async function generateProductPage(params: {
  url?: string;
  productName?: string;
  productDescription?: string;
  storeId?: string;
  country?: string;
  language?: string;
  apiKey: string;
}): Promise<any> {
  const locale   = getLocale(params.country || "NG");
  const sym      = locale.currencySymbol;
  const country  = locale.countryName;
  const language = params.language || locale.language;

  const prompt = params.url
    ? `You are an expert ecommerce copywriter for ${country} market.
Generate a complete high-converting product page from: ${params.url}
Language: ${language}. Market: ${country}. Currency: ${sym}.`
    : `Generate a complete product page for: ${params.productName}
Market: ${country}. Currency: ${sym}.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `${prompt}

Write for ${country} buyers. Use ${sym} prices. Reference local context (${locale.topCities[0]}, ${locale.topCities[1]}, etc) where relevant.
Include trust signals that work in ${country}: ${locale.trustSignals.slice(0, 150)}

Return ONLY JSON:
{
  "headline": "Powerful headline (10-15 words)",
  "subheadline": "Supporting statement",
  "shortDescription": "2-3 sentence hook",
  "benefits": [{"title":"","description":""},{"title":"","description":""},{"title":"","description":""},{"title":"","description":""}],
  "fullDescription": "3-4 paragraphs",
  "bulletPoints": ["6 benefits"],
  "socialProof": {"reviewCount":847,"rating":4.8,"testimonials":[{"name":"${locale.topCities[0]} name","location":"${locale.topCities[0]}","text":"review","rating":5},{"name":"${locale.topCities[1]} name","location":"${locale.topCities[1]}","text":"review","rating":5}]},
  "urgency": {"stockText":"Only 7 left","viewerText":"23 people viewing","soldText":"47 sold today"},
  "valueStack": [{"item":"Product","value":"${sym}45,000"},{"item":"Free bonus","value":"${sym}5,000"}],
  "guarantee": "30-day money-back guarantee",
  "faq": [{"question":"How long is delivery to ${locale.topCities[0]}?","answer":"3-5 working days"},{"question":"Do you accept ${locale.paymentMethods[0]}?","answer":"Yes, we do"}],
  "seoTitle": "under 60 chars",
  "seoDescription": "under 155 chars",
  "tags": ["tag1","tag2","tag3"],
  "adAngles": [{"angle":"Problem/Solution","hook":"hook"},{"angle":"Social Proof","hook":"hook"},{"angle":"${country} specific","hook":"localised hook"}]
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Product page generation failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { throw new Error("Failed to parse response"); }
}

// ── Ad Copy Generator — country-specific ─────────────────────
export async function generateAdCopy(params: {
  productName: string;
  productDescription: string;
  targetAudience: string;
  platform: "facebook" | "tiktok" | "whatsapp" | "instagram" | "google";
  country?: string;
  storeId?: string;
  angle?: string;
  apiKey: string;
}): Promise<any> {
  const locale  = getLocale(params.country || "NG");
  const country = locale.countryName;
  const sym     = locale.currencySymbol;

  const tiktokInstruction = params.platform === "tiktok"
    ? `This is for ${locale.tiktokRegion}. Use trending sounds popular in ${country}. Use local slang/references.`
    : "";

  const waInstruction = params.platform === "whatsapp"
    ? `This is a WhatsApp broadcast for ${country} customers. Use ${locale.language} tone. Reference local events/context if relevant.`
    : "";

  const platformInstructions: Record<string, string> = {
    facebook:  `Facebook/Instagram ad for ${country} market. 150 words max. References local trust signals.`,
    tiktok:    `TikTok script for ${locale.tiktokRegion}. 30-60 seconds. Hook + problem + reveal + CTA. ${tiktokInstruction}`,
    whatsapp:  `${waInstruction} 80-120 words. Casual, emoji-friendly. Clear offer.`,
    instagram: `Instagram caption for ${country}. Engaging, with hashtags like #${country.replace(" ", "")}fashion etc.`,
    google:    `Google Ads for ${country}. 3 headlines (30 chars max) + 2 descriptions (90 chars max).`,
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `Write ${params.platform} ad for: ${params.productName} | ${params.productDescription}
Audience: ${params.targetAudience} | Market: ${country} | Currency: ${sym}
${params.angle ? `Angle: ${params.angle}` : ""}
Format: ${platformInstructions[params.platform]}

Return ONLY JSON:
{
  "platform": "${params.platform}",
  "angle": "angle used",
  "primaryCopy": "main ad copy",
  "headline": "headline",
  "cta": "call to action",
  "variations": ["variation 1 with local reference", "variation 2"],
  ${params.platform === "tiktok" ? '"script": {"hook":"first 3 seconds","problem":"pain","reveal":"product","demo":"what to show","cta":"end screen","suggestedSound":"trending sound type in ' + country + '"},' : ""}
  "tips": "one tip specific to ${country} market"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Ad copy generation failed");
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { primaryCopy: text, platform: params.platform }; }
}

// ── Winning Products — country-specific search ────────────────
export async function getWinningProducts(params: {
  storeId: string;
  niche?: string;
  country?: string;
  count: number;
  apiKey: string;
}): Promise<any[]> {
  const locale  = getLocale(params.country || "NG");
  const country = locale.countryName;
  const sym     = locale.currencySymbol;

  // Build localised search query
  const baseQuery = params.niche
    ? `trending ${params.niche} products ${locale.tiktokRegion}`
    : `${locale.winningProductKeywords}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Find ${params.count} winning dropshipping products trending RIGHT NOW in ${country} ${params.niche ? `in the ${params.niche} niche` : ""}.

Search: "${baseQuery}" and "${locale.searchSuffix} ${new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}"

IMPORTANT: Results must be relevant to ${country} market. Prices in ${sym}.
Consider: what sells on ${locale.tiktokRegion}, what's popular in ${locale.topCities[0]}, what trends on ${locale.shoppingPlatforms[0]}

Return ONLY a JSON array:
[{
  "rank": 1,
  "name": "Product name",
  "category": "Category",
  "trendScore": 8.5,
  "trendDirection": "rising",
  "saturationLevel": "low",
  "supplierCostUSD": 12,
  "supplierCostLocal": ${locale.exchangeRateToUSD * 12},
  "recommendedPriceLocal": ${locale.exchangeRateToUSD * 12 * 2.5},
  "margin": 60,
  "whySelling": "why trending NOW in ${country}",
  "targetAudience": "typical ${country} buyer of this",
  "bestAdPlatform": "${locale.adPlatforms[0]}",
  "windowOpportunity": "3-4 weeks",
  "verdict": "🔥 Hot / ⚠️ Moderate / ❌ Saturated"
}]`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Product research failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "[]";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

// ── Profit Calculator ─────────────────────────────────────────
export async function calculateProfit(params: {
  supplierCostUSD: number;
  shippingCostLocal: number;
  sellingPriceLocal: number;
  country?: string;
  adSpendDaily?: number;
  expectedConversionRate?: number;
}): Promise<any> {
  const locale  = getLocale(params.country || "NG");
  const sym     = locale.currencySymbol;
  const rate    = locale.exchangeRateToUSD;

  const supplierCostLocal  = params.supplierCostUSD * rate;
  const droposFee          = params.sellingPriceLocal * 0.02;
  const paymentFee         = params.sellingPriceLocal * 0.015 + (params.country === "NG" ? 100 : 0);
  const totalCosts         = supplierCostLocal + params.shippingCostLocal + droposFee + paymentFee;
  const netProfitPerSale   = params.sellingPriceLocal - totalCosts;
  const marginPercent      = Math.round((netProfitPerSale / params.sellingPriceLocal) * 100);
  const adSpend            = params.adSpendDaily || (params.country === "NG" ? 5000 : 50);
  const convRate           = params.expectedConversionRate || 2;
  const ordersPerDay       = Math.round((adSpend / params.sellingPriceLocal) * (convRate / 100) * 100);
  const profitPerDay       = ordersPerDay * netProfitPerSale;

  return {
    breakdown: {
      sellingPrice:   `${sym}${params.sellingPriceLocal.toLocaleString()}`,
      supplierCost:   `${sym}${Math.round(supplierCostLocal).toLocaleString()} ($${params.supplierCostUSD} × ${rate})`,
      shippingCost:   `${sym}${params.shippingCostLocal.toLocaleString()}`,
      droposFee:      `${sym}${Math.round(droposFee).toLocaleString()} (2%)`,
      paymentFee:     `${sym}${Math.round(paymentFee).toLocaleString()} (${locale.paymentMethods[0]})`,
      totalCosts:     `${sym}${Math.round(totalCosts).toLocaleString()}`,
      netProfitPerSale:`${sym}${Math.round(netProfitPerSale).toLocaleString()}`,
      marginPercent:  `${marginPercent}%`,
    },
    projections: {
      adSpendDaily:  `${sym}${adSpend.toLocaleString()}`,
      ordersPerDay,
      profitPerDay:  `${sym}${Math.round(profitPerDay).toLocaleString()}`,
      monthlyRevenue:`${sym}${Math.round(ordersPerDay * params.sellingPriceLocal * 30).toLocaleString()}`,
      monthlyProfit: `${sym}${Math.round(profitPerDay * 30).toLocaleString()}`,
    },
    verdict: marginPercent >= 60 ? "🔥 Excellent margin" : marginPercent >= 40 ? "✅ Good margin" : marginPercent >= 25 ? "⚠️ Tight margin" : "❌ Too thin",
    recommendation: marginPercent < 40 ? `In ${locale.countryName}, ${locale.typicalMargin} margin is typical. Try to lower supplier cost or increase price.` : `Strong margin for ${locale.countryName} market.`,
    market: locale.countryName,
    currency: sym,
  };
}

// ── Niche Research — country-specific ────────────────────────
export async function researchNiche(params: {
  niche: string;
  country?: string;
  apiKey: string;
}): Promise<any> {
  const locale  = getLocale(params.country || "NG");
  const country = locale.countryName;
  const sym     = locale.currencySymbol;

  const searchQuery = localiseQuery(`${params.niche} niche market size competition`, locale.country);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Research the "${params.niche}" niche for dropshipping specifically in ${country}.

Search: "${searchQuery}"

All analysis must be specific to ${country}. Prices in ${sym}.

Return ONLY JSON:
{
  "niche": "${params.niche}",
  "country": "${country}",
  "overallScore": 7.5,
  "marketSize": "size in ${country}",
  "growthDirection": "growing",
  "competitionLevel": "medium",
  "avgMargin": "${locale.typicalMargin}",
  "entryDifficulty": "medium",
  "topProducts": [{"name":"","avgPrice":"${sym}X","margin":"X%"}],
  "targetCustomer": {"ageRange":"","gender":"","location":"${locale.topCities[0]}, ${locale.topCities[1]}","income":"","motivation":""},
  "bestSuppliers": ["AliExpress", "CJDropshipping", "${locale.majorMarkets[0] || "local wholesale"}"],
  "seasonality": "${locale.seasonalEvents[String(new Date().getMonth() + 1)] || "consistent year-round"}",
  "bestAdPlatforms": ${JSON.stringify(locale.adPlatforms.slice(0, 3))},
  "bestPaymentMethods": ${JSON.stringify(locale.paymentMethods.slice(0, 3))},
  "commonObjections": ["${country}-specific objection 1", "objection 2"],
  "whiteSpaceOpportunity": "gap specific to ${country} market",
  "verdict": "Detailed assessment for ${country} dropshipper",
  "startingBudget": "${sym}X - ${sym}Y"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Niche research failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { niche: params.niche, country, error: "Research failed" }; }
}

// ── Competitor Analysis ───────────────────────────────────────
export async function analyzeCompetitor(params: {
  storeUrl: string;
  country?: string;
  apiKey: string;
}): Promise<any> {
  const locale = getLocale(params.country || "NG");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Analyse this ${locale.countryName} competitor store: ${params.storeUrl}

Evaluate from perspective of ${locale.countryName} ecommerce market.
Compare to ${locale.shoppingPlatforms.join(", ")} standards.

Return ONLY JSON:
{
  "storeName": "",
  "niche": "",
  "estimatedMonthlyRevenue": "${locale.currencySymbol}X-Y",
  "productCount": "",
  "avgProductPrice": "${locale.currencySymbol}X",
  "designQuality": 7,
  "trustSignals": ["payment options", "reviews", "policies"],
  "topProducts": [{"name":"","price":"${locale.currencySymbol}X","strength":""}],
  "weaknesses": ["weakness 1", "weakness 2"],
  "opportunities": ["how to beat them on X in ${locale.countryName}"],
  "adActivity": "platforms they use",
  "pricingStrategy": "",
  "localTrustScore": "how well they serve ${locale.countryName} buyers",
  "verdict": "assessment + how to compete in ${locale.countryName}"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Competitor analysis failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { storeUrl: params.storeUrl, error: "Analysis failed" }; }
}

// ── Buyer Motivation ──────────────────────────────────────────
export async function analyzeBuyerMotivation(params: {
  productName: string;
  country?: string;
  apiKey: string;
}): Promise<any> {
  const locale  = getLocale(params.country || "NG");
  const country = locale.countryName;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `Analyse buyer psychology for "${params.productName}" specifically in ${country}.

Consider ${country}-specific factors: ${locale.paydayContext.slice(0, 200)}

Return ONLY JSON:
{
  "primaryMotivation": "why ${country} buyers specifically buy this",
  "emotionalTriggers": ["trigger relevant to ${country} culture", "trigger 2", "trigger 3"],
  "fears": ["fear specific to ${country} buyer", "fear of missing out"],
  "desires": ["${country}-relevant desire 1", "desire 2"],
  "objections": ["common ${country} buyer objection 1", "objection 2"],
  "bestAdAngle": "most powerful angle for ${country} market",
  "powerWords": ["word that works in ${locale.language}", "word2", "word3", "word4", "word5"],
  "avoidWords": ["word that puts ${country} buyers off", "word2"],
  "hookFormula": "formula that works in ${country}",
  "exampleHook": "actual hook example for ${country} buyer",
  "paymentTip": "how to use ${locale.paymentMethods[0]} offer to increase conversion"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Analysis failed");
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return { productName: params.productName, error: "Analysis failed" }; }
}
