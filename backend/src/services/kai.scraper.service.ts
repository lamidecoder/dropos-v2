// ── KIRO Universal Web Scraper & Product Intelligence ─────────────────────────
// Scrapes ANY URL: AliExpress, Temu, Amazon, Jumia, Konga, Shein,
// TikTok Shop, Instagram, websites, direct image links — everything.
// Uses Anthropic web_search tool so no headless browser needed.

import { getLocale } from "../utils/kai.locale";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

export interface ScrapedProduct {
  name:                string;
  description:         string;
  shortDescription:    string;
  originalPriceUSD:    number;
  suggestedLocalPrice: number;
  images:              string[];
  category:            string;
  tags:                string[];
  variants:            Array<{ name: string; options: string[] }>;
  specifications:      Record<string, string>;
  supplierName:        string;
  supplierUrl:         string;
  estimatedShippingDays: number;
  bulletPoints:        string[];
  seoTitle:            string;
  seoDescription:      string;
  whyItSells:          string;
  marginPct:           number;
  profitPerSale:       number;
  currencySymbol:      string;
  platformDetected:    string;
}

// Detect platform from URL
function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("aliexpress"))   return "AliExpress";
  if (u.includes("temu"))         return "Temu";
  if (u.includes("amazon"))       return "Amazon";
  if (u.includes("jumia"))        return "Jumia";
  if (u.includes("konga"))        return "Konga";
  if (u.includes("shein"))        return "Shein";
  if (u.includes("tiktok"))       return "TikTok Shop";
  if (u.includes("instagram"))    return "Instagram";
  if (u.includes("1688"))         return "1688 (China wholesale)";
  if (u.includes("dhgate"))       return "DHgate";
  if (u.includes("cjdropshipping")) return "CJ Dropshipping";
  if (u.includes("alibaba"))      return "Alibaba";
  if (u.includes("ebay"))         return "eBay";
  if (u.includes("etsy"))         return "Etsy";
  if (u.includes("walmart"))      return "Walmart";
  if (u.includes("shopify"))      return "Shopify Store";
  return "Online Store";
}

// ── Main scraper — works on any URL ─────────────────────────────────────────
export async function scrapeAnyUrl(
  url: string,
  storeCountry: string,
  storeCurrency: string
): Promise<ScrapedProduct> {
  const locale   = getLocale(storeCountry);
  const sym      = locale.currencySymbol;
  const rate     = locale.exchangeRateToUSD;
  const platform = detectPlatform(url);

  const prompt = `You are a product research expert. Extract complete product information from this URL.

URL: ${url}
Platform detected: ${platform}
Target market: ${locale.countryName} (${storeCurrency})
Exchange rate: 1 USD = ${rate} ${storeCurrency}

Use your web search tool to fetch and read this URL, then extract ALL product details.

Return ONLY valid JSON (no markdown, no explanation):
{
  "name": "Full product name (translate to English if needed)",
  "description": "3-4 paragraphs rewritten for ${locale.countryName} market. Use engaging English, mention local relevance. Do NOT mention the source platform.",
  "shortDescription": "One punchy sentence hook that makes people want to buy",
  "originalPriceUSD": number (price on the source platform in USD, estimate if in other currency),
  "images": ["url1", "url2", "url3"],
  "category": "Electronics | Fashion | Beauty | Home | Health | Sports | Baby | Food | Other",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "variants": [{"name": "Color", "options": ["Black", "White"]}, {"name": "Size", "options": ["S", "M", "L"]}],
  "specifications": {"key": "value"},
  "estimatedShippingDays": number,
  "weight": "Xkg",
  "bulletPoints": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
  "seoTitle": "SEO title under 60 chars",
  "seoDescription": "Meta description under 155 chars",
  "whyItSells": "One sentence: why this specific product sells well right now"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Scraping failed: ${err.slice(0, 100)}`);
  }

  const data: any = await response.json();
  const textBlock = data.content?.find((b: any) => b.type === "text");
  const text = textBlock?.text || "{}";

  let product: any;
  try {
    product = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { product = JSON.parse(match[0]); }
      catch { throw new Error("Could not extract product data. The URL may be restricted or the page may require login."); }
    } else {
      throw new Error("Could not extract product data from that URL.");
    }
  }

  // Calculate pricing
  const supplierUSD    = Number(product.originalPriceUSD || 5);
  const supplierLocal  = Math.round(supplierUSD * rate);
  const suggestedLocal = Math.round(supplierLocal * (rate > 100 ? 2.2 : 2.0)); // Higher margin for NG
  const marginPct      = Math.round(((suggestedLocal - supplierLocal) / suggestedLocal) * 100);
  const profitPerSale  = suggestedLocal - supplierLocal;

  return {
    ...product,
    originalPriceUSD:    supplierUSD,
    suggestedLocalPrice: suggestedLocal,
    marginPct,
    profitPerSale,
    currencySymbol:      sym,
    supplierUrl:         url,
    supplierName:        product.supplierName || platform,
    platformDetected:    platform,
    images:              (product.images || []).filter((i: string) => i && i.startsWith("http")),
  };
}

// ── Batch URL scraper ─────────────────────────────────────────────────────────
export async function scrapeMultipleUrls(
  urls: string[],
  storeCountry: string,
  storeCurrency: string
): Promise<{ url: string; product?: ScrapedProduct; error?: string }[]> {
  const results = await Promise.allSettled(
    urls.map(url => scrapeAnyUrl(url, storeCountry, storeCurrency))
  );
  return results.map((r, i) => ({
    url: urls[i],
    product: r.status === "fulfilled" ? r.value : undefined,
    error:   r.status === "rejected"  ? (r.reason as Error).message : undefined,
  }));
}

// ── Profit calculator ─────────────────────────────────────────────────────────
export function calculateProfit(params: {
  supplierPriceUSD:    number;
  sellingPriceLocal:   number;
  shippingCostLocal:   number;
  country:             string;
  adSpendPerSaleLocal: number;
}) {
  const locale        = getLocale(params.country);
  const sym           = locale.currencySymbol;
  const rate          = locale.exchangeRateToUSD;
  const supplierLocal = Math.round(params.supplierPriceUSD * rate);
  const droposFee     = Math.round(params.sellingPriceLocal * 0.02);   // 2% DropOS fee
  const paystackFee   = Math.round(params.sellingPriceLocal * 0.015);  // 1.5% Paystack
  const totalCosts    = supplierLocal + params.shippingCostLocal + droposFee + paystackFee + params.adSpendPerSaleLocal;
  const netProfit     = params.sellingPriceLocal - totalCosts;
  const marginPct     = Math.round((netProfit / params.sellingPriceLocal) * 100);
  const breakEvenQty  = netProfit > 0 ? 0 : Math.ceil(Math.abs(netProfit) / (params.sellingPriceLocal - totalCosts + params.adSpendPerSaleLocal));

  return {
    supplierCost:    `${sym}${supplierLocal.toLocaleString()}`,
    shippingCost:    `${sym}${params.shippingCostLocal.toLocaleString()}`,
    droposFee:       `${sym}${droposFee.toLocaleString()}`,
    paystackFee:     `${sym}${paystackFee.toLocaleString()}`,
    adSpend:         `${sym}${params.adSpendPerSaleLocal.toLocaleString()}`,
    totalCosts:      `${sym}${totalCosts.toLocaleString()}`,
    sellingPrice:    `${sym}${params.sellingPriceLocal.toLocaleString()}`,
    netProfit:       `${sym}${Math.abs(netProfit).toLocaleString()}`,
    isProfit:        netProfit > 0,
    marginPct,
    verdict: marginPct >= 50 ? "🔥 Excellent margin" :
             marginPct >= 35 ? "✅ Good margin" :
             marginPct >= 20 ? "⚠️ Tight margin" : "❌ Too low to be worth it",
  };
}

// ── Market research for any product/niche ─────────────────────────────────────
export async function researchMarket(query: string, country: string): Promise<string> {
  const locale = getLocale(country);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Research this for a dropshipping store owner in ${locale.countryName}: "${query}"

Search for current trends, prices, competition, and demand in ${locale.countryName}.
Look at: local marketplaces (${locale.shoppingPlatforms.join(", ")}), social media trends, competitor stores.

Respond in plain text (no markdown, no asterisks). Cover:
1. Is this a good opportunity right now in ${locale.countryName}?
2. What prices are competitors charging?
3. Who is buying this and why?
4. Best marketing angle for ${locale.countryName} buyers
5. Verdict: pursue or avoid

Be specific with numbers. Use ${locale.currencySymbol} for prices.`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Research failed");
  const data: any = await response.json();
  const text = data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
  return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#{1,6}\s/g, "").trim();
}

// ── Trending products for a country ──────────────────────────────────────────
export async function getTrendingProducts(country: string, niche?: string): Promise<string> {
  const locale = getLocale(country);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `What products are trending RIGHT NOW for dropshipping in ${locale.countryName}${niche ? ` in the ${niche} niche` : ""}?

Search TikTok trends, ${locale.shoppingPlatforms.join(", ")}, Instagram ${locale.countryName}, Google Trends ${locale.countryName}.

Find 8 specific products that are selling well TODAY. For each:
- Product name and description
- Why it's trending now (specific reason)
- Estimated supplier price and suggested selling price in ${locale.currencySymbol}
- Where to source it
- Who is buying it

Plain text only. No markdown. Specific products only, not categories.`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Trending research failed");
  const data: any = await response.json();
  return data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
}

// ── Facebook Ad Library search ────────────────────────────────────────────────
export async function searchFacebookAds(params: {
  product: string;
  country: string;
}): Promise<string> {
  const locale = getLocale(params.country);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey(), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Search Facebook Ad Library for ads about "${params.product}" targeting ${locale.countryName} market.

Search for: "Facebook Ad Library ${params.product} ${locale.countryName}" and "site:facebook.com/ads/library ${params.product}"

Find what ads are currently running. For each ad found:
- Describe the creative angle (what hook they use)
- Mention how long the ad has been running (if visible)
- Note the ad format (video/image/carousel)
- Identify what works about it

Then give a verdict: what angles are saturated and what gaps exist.

Write in plain text, no markdown. Be specific about real ads you find.`,
      }],
    }),
  });
  if (!response.ok) throw new Error("Ad library search failed");
  const data: any = await response.json();
  return data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
}

// ── TikTok Ad Spy ─────────────────────────────────────────────────────────────
export async function spyTikTokAds(params: {
  product: string;
  country: string;
}): Promise<string> {
  const locale = getLocale(params.country);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey(), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Find viral TikTok content and ads about "${params.product}" in ${locale.countryName} right now.

Search: "${params.product} TikTok ${locale.countryName} viral 2026" and "${params.product} tiktok shop ${locale.tiktokRegion}"

For each video or ad trend found:
- The hook used in the first 3 seconds
- Why it went viral (emotion, problem, surprise)
- View count or engagement if visible
- The exact angle that made it work
- Which sounds or trends it used

Then: write one winning TikTok script hook for ${locale.countryName} audience selling this product.

Plain text only.`,
      }],
    }),
  });
  if (!response.ok) throw new Error("TikTok spy failed");
  const data: any = await response.json();
  return data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
}

// ── Saturation Detector ───────────────────────────────────────────────────────
export async function detectSaturation(params: {
  product: string;
  country: string;
}): Promise<{
  score: number;       // 1-10 (10 = very saturated)
  verdict: string;     // green/yellow/red
  label: string;
  reasons: string[];
  opportunity: string;
  raw: string;
}> {
  const locale = getLocale(params.country);
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey(), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Analyse market saturation for "${params.product}" in ${locale.countryName} dropshipping market.

Search: "${params.product} sellers ${locale.countryName}" and "${params.product} ${locale.shoppingPlatforms[0]}" and "${params.product} dropshipping ${locale.countryName} 2026"

Count how many sellers, how much competition, how much advertising is happening.

Return ONLY JSON:
{
  "score": 7,
  "verdict": "yellow",
  "label": "Moderate competition",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "opportunity": "What gap exists that a new seller could exploit"
}

score 1-3 = green (low competition, good entry point)
score 4-6 = yellow (moderate, differentiation needed)
score 7-10 = red (very saturated, hard to compete)`,
      }],
    }),
  });
  if (!response.ok) throw new Error("Saturation check failed");
  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";
  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return { ...parsed, raw: text };
  } catch {
    return { score:5, verdict:"yellow", label:"Unable to determine", reasons:["Search returned unclear results"], opportunity:"Try searching manually for current seller count", raw:text };
  }
}
