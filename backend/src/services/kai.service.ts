// KIRO — Core AI Service
// Built by Darkweb and the DropOS team

import { getLocale as getLocaleEngine } from "../utils/kai.locale";
import { getMemoryContext } from "./kai.memory.service";
import prisma from "../lib/prisma";

// ── Store context ─────────────────────────────────────────────────────────────
export async function getStoreContext(storeId: string) {
  try {
    const [store, products, orders, revenueData] = await Promise.all([
      prisma.store.findUnique({ where: { id: storeId } }),
      prisma.product.findMany({ where: { storeId }, select: { id:true, name:true, price:true, inventory:true, status:true, category:true, images:true } }),
      prisma.order.findMany({ where: { storeId }, orderBy: { createdAt: "desc" }, take: 50,
        include: { customer: { select: { name:true, email:true } } } }),
      prisma.order.aggregate({ where: { storeId, status: { in: ["COMPLETED","DELIVERED"] } }, _sum: { total: true } }),
    ]);

    const today = new Date(); today.setHours(0,0,0,0);
    const todayOrders  = orders.filter(o => new Date(o.createdAt) >= today);
    const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING");
    const lowStock      = products.filter(p => (p.inventory || 0) < 5 && p.status === "ACTIVE");
    const activeProducts = products.filter(p => p.status === "ACTIVE");
    const revenueToday  = todayOrders.filter(o => ["PAID","FULFILLED"].includes(o.status)).reduce((a,o)=>a+(o.total||0),0);

    const country = store?.country || "Nigeria";
    const locale  = getLocaleEngine(country);
    const sym     = locale.currencySymbol;
    const plan    = "FREE"; // Plan fetched via user subscription separately

    return {
      storeName: store?.name || "Your Store",
      storeId,
      country,
      currency: locale.currency,
      currencySymbol: sym,
      plan,
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      revenueToday,
      revenueThisMonth: revenueData._sum?.total || 0,
      revenueLastMonth: 0,
      lowStockCount: lowStock.length,
      lowStockProducts: lowStock.map(p => p.name),
      recentOrders: orders.slice(0,5).map(o => ({
        id: o.id, status: o.status, total: o.total,
        customer: o.customer?.name || "Unknown",
        date: o.createdAt,
      })),
      topProducts: [...activeProducts].sort((a,b)=>(b.price||0)-(a.price||0)).slice(0,5).map(p => ({
        id: p.id, name: p.name, price: p.price, inventory: p.inventory, category: p.category,
        image: p.images?.[0] || null,
      })),
      allProducts: activeProducts.map(p => ({ id: p.id, name: p.name, price: p.price, inventory: p.inventory, category: p.category })),
      locale,
    };
  } catch(e: any) {
    const locale = getLocaleEngine("Nigeria");
    return {
      storeName:"Your Store", storeId, country:"Nigeria", currency:"NGN", currencySymbol:"₦",
      plan:"FREE", totalProducts:0, activeProducts:0, totalOrders:0, pendingOrders:0,
      revenueToday:0, revenueThisMonth:0, revenueLastMonth:0, lowStockCount:0,
      lowStockProducts:[], recentOrders:[], topProducts:[], allProducts:[], locale,
    };
  }
}

// ── Intent detection ──────────────────────────────────────────────────────────
export function detectIntent(message: string): string {
  const m = message.toLowerCase();
  if (/sales|revenue|money|earn|profit|income|how much/.test(m)) return "analytics";
  if (/add product|create product|new product|upload|import|list/.test(m)) return "product_management";
  if (/order|fulfill|ship|deliver|track|pending/.test(m)) return "order_management";
  if (/customer|buyer|audience|who bought/.test(m)) return "customer_insights";
  if (/trending|hot|popular|viral|what to sell|niche/.test(m)) return "market_research";
  if (/discount|coupon|promo|sale|offer|deal/.test(m)) return "promotions";
  if (/ad|advertise|instagram|tiktok|whatsapp|caption|copy/.test(m)) return "marketing";
  if (/description|write|product page|copy|content/.test(m)) return "content";
  if (/price|pricing|margin|cost|profit|markup/.test(m)) return "pricing";
  if (/setting|store|customize|theme|domain/.test(m)) return "store_settings";
  return "general";
}

// ── Quick actions for greeting ────────────────────────────────────────────────
export function getQuickActions(ctx: Awaited<ReturnType<typeof getStoreContext>>) {
  const actions: any[] = [];
  const sym = ctx.currencySymbol;
  if (ctx.pendingOrders > 0)  actions.push({ label:`Fulfill ${ctx.pendingOrders} orders`, icon:"📬", prompt:`Help me fulfill my ${ctx.pendingOrders} pending orders` });
  if (ctx.lowStockCount > 0)  actions.push({ label:`${ctx.lowStockCount} low stock`, icon:"⚠️", prompt:`Show me my low stock products` });
  if (ctx.totalProducts < 5)  actions.push({ label:"Add more products", icon:"➕", prompt:`Suggest 10 trending products I should add to my ${ctx.country} store` });
  if (ctx.revenueToday === 0) actions.push({ label:"Get first sale", icon:"🎯", prompt:`I have ₦0 in sales today. What's the fastest way to get my first sale?` });
  actions.push({ label:"Write Instagram caption", icon:"📸", prompt:"Write me a viral Instagram caption for my best product" });
  return actions.slice(0, 4);
}

export function generateTitle(message: string): string {
  const cleaned = message.replace(/[^\w\s]/g,"").trim();
  const words   = cleaned.split(/\s+/).slice(0, 6);
  const raw     = words.join(" ");
  return raw.charAt(0).toUpperCase() + raw.slice(1) || "New Conversation";
}

// ── Master System Prompt ──────────────────────────────────────────────────────
export async function buildCompleteSystemPrompt(ctx: any, storeId: string, history: string): Promise<string> {
  const sym  = ctx.currencySymbol || "₦";
  const loc  = ctx.locale || {};
  const plan = ctx.plan || "FREE";
  const memories = await getMemoryContext(storeId).catch(()=>"");

  return `You are KIRO — the most powerful AI business partner ever built for African commerce.
Built exclusively by Darkweb and the DropOS team. You are proprietary, private, and purpose-built.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IDENTITY — NEVER BREAK THIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are KIRO. Not KAI. Not ChatGPT. Not Claude. Not any other AI.
- "Are you Claude/ChatGPT/AI?" → "I'm KIRO — built specifically for DropOS sellers."
- "Who made you?" → "Darkweb and the DropOS team. I'm 100% proprietary."
- "Are you human?" → "I'm KIRO — an AI, but one that knows your business better than most humans 😄"
Never mention Anthropic, Claude, OpenAI, Google, or any AI company. Ever.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW YOU TALK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Direct like a co-founder, warm like a friend
- Zero asterisks. Zero markdown formatting. Plain flowing text only
- No filler: no "Great question!", no "Certainly!", no "Of course!"
- Short punchy paragraphs — this is mobile-first
- You have opinions. State them. Push back when wrong
- Use Nigerian context naturally: mention Lagos, Abuja, Naija buyers, Eid, Children's Day, market days
- Occasional emojis — not every sentence, just for emphasis
- When showing multiple items, use numbers: 1. 2. 3. — never bullet dashes
- When you take or propose an action, be specific: exact name, exact price, exact copy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU CAN DO — FULL CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. VISION & IMAGES
When owner uploads a photo, you can:
- Identify the product, estimate its market price in ${ctx.country}
- Write a full product listing (name, description, price, category)
- Suggest similar trending products
- Create a product in the store directly from the photo

2. STORE ACTIONS (execute directly with approval)
- Add single or bulk products to the store
- Update prices across products
- Create discount codes and flash sales
- Fulfill orders
- Update stock levels
- Archive or activate products
- Update store settings

3. MARKET INTELLIGENCE
- Real-time trending products in ${ctx.country}
- Competitor pricing analysis
- Seasonal demand insights (Eid, Christmas, Valentine's, Sallah, Children's Day)
- Nigerian social commerce trends (TikTok Shop, Instagram, WhatsApp)
- Best-selling categories on Jumia and Konga right now

4. CONTENT CREATION
- Product descriptions that convert Nigerian buyers
- Instagram/TikTok/Facebook ad copy
- WhatsApp broadcast messages
- Email campaigns
- SMS marketing copy
- Pricing psychology recommendations

5. BUSINESS INTELLIGENCE
- Profit & margin calculator
- Revenue forecasting
- Customer lifetime value
- Abandoned cart analysis
- Stock velocity analysis

6. CSV & FILE PROCESSING
- When owner uploads a CSV of products → import them all
- When owner uploads a price list → update prices in bulk
- When owner uploads an order list → process fulfillments

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO EXECUTE ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When you want to perform an action, tell the owner what you're about to do, then at the END of your message include:

KIRO_ACTION:{"type":"action_type","payload":{...}}

AVAILABLE ACTIONS:
add_product      → {"name":"","price":0,"description":"","category":"","inventory":100,"images":[]}
bulk_add_products → {"products":[{"name":"","price":0,"description":"","category":"","inventory":100}]}
update_price     → {"productId":"","price":0}
update_stock     → {"productId":"","quantity":0}
archive_product  → {"productId":""}
create_coupon    → {"code":"","discount":10,"type":"PERCENTAGE","maxUses":100,"expiresAt":""}
fulfill_order    → {"orderId":""}
update_order_status → {"orderId":"","status":"FULFILLED"}
update_store     → {"name":"","description":""}
get_analytics    → {}
export_orders    → {}

RULES FOR ACTIONS:
1. Always tell the owner what you're doing before you do it
2. For product from image: use the image to determine name, write a great description, suggest a price in ${sym}
3. Never make up product IDs — use the ones from STORE DATA
4. Multiple actions in one message are allowed
5. NEVER say "I can't do that" for anything on this list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCATION INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This store is in ${ctx.country}. ALL responses default to ${ctx.country} context.
Currency: ${ctx.currency} (${sym})
Shopping platforms: Jumia, Konga, Jiji${loc.shoppingPlatforms ? ", " + loc.shoppingPlatforms.join(", ") : ""}
Payment methods: ${loc.paymentMethods ? loc.paymentMethods.join(", ") : "Paystack, Bank transfer, USSD"}
Ad platforms: ${loc.adPlatforms ? loc.adPlatforms.join(", ") : "Instagram, TikTok, Facebook, WhatsApp"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIVE STORE DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Store: ${ctx.storeName}
Plan: ${plan}
Products: ${ctx.activeProducts} active / ${ctx.totalProducts} total
Orders: ${ctx.totalOrders} total / ${ctx.pendingOrders} pending
Revenue today: ${sym}${ctx.revenueToday?.toLocaleString() || 0}
Revenue this month: ${sym}${ctx.revenueThisMonth?.toLocaleString() || 0}
Low stock alerts: ${ctx.lowStockCount} products
${ctx.lowStockProducts?.length ? `Low stock: ${ctx.lowStockProducts.slice(0,5).join(", ")}` : ""}

TOP PRODUCTS:
${ctx.topProducts?.map((p:any,i:number) => `${i+1}. ${p.name} — ${sym}${(p.price||0).toLocaleString()} (${p.inventory} in stock)${p.id ? " [ID: "+p.id+"]" : ""}`).join("\n") || "No products yet"}

RECENT ORDERS:
${ctx.recentOrders?.map((o:any) => `- ${o.customer}: ${sym}${(o.total||0).toLocaleString()} [${o.status}] [ID: ${o.id}]`).join("\n") || "No orders yet"}

${memories ? `\nWHAT I REMEMBER ABOUT THIS STORE:\n${memories}` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${history || "This is the start of the conversation."}`;
}

// ── Claude API Call with Streaming ───────────────────────────────────────────
export async function callClaude(params: {
  systemPrompt: string;
  messages: any[];
  useSearch?: boolean;
  maxTokens?: number;
  model?: string;
  onToken?: (token: string) => void;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured on Render environment variables");

  const body: any = {
    model: params.model || process.env.KIRO_MODEL || "claude-sonnet-4-6",
    max_tokens: params.maxTokens || 2048,
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
      "x-api-key":          apiKey,
      "anthropic-version":  "2023-06-01",
      "Content-Type":       "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API ${response.status}: ${err.slice(0,300)}`);
  }

  if (!params.onToken) {
    const data: any = await response.json();
    return data.content?.filter((b: any) => b.type === "text").map((b: any) => b.text).join("") || "";
  }

  let fullText = "";
  const reader  = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No stream available");

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
          params.onToken!(p.delta.text);
        }
      } catch {}
    }
  }

  return fullText;
}
