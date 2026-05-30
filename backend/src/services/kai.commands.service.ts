// KIRO Quick Commands - power user shortcuts
// Type / in chat to access these instantly

import { prisma } from "../config/database";

export interface QuickCommand {
  command: string;
  label: string;
  description: string;
  icon: string;
  category: "sales" | "products" | "marketing" | "analytics" | "operations";
  prompt: string;  // What KIRO does when triggered
  requiresInput?: boolean;
  inputLabel?: string;
}

export const QUICK_COMMANDS: QuickCommand[] = [
  // SALES
  {
    command: "/flash-sale",
    label: "Run Flash Sale",
    description: "Launch a time-limited flash sale across products",
    icon: "Zap",
    category: "sales",
    prompt: "Help me launch a flash sale. Suggest which products to discount based on inventory and sales velocity, then create the flash sale with optimal pricing for maximum urgency.",
  },
  {
    command: "/discount",
    label: "Create Discount Code",
    description: "Generate a discount code with smart pricing",
    icon: "Tag",
    category: "sales",
    prompt: "Create a smart discount code for my store. Suggest a code name and discount percentage based on my margins.",
    requiresInput: true,
    inputLabel: "What's the occasion? (e.g. weekend, first-time buyer)",
  },
  {
    command: "/bogo",
    label: "Buy One Get One",
    description: "Set up BOGO offer on selected products",
    icon: "Gift",
    category: "sales",
    prompt: "Set up a BOGO (buy one get one) offer. Recommend which products to include for highest profit retention.",
  },

  // PRODUCTS
  {
    command: "/import",
    label: "Import Products",
    description: "Import from AliExpress, Temu, Amazon, etc.",
    icon: "Download",
    category: "products",
    prompt: "I want to import products. Tell me which platforms you can scrape from, then I'll paste a URL.",
    requiresInput: true,
    inputLabel: "Paste product URL or supplier store URL",
  },
  {
    command: "/audit",
    label: "Product Audit",
    description: "Find products that need attention",
    icon: "Search",
    category: "products",
    prompt: "Do a full audit of my products. Show me: 1) products with no images, 2) products with no description, 3) products with prices that look wrong, 4) products with low inventory. Then suggest fixes.",
  },
  {
    command: "/rewrite",
    label: "Rewrite Descriptions",
    description: "Improve all product descriptions with AI",
    icon: "Edit",
    category: "products",
    prompt: "Review all my products and identify which descriptions need improvement. For each, write a better version that will convert Nigerian buyers.",
  },
  {
    command: "/price-check",
    label: "Price Audit",
    description: "Check if my prices are competitive",
    icon: "TrendingUp",
    category: "products",
    prompt: "Audit my product prices. For each product, tell me if it's too high, too low, or just right based on the Nigerian market. Suggest specific price changes.",
  },

  // MARKETING
  {
    command: "/whatsapp",
    label: "WhatsApp Broadcast",
    description: "Send broadcast to customers",
    icon: "MessageCircle",
    category: "marketing",
    prompt: "Help me write a WhatsApp broadcast. Suggest the best message type for my customer list right now (promo, restock alert, abandoned cart, win-back).",
    requiresInput: true,
    inputLabel: "What do you want to announce?",
  },
  {
    command: "/email",
    label: "Email Campaign",
    description: "Create an email campaign",
    icon: "Mail",
    category: "marketing",
    prompt: "Create an email campaign for my customers. Pick the best campaign type for right now and write the full email.",
    requiresInput: true,
    inputLabel: "Campaign goal (e.g. drive sales, announce new product)",
  },
  {
    command: "/abandoned",
    label: "Recover Abandoned Carts",
    description: "Send recovery messages to abandoned carts",
    icon: "ShoppingCart",
    category: "marketing",
    prompt: "Check my abandoned carts. Show me how many there are, total value at risk, and send a recovery WhatsApp/email to each.",
  },
  {
    command: "/instagram",
    label: "Instagram Post Copy",
    description: "Write Instagram caption with hashtags",
    icon: "Instagram",
    category: "marketing",
    prompt: "Write me an Instagram post caption with relevant Nigerian hashtags.",
    requiresInput: true,
    inputLabel: "What product/topic?",
  },
  {
    command: "/tiktok",
    label: "TikTok Script",
    description: "Generate viral TikTok script",
    icon: "Video",
    category: "marketing",
    prompt: "Write me a TikTok script that's likely to go viral in Nigeria. Hook in 3 seconds, fast cuts, call to action.",
    requiresInput: true,
    inputLabel: "What product?",
  },

  // ANALYTICS
  {
    command: "/insights",
    label: "Store Insights",
    description: "Daily AI summary of your store",
    icon: "BarChart",
    category: "analytics",
    prompt: "Give me a complete insight report on my store right now: top performers, what needs attention, what's growing, what's dying, and 3 specific actions I should take today.",
  },
  {
    command: "/trending",
    label: "Trending Products",
    description: "What's hot in Nigeria right now",
    icon: "Flame",
    category: "analytics",
    prompt: "Show me what's trending in Nigeria right now. Categories with high demand, products selling fast on Jumia/Konga/TikTok Shop, seasonal opportunities.",
  },
  {
    command: "/forecast",
    label: "Sales Forecast",
    description: "Predict next 30 days revenue",
    icon: "LineChart",
    category: "analytics",
    prompt: "Forecast my sales for the next 30 days. Show predicted revenue, predicted orders, what's likely to drive growth, what could slow it down.",
  },

  // OPERATIONS
  {
    command: "/fulfill",
    label: "Fulfill Orders",
    description: "Process all pending orders",
    icon: "Package",
    category: "operations",
    prompt: "Show me all unfulfilled orders. For each one, prepare the fulfillment with supplier details. I'll approve them and you process.",
  },
  {
    command: "/refund",
    label: "Process Refund",
    description: "Handle a customer refund",
    icon: "RotateCcw",
    category: "operations",
    prompt: "Help me process a refund. Ask me which order, then handle it end-to-end.",
    requiresInput: true,
    inputLabel: "Order ID or customer name",
  },
  {
    command: "/stock",
    label: "Stock Check",
    description: "Inventory audit and reorder",
    icon: "Archive",
    category: "operations",
    prompt: "Check my inventory levels. Show low stock items, items that need reorder, and items overstocked. Suggest restock actions.",
  },
];

// Get suggested commands based on store state
export async function getSuggestedCommands(storeId: string): Promise<QuickCommand[]> {
  if (!storeId || storeId === "public") return QUICK_COMMANDS.slice(0, 6);

  try {
    const [products, orders, carts] = await Promise.all([
      prisma.product.count({ where: { storeId } }).catch(() => 0),
      prisma.order.count({ where: { storeId, fulfillmentStatus: "UNFULFILLED" } }).catch(() => 0),
      (prisma as any).cart?.count?.({ where: { storeId, status: "ABANDONED" } }).catch(() => 0),
    ]);

    const suggested: QuickCommand[] = [];

    // No products yet → suggest import
    if (products === 0) {
      suggested.push(QUICK_COMMANDS.find(c => c.command === "/import")!);
      suggested.push(QUICK_COMMANDS.find(c => c.command === "/trending")!);
    }

    // Unfulfilled orders → suggest fulfill
    if (orders > 0) {
      suggested.push(QUICK_COMMANDS.find(c => c.command === "/fulfill")!);
    }

    // Abandoned carts → suggest recover
    if (carts > 0) {
      suggested.push(QUICK_COMMANDS.find(c => c.command === "/abandoned")!);
    }

    // Always suggest insights + flash sale
    suggested.push(QUICK_COMMANDS.find(c => c.command === "/insights")!);
    suggested.push(QUICK_COMMANDS.find(c => c.command === "/flash-sale")!);

    return suggested.filter(Boolean).slice(0, 6);
  } catch {
    return QUICK_COMMANDS.slice(0, 6);
  }
}
