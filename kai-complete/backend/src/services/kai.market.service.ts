// ============================================================
// KAI — Market Intelligence Service
// Path: backend/src/services/kai.market.service.ts
// Pre-fetches Jumia, AliExpress, TikTok trends daily
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Cache helpers ─────────────────────────────────────────────
async function setCache(key: string, category: string, data: any, ttlHours: number): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await prisma.kaiMarketCache.upsert({
    where: { key },
    create: { key, category, data, expiresAt },
    update: { data, expiresAt, updatedAt: new Date() },
  });
}

async function getCache(key: string): Promise<any | null> {
  const entry = await prisma.kaiMarketCache.findUnique({ where: { key } });
  if (!entry) return null;
  if (new Date() > entry.expiresAt) return null;
  return entry.data;
}

// ── Forex Rates (hourly) ──────────────────────────────────────
export async function fetchForexRates(): Promise<Record<string, number>> {
  const cached = await getCache("forex_rates");
  if (cached) return cached;

  try {
    const response = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) throw new Error("Forex API failed");
    const data: any = await response.json();
    const rates = {
      NGN: data.rates?.NGN || 1580,
      GHS: data.rates?.GHS || 15.2,
      KES: data.rates?.KES || 130,
      ZAR: data.rates?.ZAR || 18.5,
      GBP: data.rates?.GBP || 0.79,
      EUR: data.rates?.EUR || 0.92,
    };
    await setCache("forex_rates", "forex", rates, 1);
    return rates;
  } catch {
    return { NGN: 1580, GHS: 15.2, KES: 130, ZAR: 18.5, GBP: 0.79, EUR: 0.92 };
  }
}

// ── Nigerian Seasonal Calendar ────────────────────────────────
export async function getSeasonalContext(): Promise<string> {
  const month = new Date().getMonth() + 1;
  const day   = new Date().getDate();

  const calendar: Record<number, string> = {
    1:  "New Year deals trending. January slump in most niches. Push budget products.",
    2:  "Valentine's Day approaching (14th). Gift products, couples items trending now.",
    3:  "End of Q1. Easter preparation beginning. Seasonal fashion picks up.",
    4:  "Easter season. Fashion, food, gifts all trending. Post-Easter clearance.",
    5:  "Children's Day (27th May). Kids products trending late May.",
    6:  "Mid-year. School resumption products trending. Back-to-school in some states.",
    7:  "Summer vibes. Fashion and lifestyle strong. Mid-year sales opportunity.",
    8:  "School resumption in most states. School supplies, fashion, bags trending.",
    9:  "End of Q3. Fashion strong. Sallah-related products may trend.",
    10: "October brand awareness month. Tech products trending. Pre-Christmas planning.",
    11: "Black Friday (last Friday). Biggest shopping month. Start campaigns early.",
    12: "Christmas and New Year. Gifts, fashion, food all peak. Highest revenue month.",
  };

  let context = calendar[month] || "Standard trading period.";

  // Payday awareness (last week of month and first week)
  if (day >= 22 || day <= 7) {
    context += " Payday period — customers have money to spend. Push premium products.";
  } else if (day >= 8 && day <= 15) {
    context += " Mid-month — budget-conscious period. Push value deals and bundles.";
  }

  return context;
}

// ── Get all market context for KAI prompt ────────────────────
export async function getMarketContext(country = "NG"): Promise<string> {
  const [forex, seasonal] = await Promise.all([
    fetchForexRates(),
    getSeasonalContext(),
  ]);

  const usdToNgn = forex.NGN;
  const lines = [
    "LIVE MARKET INTELLIGENCE:",
    `Exchange rates: $1 = ₦${usdToNgn.toLocaleString()} | £1 = ₦${(usdToNgn * (1/forex.GBP)).toFixed(0)}`,
    `AliExpress cost formula: multiply USD price × ${usdToNgn} for NGN cost`,
    `Seasonal context: ${seasonal}`,
  ];

  // Add any cached trending data
  const trending = await getCache(`trending_nigeria_${new Date().toISOString().split("T")[0]}`);
  if (trending?.products?.length > 0) {
    lines.push(`Trending products in Nigeria today: ${trending.products.slice(0, 5).join(", ")}`);
  }

  return lines.join("\n");
}

// ── Daily market intelligence fetch (called by cron) ─────────
export async function runDailyMarketFetch(apiKey: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Use Claude with web search to get trending products
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{
          role: "user",
          content: `Search for trending products to sell in Nigeria right now. 
Return ONLY a JSON object: {"products":["product1","product2","product3","product4","product5"],"categories":["cat1","cat2"],"summary":"one sentence about market"}`,
        }],
      }),
    });

    if (response.ok) {
      const data: any = await response.json();
      const textBlock = data.content?.find((b: any) => b.type === "text");
      if (textBlock?.text) {
        try {
          const parsed = JSON.parse(textBlock.text.replace(/```json|```/g, "").trim());
          await setCache(`trending_nigeria_${today}`, "tiktok_trending", parsed, 24);
        } catch {}
      }
    }
  } catch {}

  // Refresh forex
  await fetchForexRates();
}

// ── Get KAI Skills for a store ────────────────────────────────
export async function getKaiSkills(storeId: string) {
  const [storeSkills, globalSkills] = await Promise.all([
    prisma.kaiSkill.findMany({
      where: { storeId },
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.kaiSkill.findMany({
      where: { isGlobal: true },
      orderBy: { usageCount: "desc" },
      take: 10,
    }),
  ]);

  return { storeSkills, globalSkills };
}

// ── Create default skills for new stores ─────────────────────
export async function seedDefaultSkills(): Promise<void> {
  const defaults = [
    {
      name: "Weekly Revenue Summary",
      prompt: "Give me a detailed summary of my revenue, orders, and top products for the last 7 days",
      icon: "📊",
      variables: [],
    },
    {
      name: "Flash Sale Setup",
      prompt: "Help me set up a flash sale for tonight at 8pm with a 20% discount",
      icon: "⚡",
      variables: [],
    },
    {
      name: "WhatsApp Broadcast",
      prompt: "Write a WhatsApp broadcast message to promote my best-selling products to my customers",
      icon: "📱",
      variables: [],
    },
    {
      name: "Product Research",
      prompt: "Find me 5 trending products to add to my store right now with high margins",
      icon: "🔍",
      variables: [],
    },
    {
      name: "Low Stock Report",
      prompt: "Show me all products running low on stock and help me decide what to reorder first",
      icon: "⚠️",
      variables: [],
    },
    {
      name: "New Arrival Post",
      prompt: "Write Instagram and WhatsApp captions for my new arrivals this week",
      icon: "✨",
      variables: [],
    },
  ];

  for (const skill of defaults) {
    const exists = await prisma.kaiSkill.findFirst({
      where: { isGlobal: true, name: skill.name },
    });
    if (!exists) {
      await prisma.kaiSkill.create({
        data: {
          storeId: "global",
          isGlobal: true,
          name: skill.name,
          prompt: skill.prompt,
          icon: skill.icon,
          variables: skill.variables,
        },
      });
    }
  }
}
