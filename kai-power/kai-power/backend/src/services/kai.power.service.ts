// ============================================================
// KAI — Power Features Service
// Path: backend/src/services/kai.power.service.ts
// Kills: PagePilot + droship.io + Minea + BigSpy
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── URL → Complete Product Page ───────────────────────────────
export async function generateProductPage(params: {
  url?: string;
  productName?: string;
  productDescription?: string;
  country: string;
  language: string;
  niche?: string;
  apiKey: string;
}): Promise<any> {

  const { url, productName, productDescription, country, language, apiKey } = params;
  const isNG = country === "NG";
  const sym  = isNG ? "₦" : country === "GB" ? "£" : "$";

  const prompt = url
    ? `You are an expert ecommerce copywriter for ${isNG ? "Nigerian" : "international"} markets.

Generate a complete, high-converting product page from this URL: ${url}

Create content in ${language} language for ${country} market.`
    : `Generate a complete product page for: ${productName}
${productDescription ? `Description: ${productDescription}` : ""}
Country: ${country} | Currency: ${sym}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `${prompt}

Return ONLY a JSON object with this exact structure (no markdown, no backticks):
{
  "headline": "Attention-grabbing headline using psychological triggers (10-15 words)",
  "subheadline": "Supporting statement that builds desire (15-20 words)",
  "shortDescription": "2-3 sentence hook that creates urgency and desire",
  "benefits": [
    {"title": "Benefit title", "description": "2 sentence explanation"},
    {"title": "Benefit title", "description": "2 sentence explanation"},
    {"title": "Benefit title", "description": "2 sentence explanation"},
    {"title": "Benefit title", "description": "2 sentence explanation"}
  ],
  "fullDescription": "3-4 paragraph rich description with storytelling, benefits over features",
  "bulletPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6"],
  "socialProof": {
    "reviewCount": 847,
    "rating": 4.8,
    "testimonials": [
      {"name": "Nigerian/local name", "location": "Lagos/Abuja/etc", "text": "Authentic review", "rating": 5},
      {"name": "Nigerian/local name", "location": "Lagos/Abuja/etc", "text": "Authentic review", "rating": 5},
      {"name": "Nigerian/local name", "location": "Lagos/Abuja/etc", "text": "Authentic review", "rating": 4}
    ]
  },
  "urgency": {
    "stockText": "Only 7 left in stock",
    "viewerText": "23 people viewing this right now",
    "soldText": "47 sold in last 24 hours"
  },
  "valueStack": [
    {"item": "Product itself", "value": "Worth ${sym}45,000"},
    {"item": "Free bonus/accessory", "value": "Worth ${sym}5,000"},
    {"item": "Fast delivery", "value": "Worth ${sym}3,000"}
  ],
  "totalValue": "${sym}53,000",
  "salePrice": "${sym}18,500",
  "guarantee": "30-day money-back guarantee — if you're not satisfied, we'll refund every kobo",
  "faq": [
    {"question": "Relevant question", "answer": "Clear answer"},
    {"question": "Relevant question", "answer": "Clear answer"},
    {"question": "Relevant question", "answer": "Clear answer"},
    {"question": "Delivery question for ${isNG ? "Nigeria" : country}", "answer": "Delivery timeline answer"},
    {"question": "Payment question", "answer": "Payment methods answer"}
  ],
  "seoTitle": "SEO title under 60 chars",
  "seoDescription": "Meta description under 155 chars",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "adAngles": [
    {"angle": "Problem/Solution", "hook": "Hook text for this angle"},
    {"angle": "Social Proof", "hook": "Hook text for this angle"},
    {"angle": "Curiosity", "hook": "Hook text for this angle"}
  ]
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Product page generation failed");

  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("Failed to parse product page data");
  }
}

// ── AI Ad Copy Generator ──────────────────────────────────────
export async function generateAdCopy(params: {
  productName: string;
  productDescription: string;
  targetAudience: string;
  platform: "facebook" | "tiktok" | "whatsapp" | "instagram" | "google";
  country: string;
  angle?: string;
  apiKey: string;
}): Promise<any> {

  const { productName, productDescription, targetAudience, platform, country, angle, apiKey } = params;
  const isNG = country === "NG";

  const platformInstructions: Record<string, string> = {
    facebook: "Facebook/Instagram feed ad — hook + story + CTA. 150 words max.",
    tiktok: "TikTok video script — 30-60 seconds. Hook (3 secs) + problem + reveal + demo + CTA. Include scene descriptions.",
    whatsapp: "WhatsApp broadcast — casual, conversational, emoji-friendly. 80-120 words. Nigerian market tone.",
    instagram: "Instagram caption — engaging, aesthetic, hashtags at end. 100-150 words.",
    google: "Google Ads — 3 headlines (max 30 chars each) + 2 descriptions (max 90 chars each).",
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{
        role: "user",
        content: `Write ${platform} ad copy for: ${productName}
Product: ${productDescription}
Target audience: ${targetAudience}
Market: ${isNG ? "Nigeria" : country}
${angle ? `Angle: ${angle}` : ""}
Format: ${platformInstructions[platform]}

Return ONLY JSON:
{
  "platform": "${platform}",
  "angle": "angle used",
  "primaryCopy": "main ad copy",
  "headline": "attention-grabbing headline",
  "cta": "call to action text",
  "variations": ["variation 1", "variation 2"],
  ${platform === "tiktok" ? '"script": {"hook": "first 3 seconds", "problem": "pain point", "reveal": "product intro", "demo": "what to show", "cta": "end screen text", "suggestedSound": "trending sound type"},' : ""}
  ${platform === "whatsapp" ? '"emojis": ["emoji1", "emoji2"],' : ""}
  "tips": "one tip to improve performance"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Ad copy generation failed");
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { primaryCopy: text, platform };
  }
}

// ── Winning Product Drops ─────────────────────────────────────
export async function getWinningProducts(params: {
  storeId: string;
  niche?: string;
  country: string;
  count: number;
  apiKey: string;
}): Promise<any[]> {

  const { niche, country, count, apiKey } = params;
  const isNG = country === "NG";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Find ${count} winning dropshipping products trending RIGHT NOW ${isNG ? "in Nigeria/Africa" : `in ${country}`} ${niche ? `in the ${niche} niche` : "across all niches"}.

Search for: trending products ${isNG ? "Nigeria" : country} ${new Date().toLocaleDateString("en", { month: "long", year: "numeric" })}

Return ONLY a JSON array of ${count} products:
[{
  "rank": 1,
  "name": "Product name",
  "category": "Category",
  "trendScore": 8.5,
  "trendDirection": "rising",
  "saturationLevel": "low",
  "supplierCostUSD": 12,
  "supplierCostLocal": ${isNG ? "18960" : "12"},
  "recommendedPriceLocal": ${isNG ? "45000" : "45"},
  "margin": 72,
  "aliexpressUrl": "search URL hint",
  "whySelling": "2 sentence reason why this is trending now",
  "targetAudience": "who buys this",
  "bestAdPlatform": "TikTok/Instagram/Facebook",
  "competitionLevel": "low/medium/high",
  "windowOpportunity": "3-4 weeks/already saturated",
  "verdict": "🔥 Hot opportunity / ⚠️ Moderate / ❌ Too saturated"
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
  } catch {
    return [];
  }
}

// ── Profit Calculator ─────────────────────────────────────────
export async function calculateProfit(params: {
  supplierCostUSD: number;
  shippingCostLocal: number;
  sellingPriceLocal: number;
  exchangeRate: number;
  country: string;
  adSpendDaily?: number;
  expectedConversionRate?: number;
}): Promise<any> {

  const { supplierCostUSD, shippingCostLocal, sellingPriceLocal, exchangeRate, country, adSpendDaily = 1000, expectedConversionRate = 2 } = params;

  const sym = country === "NG" ? "₦" : country === "GB" ? "£" : "$";
  const supplierCostLocal = supplierCostUSD * exchangeRate;
  const droposFee = sellingPriceLocal * 0.02;
  const paymentFee = sellingPriceLocal * 0.015 + (country === "NG" ? 100 : 0);
  const totalCosts = supplierCostLocal + shippingCostLocal + droposFee + paymentFee;
  const netProfitPerSale = sellingPriceLocal - totalCosts;
  const marginPercent = Math.round((netProfitPerSale / sellingPriceLocal) * 100);
  const dailyVisitorsNeeded = Math.round(adSpendDaily / (sellingPriceLocal * 0.001));
  const ordersPerDay = Math.round(dailyVisitorsNeeded * (expectedConversionRate / 100));
  const revenuePerDay = ordersPerDay * sellingPriceLocal;
  const profitPerDay = ordersPerDay * netProfitPerSale;
  const breakEvenOrders = Math.ceil(adSpendDaily / netProfitPerSale);
  const monthlyProfitProjection = profitPerDay * 30;

  return {
    breakdown: {
      sellingPrice: `${sym}${sellingPriceLocal.toLocaleString()}`,
      supplierCost: `${sym}${Math.round(supplierCostLocal).toLocaleString()}`,
      shippingCost: `${sym}${shippingCostLocal.toLocaleString()}`,
      droposFee: `${sym}${Math.round(droposFee).toLocaleString()} (2%)`,
      paymentFee: `${sym}${Math.round(paymentFee).toLocaleString()} (Paystack)`,
      totalCosts: `${sym}${Math.round(totalCosts).toLocaleString()}`,
      netProfitPerSale: `${sym}${Math.round(netProfitPerSale).toLocaleString()}`,
      marginPercent: `${marginPercent}%`,
    },
    projections: {
      adSpendDaily: `${sym}${adSpendDaily.toLocaleString()}`,
      ordersPerDay,
      revenuePerDay: `${sym}${Math.round(revenuePerDay).toLocaleString()}`,
      profitPerDay: `${sym}${Math.round(profitPerDay).toLocaleString()}`,
      breakEvenOrders,
      monthlyRevenue: `${sym}${Math.round(revenuePerDay * 30).toLocaleString()}`,
      monthlyProfit: `${sym}${Math.round(monthlyProfitProjection).toLocaleString()}`,
    },
    verdict: marginPercent >= 60 ? "🔥 Excellent margin — go for it"
      : marginPercent >= 40 ? "✅ Good margin — viable product"
      : marginPercent >= 25 ? "⚠️ Tight margin — needs volume"
      : "❌ Too thin — find cheaper supplier",
    recommendation: marginPercent < 40
      ? "Try to negotiate supplier price down or increase selling price by 15-20%"
      : "Strong product — focus on scaling ad spend",
  };
}

// ── Niche Research ────────────────────────────────────────────
export async function researchNiche(params: {
  niche: string;
  country: string;
  apiKey: string;
}): Promise<any> {

  const { niche, country, apiKey } = params;
  const isNG = country === "NG";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Deep research the "${niche}" niche for dropshipping ${isNG ? "in Nigeria" : `in ${country}`}.

Return ONLY JSON:
{
  "niche": "${niche}",
  "overallScore": 7.5,
  "marketSize": "Description of market size",
  "growthDirection": "growing/stable/declining",
  "competitionLevel": "low/medium/high",
  "avgMargin": "45-65%",
  "entryDifficulty": "easy/medium/hard",
  "topProducts": [
    {"name": "product", "avgPrice": "₦15,000", "margin": "60%"},
    {"name": "product", "avgPrice": "₦8,000", "margin": "55%"},
    {"name": "product", "avgPrice": "₦25,000", "margin": "70%"}
  ],
  "targetCustomer": {
    "ageRange": "25-40",
    "gender": "Mostly female/male/mixed",
    "location": "${isNG ? "Lagos, Abuja, PH" : "Urban areas"}",
    "income": "Middle class",
    "motivation": "Why they buy"
  },
  "bestSuppliers": ["AliExpress", "CJDropshipping", "local markets"],
  "seasonality": "Description of when sales peak",
  "bestAdPlatforms": ["Instagram", "TikTok"],
  "commonObjections": ["Objection 1", "Objection 2"],
  "whiteSpaceOpportunity": "Specific gap in market",
  "verdict": "Detailed recommendation paragraph",
  "startingBudget": "₦50,000-100,000"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Niche research failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { niche, error: "Research failed — try again" };
  }
}

// ── Competitor Analysis ───────────────────────────────────────
export async function analyzeCompetitor(params: {
  storeUrl: string;
  storeId: string;
  apiKey: string;
}): Promise<any> {

  const { storeUrl, apiKey } = params;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Analyse this competitor ecommerce store: ${storeUrl}

Search for information about this store and return ONLY JSON:
{
  "storeName": "name",
  "niche": "what they sell",
  "estimatedMonthlyRevenue": "₦X-Y million",
  "productCount": "approximate",
  "avgProductPrice": "price range",
  "designQuality": 7,
  "trustSignals": ["review count", "social proof", "policies"],
  "topProducts": [
    {"name": "product", "price": "₦X", "strength": "why it sells"}
  ],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "opportunities": ["How you can beat them on X", "Gap in their range"],
  "adActivity": "Are they running ads? Which platforms?",
  "socialPresence": "Instagram/TikTok followers estimate",
  "pricingStrategy": "premium/budget/mid-range",
  "verdict": "Overall assessment and how to compete"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Competitor analysis failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { storeUrl, error: "Analysis failed" };
  }
}

// ── Buyer Motivation Analyser ─────────────────────────────────
export async function analyzeBuyerMotivation(params: {
  productName: string;
  country: string;
  apiKey: string;
}): Promise<any> {

  const { productName, country, apiKey } = params;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `Analyse buyer psychology for "${productName}" in ${country} market.

Return ONLY JSON:
{
  "primaryMotivation": "main reason people buy",
  "emotionalTriggers": ["trigger 1", "trigger 2", "trigger 3"],
  "fears": ["fear that drives purchase", "fear of missing out"],
  "desires": ["desire 1", "desire 2"],
  "objections": ["common objection 1", "common objection 2"],
  "bestAdAngle": "most powerful angle to use",
  "powerWords": ["word1", "word2", "word3", "word4", "word5"],
  "avoidWords": ["word to avoid", "word to avoid"],
  "hookFormula": "template for a winning hook",
  "exampleHook": "actual example hook using the formula"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Buyer analysis failed");
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { productName, error: "Analysis failed" };
  }
}
