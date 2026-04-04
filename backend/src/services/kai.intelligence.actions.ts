// ============================================================
// KAI Intelligence Agent Actions
// Path: backend/src/services/kai.intelligence.actions.ts
//
// This file adds all 9 new features to KAI chat.
// Import into kai.agent.service.ts and add to detectAgentAction()
// ============================================================

// ── ADDITIONS TO detectAgentAction() ─────────────────────────
// Add these cases to the existing switch/if chain:

export const INTELLIGENCE_INTENTS = [
  // Ad Spy
  { pattern: /spy.*ad|winning ad|show.*ad|find.*ad|ad.*working|what.*ad.*running/i,
    action:  "ad_spy",
    extract: (m: string) => ({ query: extractNicheFromMessage(m), platform: extractPlatform(m) }) },

  // TikTok Script
  { pattern: /tiktok script|tiktok video|video script|write.*script|create.*script/i,
    action:  "tiktok_script",
    extract: (m: string) => ({ productName: extractProductName(m) }) },

  // Daily Top 10
  { pattern: /top.*product|today.*trending|what.*sell.*today|daily.*winner|best.*product.*today/i,
    action:  "daily_top10",
    extract: () => ({}) },

  // Profit Rules
  { pattern: /protect.*margin|margin.*rule|auto.*price|hide.*stock|profit.*rule/i,
    action:  "add_profit_rule",
    extract: (m: string) => ({
      trigger:   extractTrigger(m),
      threshold: extractPercent(m) || 30,
      action:    extractRuleAction(m),
    }) },

  { pattern: /show.*rule|my.*rule|protection.*rule|what.*rule/i,
    action:  "list_profit_rules",
    extract: () => ({}) },

  // Bulk Import
  { pattern: /bulk.*import|import.*all|import.*store|all.*product.*from/i,
    action:  "bulk_import",
    extract: (m: string) => ({ storeUrl: extractUrl(m) }) },

  // Fulfillment
  { pattern: /unfulfill|need.*fulfill|orders.*ship|pending.*order.*fulfill/i,
    action:  "fulfillment_queue",
    extract: () => ({}) },

  // Price Sync
  { pattern: /sync.*price|check.*price.*change|supplier.*price|update.*price.*supplier/i,
    action:  "price_sync",
    extract: () => ({}) },

  // Competitor Spy
  { pattern: /spy.*store|check.*competitor|analyse.*store|competitor.*store|what.*selling.*at/i,
    action:  "competitor_spy",
    extract: (m: string) => ({ storeUrl: extractUrl(m) }) },

  // Supplier Finder
  { pattern: /find.*supplier|alternative.*supplier|supplier.*for|where.*buy.*wholesale/i,
    action:  "find_suppliers",
    extract: (m: string) => ({ productName: extractProductName(m) }) },
];

// ── KAI SYSTEM PROMPT ADDITIONS ──────────────────────────────
// Add this to kai.prompt.additions.ts → getFeatureKnowledge()

export const INTELLIGENCE_PROMPT = `
INTELLIGENCE FEATURES — you can use all of these:

AD SPY (/dashboard/ad-spy):
- "Show me winning ads for hair products" → searches TikTok/IG/FB for your market
- "What ads are working for kitchen gadgets in Nigeria?"
- When asked about ads or hooks: use the ad spy feature
- Results: winning hooks, angles, best times to run, mistakes to avoid

TIKTOK SCRIPTS (/dashboard/tiktok-scripts):
- "Write me a TikTok script for Brazilian Hair Bundle at ₦35,000"
- "Create a 30-second TikTok video script for my waist trainer"
- Includes: hook, sections with timing, sound suggestions, hashtags, hook variants

DAILY TOP 10 (/dashboard/top-products):
- "What's trending today?" → shows top 10 products with engagement signals
- "What should I sell this week?" → refreshed every 12 hours
- Includes: trend score, saturation level, margin, why it's trending NOW

PROFIT PROTECTION (/dashboard/profit-rules):
- "Alert me if my margin drops below 30%" → creates a rule
- "Auto-hide products that go out of stock" → creates a rule
- "Show me my protection rules" → lists all active rules
- "Run a profit check" → evaluates all rules now

BULK IMPORT (/dashboard/bulk-import):
- "Import all products from this AliExpress store: [URL]" → scans + scores all products
- Owner selects which to import, sets pricing rule (2x, 2.5x, 3x)

FULFILLMENT QUEUE (/dashboard/fulfillment):
- "Show me orders that need fulfilling"
- "What orders are waiting to be shipped?"
- Shows days waiting, supplier links, lets you mark as shipped

PRICE & STOCK SYNC (/dashboard/price-sync):
- "Sync my prices" → checks all products with source URLs against supplier
- "Check if any supplier prices changed"
- Auto-updates cost prices, alerts on stock changes

COMPETITOR SPY (/dashboard/competitor-spy):
- "Spy on this store: [URL]" → full competitive analysis
- "What is [competitor] selling?" → shows their products, revenue, weaknesses
- "How can I beat [competitor]?" → opportunities specific to your market

SUPPLIER FINDER (/dashboard/suppliers):
- "Find me a supplier for waist trainers"
- "Find cheaper supplier for hair bundles under $5"
- "Any local Lagos suppliers for phone accessories?"
- Returns: price, shipping time, quality score, local vs international

When users ask about any of these, use the right tool.
When you lack real-time data for topics like "what's trending", use web search
and anchor to their country (${"`${locale.countryName}`"}).
`;

// ── Helper extractors ─────────────────────────────────────────
function extractNicheFromMessage(m: string): string {
  const match = m.match(/(?:for|about|on|with)\s+([a-zA-Z\s]+?)(?:\s+in|\s+on|\s+ads|$)/i);
  return match?.[1]?.trim() || m.replace(/spy|winning|ads?|show me|find|what.*working/gi, "").trim().slice(0, 40) || "general products";
}

function extractPlatform(m: string): string {
  if (/tiktok/i.test(m))    return "tiktok";
  if (/instagram|ig/i.test(m)) return "instagram";
  if (/facebook|fb/i.test(m))  return "facebook";
  return "all";
}

function extractProductName(m: string): string {
  const q = m.match(/["']([^"']+)["']/)?.[1];
  if (q) return q;
  return m.replace(/tiktok script|video script|write|create|for|script|my/gi, "").trim().slice(0, 60) || "my product";
}

function extractUrl(m: string): string {
  const match = m.match(/https?:\/\/[^\s]+/);
  return match?.[0] || "";
}

function extractPercent(m: string): number | undefined {
  const match = m.match(/(\d+)\s*%/);
  return match ? parseInt(match[1]) : undefined;
}

function extractTrigger(m: string): string {
  if (/margin|profit/.test(m))  return "margin_below";
  if (/stock|inventory/.test(m)) return "out_of_stock";
  if (/price.*rise|rise/.test(m)) return "price_rise";
  if (/price.*drop|drop/.test(m)) return "price_drop";
  return "margin_below";
}

function extractRuleAction(m: string): string {
  if (/hide|remove/.test(m))   return "hide_product";
  if (/auto.*price|adjust/.test(m)) return "auto_reprice";
  return "alert";
}
