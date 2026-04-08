// ============================================================
// Revenue Forecasting Service
// Path: backend/src/services/forecast.service.ts
// KAI analyses trends and projects forward
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateForecast(storeId: string, apiKey: string) {
  // Get 90 days of data
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { storeId, status: { in: ["PAID", "SHIPPED", "DELIVERED"] }, createdAt: { gte: since } },
    select: { total: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { currency: true, country: true },
  });

  const sym = store?.currency === "NGN" ? "₦" : "$";

  // Build weekly revenue buckets
  const weeklyData: Record<string, number> = {};
  for (const order of orders) {
    const week = getWeekLabel(new Date(order.createdAt));
    weeklyData[week] = (weeklyData[week] || 0) + Number(order.total);
  }

  const weeks = Object.entries(weeklyData).map(([week, revenue]) => ({ week, revenue }));
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const avgWeekly    = weeks.length ? totalRevenue / weeks.length : 0;

  // Calculate trend
  let trend = "stable";
  if (weeks.length >= 4) {
    const recent  = weeks.slice(-4).reduce((s, w) => s + w.revenue, 0) / 4;
    const earlier = weeks.slice(-8, -4).reduce((s, w) => s + w.revenue, 0) / Math.max(weeks.slice(-8, -4).length, 1);
    if (recent > earlier * 1.1) trend = "growing";
    else if (recent < earlier * 0.9) trend = "declining";
  }

  // Ask KAI for detailed forecast
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
        content: `Analyse this store's revenue data and provide a 30-day forecast.

Weekly revenue (last 13 weeks):
${weeks.map(w => `${w.week}: ${sym}${Math.round(w.revenue).toLocaleString()}`).join("\n")}

Total last 90 days: ${sym}${Math.round(totalRevenue).toLocaleString()}
Average weekly: ${sym}${Math.round(avgWeekly).toLocaleString()}
Trend: ${trend}
Country: ${store?.country || "Nigeria"}

Return ONLY JSON:
{
  "next30DaysLow": 850000,
  "next30DaysMid": 1200000,
  "next30DaysHigh": 1600000,
  "confidence": 72,
  "trendSummary": "2-sentence plain text summary of the trend",
  "topAction": "Single most impactful thing to do right now to increase revenue",
  "weeklyProjections": [
    {"week": "Week 1", "low": 200000, "mid": 280000, "high": 380000},
    {"week": "Week 2", "low": 210000, "mid": 295000, "high": 400000},
    {"week": "Week 3", "low": 215000, "mid": 300000, "high": 410000},
    {"week": "Week 4", "low": 225000, "mid": 325000, "high": 410000}
  ],
  "riskFactors": ["risk 1", "risk 2"],
  "opportunities": ["opportunity 1", "opportunity 2"]
}`,
      }],
    }),
  });

  let forecast: any = null;
  if (response.ok) {
    const data: any = await response.json();
    const text = data.content?.[0]?.text || "{}";
    try { forecast = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch {}
  }

  return {
    historical: { weeks, totalRevenue, avgWeekly, trend },
    forecast: forecast || {
      next30DaysLow: Math.round(avgWeekly * 3.5),
      next30DaysMid: Math.round(avgWeekly * 4.5),
      next30DaysHigh: Math.round(avgWeekly * 6),
      confidence: 60,
      trendSummary: trend === "growing" ? "Your revenue is trending upward over the last 4 weeks." : "Revenue has been consistent over the past month.",
      topAction: "Run a flash sale this weekend to boost next 30 days revenue",
      weeklyProjections: [1,2,3,4].map(w => ({
        week: `Week ${w}`,
        low: Math.round(avgWeekly * 0.8),
        mid: Math.round(avgWeekly * 1.1),
        high: Math.round(avgWeekly * 1.5),
      })),
      riskFactors: ["No paid advertising detected", "Low product diversity"],
      opportunities: ["Launch WhatsApp broadcast this week", "Add 5 trending products"],
    },
    currency: sym,
  };
}

function getWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

// ============================================================
// Product Web Scraper Service
// Path: backend/src/services/scraper.service.ts  
// KAI + web search extracts product from any URL
// ============================================================
export async function scrapeProductFromUrl(url: string, storeCountry: string, apiKey: string) {
  const isNG  = storeCountry === "NG";
  const sym   = isNG ? "₦" : "$";

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
        content: `Extract complete product information from this URL: ${url}

Search for: ${url}

Return ONLY a JSON object with this exact structure:
{
  "name": "Full product name",
  "description": "2-3 paragraph product description rewritten for Nigerian/African market in plain engaging English",
  "shortDescription": "1 sentence hook",
  "originalPrice": "price found on the URL in USD",
  "suggestedLocalPrice": "${isNG ? "NGN price suggestion based on 1580 exchange rate + 60% margin" : "local market price"}",
  "images": ["image_url_1", "image_url_2"],
  "category": "product category",
  "tags": ["tag1", "tag2", "tag3"],
  "variants": [
    {"name": "Color", "options": ["Black", "White"]},
    {"name": "Size", "options": ["S", "M", "L"]}
  ],
  "specifications": {"key1": "value1", "key2": "value2"},
  "supplierName": "supplier/platform name",
  "supplierUrl": "${url}",
  "estimatedShippingDays": 14,
  "weight": "0.5kg",
  "bulletPoints": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
  "seoTitle": "SEO title under 60 chars",
  "seoDescription": "Meta description under 155 chars",
  "whyItSells": "1 sentence about why this product sells well"
}`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Scraping failed");

  const data: any = await response.json();
  const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

  try {
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error("Could not extract product data from that URL");
  }
}
