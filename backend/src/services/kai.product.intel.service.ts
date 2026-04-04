// ============================================================
// KAI Product Intelligence Service
// Path: backend/src/services/kai.product.intel.service.ts
//
// Three features:
// 1. Product score (0-100) before import
// 2. Marketing angle generator (4 options)
// 3. AliExpress review scraper + auto-import
// ============================================================
import prisma from "../lib/prisma";
import { getLocale } from "../utils/kai.locale";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// ══════════════════════════════════════════════════════════════
// 1. PRODUCT SCORE — analyse before import
// ══════════════════════════════════════════════════════════════
export interface ProductScore {
  total:        number;   // 0-100
  grade:        string;   // S / A / B / C / D / F
  verdict:      string;   // "🔥 Strong winner" etc
  color:        string;   // hex for UI
  breakdown: {
    margin:      { score: number; label: string; detail: string };
    demand:      { score: number; label: string; detail: string };
    competition: { score: number; label: string; detail: string };
    trend:       { score: number; label: string; detail: string };
    reviews:     { score: number; label: string; detail: string };
  };
  pricing: {
    supplierUSD:      number;
    supplierLocal:    number;
    suggestedLocal:   number;
    margin:           number;
    symbol:           string;
  };
  recommendation: string;
  shouldImport:   boolean;
}

export async function scoreProduct(params: {
  url:         string;
  storeId:     string;
  scrapedData: any;   // from the existing scraper
}): Promise<ProductScore> {
  const store = await prisma.store.findUnique({
    where:  { id: params.storeId },
    select: { country: true, currency: true },
  });

  const locale      = getLocale(store?.country || "NG");
  const sym         = locale.currencySymbol;
  const rate        = locale.exchangeRateToUSD;
  const { scrapedData } = params;

  const supplierUSD   = Number(scrapedData.originalPrice || 5);
  const supplierLocal = Math.round(supplierUSD * rate);
  const suggestedLocal = Math.round(supplierLocal * 2.5);
  const marginPct      = Math.round(((suggestedLocal - supplierLocal) / suggestedLocal) * 100);

  // Call Claude to analyse the product
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 700,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role:    "user",
        content: `Score this dropshipping product for the ${locale.countryName} market.

Product: ${scrapedData.name}
Category: ${scrapedData.category}
Supplier price: $${supplierUSD} (${sym}${supplierLocal.toLocaleString()})
Suggested selling price: ${sym}${suggestedLocal.toLocaleString()}
Margin: ${marginPct}%
Supplier reviews: ${scrapedData.rating || "unknown"} stars, ${scrapedData.reviewCount || "unknown"} reviews
Orders on platform: ${scrapedData.ordersCount || "unknown"}

Search: "${scrapedData.name} trending ${locale.countryName} ${new Date().getFullYear()}"

Score each dimension out of 20:
- margin (is ${marginPct}% good for ${locale.countryName}? Typical is ${locale.typicalMargin})
- demand (is this product in demand in ${locale.countryName} right now?)
- competition (how saturated is this in ${locale.countryName}?)
- trend (is this trending up or down in ${locale.countryName}?)
- reviews (supplier reviews and order count quality)

Return ONLY JSON:
{
  "margin":      {"score":17,"detail":"68% margin — strong for ${locale.countryName}"},
  "demand":      {"score":15,"detail":"High search volume in Lagos and Abuja"},
  "competition": {"score":12,"detail":"Medium competition — room to enter"},
  "trend":       {"score":16,"detail":"Rising on ${locale.tiktokRegion} this month"},
  "reviews":     {"score":14,"detail":"4.6 stars with 50k+ orders — proven seller"},
  "recommendation":"One sentence on whether to sell this in ${locale.countryName}",
  "shouldImport": true
}`,
      }],
    }),
  });

  let analysis: any = null;

  if (response.ok) {
    const data: any   = await response.json();
    const textBlock   = data.content?.find((b: any) => b.type === "text");
    if (textBlock?.text) {
      try {
        analysis = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
      } catch {}
    }
  }

  // Fallback scoring based on data we have
  if (!analysis) {
    analysis = {
      margin:      { score: marginPct >= 60 ? 18 : marginPct >= 40 ? 14 : 8,  detail: `${marginPct}% margin` },
      demand:      { score: 14, detail: "Could not verify demand data" },
      competition: { score: 13, detail: "Competition level unknown" },
      trend:       { score: 13, detail: "Trend data unavailable" },
      reviews:     {
        score: scrapedData.rating >= 4.5 ? 18 : scrapedData.rating >= 4.0 ? 14 : 10,
        detail: scrapedData.rating ? `${scrapedData.rating} stars` : "No review data",
      },
      recommendation: `Verify demand in ${locale.countryName} before importing`,
      shouldImport: marginPct >= 40,
    };
  }

  const total = Math.min(100, Math.round(
    (analysis.margin.score + analysis.demand.score + analysis.competition.score +
     analysis.trend.score + analysis.reviews.score) / 5 * 5
  ));

  const grade = total >= 90 ? "S" : total >= 80 ? "A" : total >= 70 ? "B" :
                total >= 60 ? "C" : total >= 50 ? "D" : "F";

  const verdicts: Record<string, string> = {
    S: "🔥 Exceptional — import immediately",
    A: "✅ Strong winner — high confidence",
    B: "👍 Good product — worth testing",
    C: "⚠️ Average — proceed with caution",
    D: "🤔 Weak — find a better product",
    F: "❌ Skip — not worth your time",
  };

  const colors: Record<string, string> = {
    S: "#a78bfa", A: "#34d399", B: "#60a5fa",
    C: "#fbbf24", D: "#fb923c", F: "#f87171",
  };

  return {
    total,
    grade,
    verdict: verdicts[grade],
    color:   colors[grade],
    breakdown: {
      margin:      { score: analysis.margin.score,      label: "Margin",      detail: analysis.margin.detail },
      demand:      { score: analysis.demand.score,      label: "Demand",      detail: analysis.demand.detail },
      competition: { score: analysis.competition.score, label: "Competition", detail: analysis.competition.detail },
      trend:       { score: analysis.trend.score,       label: "Trend",       detail: analysis.trend.detail },
      reviews:     { score: analysis.reviews.score,     label: "Reviews",     detail: analysis.reviews.detail },
    },
    pricing: { supplierUSD, supplierLocal, suggestedLocal, margin: marginPct, symbol: sym },
    recommendation: analysis.recommendation,
    shouldImport:   analysis.shouldImport,
  };
}

// ══════════════════════════════════════════════════════════════
// 2. MARKETING ANGLES — 4 options before page generation
// ══════════════════════════════════════════════════════════════
export interface MarketingAngle {
  id:          string;
  title:       string;
  hook:        string;
  audience:    string;
  emoji:       string;
  adPlatform:  string;
  description: string;
}

export async function generateMarketingAngles(params: {
  productName:  string;
  productDesc:  string;
  category:     string;
  country:      string;
}): Promise<MarketingAngle[]> {
  const locale = getLocale(params.country || "NG");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 800,
      messages: [{
        role:    "user",
        content: `Generate 4 distinct marketing angles for this product in ${locale.countryName}.

Product: ${params.productName}
Category: ${params.category}
Description: ${params.productDesc?.slice(0, 200)}
Market: ${locale.countryName}
Top ad platforms here: ${locale.adPlatforms.slice(0, 2).join(", ")}

Create 4 angles that appeal to DIFFERENT buyer types in ${locale.countryName}.
Each angle should feel completely different — different audience, different emotion, different hook.
Reference ${locale.countryName} context naturally.

Return ONLY a JSON array of exactly 4 angles:
[
  {
    "id": "angle_1",
    "title": "Short angle title (3-5 words)",
    "hook": "Opening line for the ad (max 15 words, punchy)",
    "audience": "Who this targets in ${locale.countryName}",
    "emoji": "one relevant emoji",
    "adPlatform": "Best platform for this angle in ${locale.countryName}",
    "description": "What this angle emphasises (1 sentence)"
  }
]`,
      }],
    }),
  });

  if (!response.ok) return getFallbackAngles(params.productName, locale.countryName);

  const data: any = await response.json();
  const text      = data.content?.[0]?.text || "[]";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return Array.isArray(parsed) ? parsed.slice(0, 4) : getFallbackAngles(params.productName, locale.countryName);
  } catch {
    return getFallbackAngles(params.productName, locale.countryName);
  }
}

function getFallbackAngles(productName: string, countryName: string): MarketingAngle[] {
  return [
    { id: "angle_1", emoji: "💡", title: "Problem Solver",     hook: `Tired of doing this the hard way?`,             audience: "Practical buyers", adPlatform: "TikTok",     description: "Focuses on the problem this product solves" },
    { id: "angle_2", emoji: "✨", title: "Upgrade Your Life",  hook: `This changed everything for me.`,               audience: "Aspirational buyers", adPlatform: "Instagram", description: "Focuses on lifestyle improvement" },
    { id: "angle_3", emoji: "💰", title: "Smart Spending",     hook: `Stop wasting money on the wrong thing.`,        audience: "Value-conscious buyers", adPlatform: "WhatsApp", description: "Focuses on value and savings" },
    { id: "angle_4", emoji: "🔥", title: "Everyone's Getting It", hook: `Why everyone in ${countryName} wants this.`, audience: "FOMO buyers", adPlatform: "TikTok",     description: "Focuses on social proof and trends" },
  ];
}

// ══════════════════════════════════════════════════════════════
// 3. REVIEW IMPORT — scrape supplier reviews
// ══════════════════════════════════════════════════════════════
export interface ImportedReview {
  reviewerName:    string;
  reviewerCountry: string;
  rating:          number;
  title:           string;
  body:            string;
  date:            string;
  verified:        boolean;
  helpful:         number;
}

export async function importReviewsFromUrl(params: {
  url:      string;
  storeId:  string;
  productId: string;
  count?:   number;
}): Promise<{ reviews: ImportedReview[]; imported: number }> {
  const count = params.count || 8;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-sonnet-4-20250514",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role:    "user",
        content: `Extract ${count} real customer reviews from this product URL: ${params.url}

Search for reviews of this product.
Extract real reviews — actual customer feedback, not generated.
Translate any non-English reviews to English naturally.
Do NOT fabricate reviews — only include what actually exists.

Return ONLY JSON array:
[
  {
    "reviewerName": "First name + last initial only (e.g. 'Sarah M.')",
    "reviewerCountry": "Country name or 'Verified Buyer'",
    "rating": 5,
    "title": "Review title if exists, else first 6 words of review",
    "body": "Full review text in English (translate if needed)",
    "date": "Month Year format e.g. 'March 2024'",
    "verified": true,
    "helpful": 12
  }
]

If you cannot find real reviews, return an empty array [].
Do NOT make up reviews.`,
      }],
    }),
  });

  if (!response.ok) return { reviews: [], imported: 0 };

  const data: any = await response.json();
  const textBlock  = data.content?.find((b: any) => b.type === "text");
  if (!textBlock?.text) return { reviews: [], imported: 0 };

  let reviews: ImportedReview[] = [];
  try {
    const parsed = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
    reviews      = Array.isArray(parsed) ? parsed.filter(r => r.body && r.rating) : [];
  } catch {
    return { reviews: [], imported: 0 };
  }

  if (reviews.length === 0) return { reviews: [], imported: 0 };

  // Save to database
  await Promise.all(reviews.map(r =>
    prisma.review.create({
      data: {
        productId:    params.productId,
        storeId:      params.storeId,
        reviewerName: r.reviewerName,
        country:      r.reviewerCountry,
        rating:       Math.min(5, Math.max(1, r.rating)),
        title:        r.title || "",
        body:         r.body,
        isVerified:   r.verified,
        helpfulCount: r.helpful || 0,
        source:       "imported",
        createdAt:    new Date(),
      } as any,
    }).catch(() => null)
  ));

  return { reviews, imported: reviews.length };
}

// ══════════════════════════════════════════════════════════════
// Combined: score + angles in one call (for the UI flow)
// ══════════════════════════════════════════════════════════════
export async function analyseProductFull(params: {
  url:         string;
  storeId:     string;
  scrapedData: any;
}) {
  const store = await prisma.store.findUnique({
    where:  { id: params.storeId },
    select: { country: true },
  });

  const country = store?.country || "NG";

  // Run score + angles in parallel for speed
  const [score, angles] = await Promise.all([
    scoreProduct({ url: params.url, storeId: params.storeId, scrapedData: params.scrapedData }),
    generateMarketingAngles({
      productName:  params.scrapedData.name,
      productDesc:  params.scrapedData.description,
      category:     params.scrapedData.category,
      country,
    }),
  ]);

  return { score, angles, scrapedData: params.scrapedData };
}
