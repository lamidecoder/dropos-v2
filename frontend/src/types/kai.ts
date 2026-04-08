// ============================================================
// KAI — Complete TypeScript Types (10/10 Vision)
// Path: frontend/src/types/kai.ts
// ============================================================

export type KaiRole = "user" | "assistant";

export type KaiIntent =
  | "analytics" | "products" | "orders" | "customers"
  | "marketing" | "shipping" | "settings"
  | "market_research" | "product_import" | "general"
  | "goal" | "memory" | "voice";

// ── Messages & Conversations ──────────────────────────────────
export interface KaiMessage {
  id: string;
  role: KaiRole;
  content: string;
  createdAt: string;
  metadata?: {
    intent?: KaiIntent;
    dataCards?: KaiDataCard[];
    actions?: KaiAction[];
    searched?: boolean;
    fromMemory?: boolean;
    pulse?: boolean;
  };
}

export interface KaiConversation {
  id: string;
  title: string;
  storeId: string;
  pinned: boolean;
  archived: boolean;
  messages: KaiMessage[];
  createdAt: string;
  updatedAt: string;
}

// ── Data Cards (inline in chat) ───────────────────────────────
export type KaiDataCardType =
  | "revenue" | "orders" | "products" | "customers"
  | "analytics" | "trending" | "alert" | "goal_progress";

export interface KaiDataCard {
  type: KaiDataCardType;
  title: string;
  value?: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  items?: Array<{ label: string; value: string; sub?: string }>;
  progress?: number; // 0-100
  color?: string;
}

// ── Actions ───────────────────────────────────────────────────
export interface KaiAction {
  id: string;
  type:
    | "add_product" | "update_order_status" | "create_coupon"
    | "create_flash_sale" | "update_price" | "bulk_price_update"
    | "send_broadcast" | "create_campaign" | "process_refund"
    | "update_goal" | "set_reminder";
  label: string;
  description: string;
  payload: Record<string, any>;
  approved?: boolean;
  executed?: boolean;
}

// ── Memory ────────────────────────────────────────────────────
export interface KaiMemoryEntry {
  id: string;
  storeId: string;
  category: KaiMemoryCategory;
  key: string;
  value: string;
  confidence: number; // 0-1
  learnedAt: string;
  lastUsed: string;
}

export type KaiMemoryCategory =
  | "business_fact"     // store sells X, based in Lagos
  | "owner_preference"  // always rejects electronics suggestions
  | "seasonal_pattern"  // sales peak on Fridays
  | "supplier_note"     // CJ delivers faster than AliExpress
  | "customer_insight"  // most customers from Abuja
  | "goal"              // wants ₦500k/month by June
  | "brand_voice"       // writes casually, uses emojis
  | "market_insight"    // Brazilian hair trending in March
  | "failure"           // flash sales don't work for this store
  | "success";          // WhatsApp broadcasts get 40% conversion

// ── Goals ─────────────────────────────────────────────────────
export interface KaiGoal {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // "NGN", "orders", "customers"
  deadline: string;
  status: "active" | "achieved" | "behind" | "abandoned";
  milestones: KaiMilestone[];
  createdAt: string;
}

export interface KaiMilestone {
  id: string;
  goalId: string;
  title: string;
  targetValue: number;
  achieved: boolean;
  achievedAt?: string;
}

// ── KAI Skills (saved prompts) ────────────────────────────────
export interface KaiSkill {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  prompt: string;
  variables: string[]; // e.g. ["product_name", "discount"]
  icon?: string;
  usageCount: number;
  createdAt: string;
}

// ── KAI Pulse (proactive alerts) ─────────────────────────────
export interface KaiPulseAlert {
  id: string;
  storeId: string;
  type: KaiPulseType;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "opportunity";
  read: boolean;
  actionable: boolean;
  suggestedPrompt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

export type KaiPulseType =
  | "conversion_drop" | "checkout_problem" | "competitor_opportunity"
  | "pricing_opportunity" | "low_stock_critical" | "sales_milestone"
  | "trend_alert" | "customer_churn_risk" | "revenue_goal"
  | "unfulfilled_orders" | "morning_brief";

// ── Brand Voice ───────────────────────────────────────────────
export interface KaiBrandVoice {
  storeId: string;
  tone: "formal" | "casual" | "energetic" | "warm" | "professional";
  usesEmojis: boolean;
  language: "english" | "pidgin" | "yoruba" | "igbo" | "hausa";
  sentenceLength: "short" | "medium" | "long";
  keywords: string[];  // words they use often
  avoidWords: string[]; // words they never use
  sampleContent: string;
  analyzedAt: string;
}

// ── Market Intelligence ───────────────────────────────────────
export interface KaiMarketData {
  key: string;
  category: "jumia_trending" | "aliexpress_trending" | "tiktok_trending"
    | "forex" | "pricing" | "seasonal";
  data: any;
  fetchedAt: string;
  expiresAt: string;
}

// ── Morning Brief ─────────────────────────────────────────────
export interface KaiMorningBrief {
  storeId: string;
  date: string;
  revenueLastNight: number;
  ordersLastNight: number;
  topOpportunity: string;
  urgentAction?: string;
  trendAlert?: string;
  goalProgress?: { title: string; percent: number };
  generatedAt: string;
}

// ── Quick Actions ─────────────────────────────────────────────
export interface KaiQuickAction {
  label: string;
  icon: string;
  prompt: string;
}

// ── Store Context ─────────────────────────────────────────────
export interface KaiStoreContext {
  storeName: string;
  niche?: string;
  country?: string;
  currency?: string;
  totalProducts: number;
  totalOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  lowStockCount: number;
  pendingOrders: number;
  plan: string;
  topProducts?: Array<{ name: string; sold: number }>;
  recentMemories?: KaiMemoryEntry[];
  activeGoals?: KaiGoal[];
  brandVoice?: KaiBrandVoice;
}
