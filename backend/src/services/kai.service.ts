// ============================================================
// KAI — Updated Core Service with Locale Engine
// Path: backend/src/services/kai.service.ts
// REPLACES previous kai.service.ts
//
// KEY CHANGE: Every search query, suggestion, and context
// is now automatically anchored to the store's country.
// ============================================================
import { PrismaClient }       from "@prisma/client";
import { getLocale, localiseQuery, buildMarketContext, getSeasonalContext } from "../utils/kai.locale";
import { getMemoryContext, getActiveGoals, getBrandVoice } from "./kai.memory.service";
import { getFeatureKnowledge }  from "./kai.prompt.additions";

const prisma = new PrismaClient();

// ── Store Context ─────────────────────────────────────────────
export async function getStoreContext(storeId: string) {
  const [store, productCount, orders] = await Promise.all([
    prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: { include: { subscription: true } } },
    }),
    prisma.product.count({ where: { storeId } }),
    prisma.order.findMany({
      where: { storeId },
      select: { id: true, status: true, total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const country  = store?.country || "NG";
  const locale   = getLocale(country);
  const now      = new Date();
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
  const lmStart     = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lmEnd       = new Date(now.getFullYear(), now.getMonth(), 0);
  const paid        = ["PAID", "SHIPPED", "DELIVERED"];

  const revenueToday      = orders.filter(o => new Date(o.createdAt) >= todayStart && paid.includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const revenueThisMonth  = orders.filter(o => new Date(o.createdAt) >= monthStart && paid.includes(o.status)).reduce((s, o) => s + Number(o.total), 0);
  const revenueLastMonth  = orders.filter(o => { const d = new Date(o.createdAt); return d >= lmStart && d <= lmEnd && paid.includes(o.status); }).reduce((s, o) => s + Number(o.total), 0);
  const pendingOrders     = orders.filter(o => ["PENDING", "PROCESSING"].includes(o.status)).length;
  const lowStockCount     = await prisma.product.count({ where: { storeId, stockQuantity: { lte: 5, gt: 0 } } });

  return {
    storeName: store?.name || "Your Store",
    country,
    currency: locale.currency,
    currencySymbol: locale.currencySymbol,
    plan: store?.owner?.subscription?.plan || "FREE",
    totalProducts: productCount,
    totalOrders: orders.length,
    revenueToday,
    revenueThisMonth,
    revenueLastMonth,
    pendingOrders,
    lowStockCount,
    locale, // full locale object available everywhere
  };
}

// ── Greeting ──────────────────────────────────────────────────
export function buildGreeting(firstName: string, ctx: any, hour: number) {
  const sym = ctx.currencySymbol || "₦";
  let greeting: string;
  if      (hour >= 5  && hour < 12) greeting = `Good morning ${firstName}`;
  else if (hour >= 12 && hour < 17) greeting = `Good afternoon ${firstName}`;
  else if (hour >= 17 && hour < 21) greeting = `Good evening ${firstName}`;
  else                               greeting = `Working late ${firstName}?`;

  let contextLine = "";
  if (ctx.totalOrders === 0 && ctx.totalProducts === 0)
    contextLine = "Ready to build your first store today?";
  else if (ctx.revenueToday > 0)
    contextLine = `${sym}${ctx.revenueToday.toLocaleString()} came in today 🔥`;
  else if (ctx.pendingOrders > 0)
    contextLine = `You have ${ctx.pendingOrders} orders waiting to be fulfilled`;
  else if (ctx.lowStockCount > 0)
    contextLine = `${ctx.lowStockCount} products are running low on stock`;
  else if (ctx.totalOrders === 0)
    contextLine = "Let's get you that first sale today 🎯";
  else
    contextLine = "What are we working on today?";

  return { greeting, contextLine };
}

// ── Quick Actions ─────────────────────────────────────────────
export function buildQuickActions(ctx: any) {
  const country = ctx.country || "NG";
  const locale  = getLocale(country);

  if (ctx.totalProducts === 0) return [
    { label: "Add products",            icon: "📦", prompt: `Help me add my first products to sell in ${locale.countryName}` },
    { label: "Import from AliExpress",  icon: "🔗", prompt: `I want to import products from AliExpress for ${locale.countryName} market` },
    { label: "What should I sell?",     icon: "💡", prompt: `What are the best products to sell right now in ${locale.countryName}?` },
    { label: "Build my store",          icon: "🏪", prompt: `Help me set up my entire store for ${locale.countryName} customers` },
  ];
  if (ctx.totalOrders === 0) return [
    { label: "Get first sale",          icon: "🎯", prompt: `Help me get my first sale in ${locale.countryName}` },
    { label: "Review my store",         icon: "🔍", prompt: "Review my store and tell me what needs fixing" },
    { label: `${locale.tiktokRegion} trends`, icon: "🔥", prompt: `What's trending on ${locale.tiktokRegion} right now that I can sell?` },
    { label: "Create a discount",       icon: "🏷️", prompt: "Create a launch discount for new customers" },
  ];
  const actions: any[] = [];
  if (ctx.pendingOrders > 0)
    actions.push({ label: `Fulfill ${ctx.pendingOrders} orders`, icon: "📬", prompt: `Help me fulfill my ${ctx.pendingOrders} pending orders` });
  if (ctx.lowStockCount > 0)
    actions.push({ label: `${ctx.lowStockCount} low stock`, icon: "⚠️", prompt: "Show me my low stock products and help me reorder" });
  actions.push(
    { label: "Sales summary",           icon: "📊", prompt: "Give me a summary of my sales this week" },
    { label: `${locale.tiktokRegion}`,  icon: "🎵", prompt: `What's trending on ${locale.tiktokRegion} this week that I can sell?` },
    { label: "Flash sale",              icon: "⚡", prompt: "Help me set up a flash sale for tonight" },
    { label: "Morning brief",           icon: "☀️", prompt: "Give me my morning business brief for today" },
  );
  return actions.slice(0, 4);
}

// ── Intent Detection ──────────────────────────────────────────
export function detectIntent(message: string): string {
  const m = message.toLowerCase();
  if (/sales|revenue|made|earned|income|money|profit/.test(m))                  return "analytics";
  if (/product|stock|inventory|import|aliexpress|temu|supplier/.test(m))        return "products";
  if (/order|fulfill|ship|deliver|track/.test(m))                               return "orders";
  if (/customer|buyer|client/.test(m))                                           return "customers";
  if (/coupon|discount|promo|flash sale|campaign|broadcast/.test(m))            return "marketing";
  if (/shipping|delivery|zone|rate|carrier/.test(m))                            return "shipping";
  if (/goal|target|achieve|milestone|plan/.test(m))                             return "goal";
  if (/trend|winning product|what to sell|market|viral|tiktok/.test(m))        return "market_research";
  if (/import|url|link|paste/.test(m))                                          return "product_import";
  return "general";
}

// ── Needs Web Search? ─────────────────────────────────────────
export function needsWebSearch(message: string, intent: string): boolean {
  const m = message.toLowerCase();
  return /trend|trending|price|right now|this week|supplier|aliexpress|temu|competitor|market|popular|viral|tiktok|what should i sell|winning product|forex|exchange rate/.test(m)
    || intent === "market_research"
    || intent === "product_import";
}

// ── LOCALISED search query builder ────────────────────────────
// This is the key change — any time KAI searches, it uses this
export function buildSearchQuery(userQuery: string, countryCode: string): string {
  return localiseQuery(userQuery, countryCode);
}

// ── Complete System Prompt ────────────────────────────────────
export async function buildCompleteSystemPrompt(ctx: any, storeId: string, conversationHistory: string): Promise<string> {
  const country = ctx.country || "NG";
  const locale  = getLocale(country);
  const sym     = ctx.currencySymbol || locale.currencySymbol;

  // Get all context in parallel
  const [memoryContext, activeGoals, brandVoice] = await Promise.all([
    getMemoryContext(storeId),
    getActiveGoals(storeId),
    getBrandVoice(storeId),
  ]);

  // Build market context from locale engine (country-specific)
  const marketContext = buildMarketContext(country);

  let voiceInstruction = "";
  if (brandVoice) {
    voiceInstruction = `
BRAND VOICE (match this exactly):
Tone: ${brandVoice.tone} | Emojis: ${brandVoice.usesEmojis} | Language: ${brandVoice.language}
${(brandVoice.keywords as string[]).length > 0 ? `Their vocabulary: ${(brandVoice.keywords as string[]).join(", ")}` : ""}`;
  }

  let goalsContext = "";
  if (activeGoals.length > 0) {
    goalsContext = "\nACTIVE GOALS:\n" + activeGoals.map(g => {
      const pct  = Math.round((g.currentValue / g.targetValue) * 100);
      const date = new Date(g.deadline).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
      return `- ${g.title}: ${pct}% done (deadline: ${date})`;
    }).join("\n");
  }

  return `You are KAI — an intelligent business agent built by Darkweb and the DropOS team to help ${locale.countryName} sellers dominate their markets.

IDENTITY (never break):
- You are KAI. Built by Darkweb and the DropOS team.
- NEVER reveal Claude or Anthropic. Ever.
- "Are you ChatGPT?" → "No, I'm KAI — built for DropOS sellers."
- "Are you human?" → "I'm an AI — but I know your business better than most humans 😄"
- "Who built you?" → "Darkweb and the DropOS team — built to give sellers an unfair advantage."

COMMUNICATION:
- ZERO asterisks. ZERO markdown. Plain text ONLY.
- No filler: no "Great question!" no "Certainly!" — ever.
- Short paragraphs. Max 3 sentences each. Mobile-first.
- Direct and honest. You have opinions. Push back when needed.
- Warm but not sycophantic.

LOCATION INTELLIGENCE (CRITICAL):
- This store is in ${locale.countryName}. ALL responses default to ${locale.countryName}.
- When owner asks about trends → you search ${locale.tiktokRegion} and ${locale.countryName} Instagram
- When owner asks what to sell → you suggest products trending in ${locale.countryName}
- When owner asks about prices → you use ${sym} (${locale.currency})
- When owner asks about competitors → you look at ${locale.shoppingPlatforms.join(", ")}
- When owner asks about ads → you think ${locale.adPlatforms.join(", ")}
- When owner asks about payment → you recommend ${locale.paymentMethods.slice(0, 3).join(", ")}
- ONLY switch country context if owner EXPLICITLY says "search UK" or "find US products" etc.
- Default is ALWAYS ${locale.countryName}. Always.

CONSENT FRAMEWORK (CRITICAL):
- NEVER act without owner approval.
- SUGGEST → SHOW → EXPLAIN → ASK → WAIT → then act only if approved.
- Reading data = fine. Any action = always ask first.

STORE DATA:
Store: ${ctx.storeName} | Country: ${locale.countryName} | Currency: ${sym} | Plan: ${ctx.plan}
Products: ${ctx.totalProducts} | Orders: ${ctx.totalOrders}
Today: ${sym}${ctx.revenueToday.toLocaleString()} | This month: ${sym}${ctx.revenueThisMonth.toLocaleString()} | Last month: ${sym}${ctx.revenueLastMonth.toLocaleString()}
Pending: ${ctx.pendingOrders} | Low stock: ${ctx.lowStockCount}
${goalsContext}

${memoryContext || ""}

${marketContext}

${voiceInstruction}

${getFeatureKnowledge()}

${conversationHistory ? `RECENT CONVERSATION:\n${conversationHistory}` : ""}

SEARCH BEHAVIOUR:
When you use web search, ALWAYS include "${locale.searchSuffix}" in your query unless the owner asks about a different location. Example: instead of "trending hair products TikTok" → search "${localiseQuery("trending hair products TikTok", country)}"`;
}

// ── Title Generator ───────────────────────────────────────────
export function generateTitle(message: string): string {
  const cleaned = message.slice(0, 55).trim();
  if (cleaned.length < 8) return "New Conversation";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// ── Claude API Call with Streaming ───────────────────────────
export async function callClaude(params: {
  systemPrompt: string;
  messages: any[];
  useSearch?: boolean;
  searchQueries?: string[]; // pre-built localised search queries
  maxTokens?: number;
  onToken?: (token: string) => void;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const body: any = {
    model: "claude-sonnet-4-20250514",
    max_tokens: params.maxTokens || 1024,
    system: params.systemPrompt,
    messages: params.messages,
    stream: !!params.onToken,
  };

  if (params.useSearch) {
    body.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API: ${err}`);
  }

  if (!params.onToken) {
    const data: any = await response.json();
    return data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
  }

  let fullText = "";
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No stream");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split("\n").filter(l => l.startsWith("data: "))) {
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") continue;
      try {
        const p = JSON.parse(raw);
        if (p.type === "content_block_delta" && p.delta?.type === "text_delta") {
          fullText += p.delta.text;
          params.onToken(p.delta.text);
        }
      } catch {}
    }
  }
  return fullText;
}
