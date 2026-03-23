// src/routes/kai.routes.ts
import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { prisma } from "../config/database";

const router = Router();
router.use(authenticate);

// ── Demo responses when no API key set ───────────────────────────────────────
const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm KAI, your DropOS business partner! 🚀 To unlock my full AI capabilities, add your ANTHROPIC_API_KEY to the Render environment. For now, I'm running in demo mode — but I can still help you navigate DropOS!",
  sales: "Here's a quick sales tip: Focus on your best-selling products and run flash sales on weekends — that's when Nigerian shoppers are most active! 📊",
  product: "To add products: go to **Products** in your sidebar → click **Add Product** → fill in name, price, description, upload images → set status to **Active**. Your product goes live instantly! 📦",
  store: "Your store is the foundation of everything! Make sure you: ✅ Add clear product photos ✅ Write compelling descriptions ✅ Set competitive prices ✅ Enable WhatsApp contact for customers 🏪",
  marketing: "Best marketing tips for Nigerian market: 1) Post on Instagram & TikTok evenings (7-10pm) 2) Use WhatsApp status daily 3) Run Friday flash sales 4) Collect customer reviews 📣",
};

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("sale") || lower.includes("revenue") || lower.includes("money")) return DEMO_RESPONSES.sales;
  if (lower.includes("product") || lower.includes("add") || lower.includes("upload")) return DEMO_RESPONSES.product;
  if (lower.includes("store") || lower.includes("shop")) return DEMO_RESPONSES.store;
  if (lower.includes("market") || lower.includes("ad") || lower.includes("instagram")) return DEMO_RESPONSES.marketing;
  return DEMO_RESPONSES.default;
}

// ── Helper: call Claude ───────────────────────────────────────────────────────
async function callClaude(system: string, messages: any[], maxTokens = 800): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error("CLAUDE_ERROR: " + err);
  }

  const data: any = await res.json();
  return data.content?.[0]?.text || "";
}

// ── GET /api/kai/status ───────────────────────────────────────────────────────
router.get("/status", async (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      available: !!process.env.ANTHROPIC_API_KEY,
      demo: !process.env.ANTHROPIC_API_KEY,
    },
  });
});

// ── GET /api/kai/context ──────────────────────────────────────────────────────
router.get("/context", async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: {
      stores:       { include: { _count: { select: { products: true, orders: true, customers: true } } } },
      subscription: true,
    },
  });

  if (!user) throw new AppError("User not found", 404);
  const store = user.stores[0];

  let revenue     = { today: 0, week: 0, month: 0 };
  let recentOrders: any[] = [];
  let lowStock:    any[] = [];

  if (store) {
    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now.getTime() - 7  * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [t, w, m, orders, lowStockProducts] = await Promise.all([
      prisma.order.aggregate({ where: { storeId: store.id, createdAt: { gte: todayStart }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { storeId: store.id, createdAt: { gte: weekStart  }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.aggregate({ where: { storeId: store.id, createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, _sum: { total: true } }),
      prisma.order.findMany({
        where:   { storeId: store.id },
        orderBy: { createdAt: "desc" },
        take:    5,
        select:  { id: true, customerName: true, total: true, status: true, createdAt: true },
      }),
      prisma.product.findMany({
        where:   { storeId: store.id, status: "ACTIVE", inventory: { lt: 5 } },
        take:    3,
        select:  { name: true, inventory: true },
      }),
    ]);

    revenue      = { today: t._sum.total || 0, week: w._sum.total || 0, month: m._sum.total || 0 };
    recentOrders = orders;
    lowStock     = lowStockProducts;
  }

  res.json({
    success: true,
    data: {
      user:         { name: user.name, email: user.email, role: user.role },
      store:        store ? {
        id: store.id, name: (store as any).name, slug: (store as any).slug,
        currency: (store as any).currency || "NGN",
        products: store._count.products,
        orders:   store._count.orders,
        customers: store._count.customers,
      } : null,
      subscription: user.subscription,
      revenue,
      recentOrders,
      lowStock,
    },
  });
});

// ── GET /api/kai/conversations ────────────────────────────────────────────────
router.get("/conversations", async (req: AuthRequest, res: Response) => {
  const list = await prisma.kaiConversation.findMany({
    where:   { userId: req.user!.userId },
    orderBy: { updatedAt: "desc" },
    take:    30,
    select:  {
      id: true, title: true, updatedAt: true,
      messages: { take: 1, orderBy: { createdAt: "desc" }, select: { content: true } },
    },
  });
  res.json({ success: true, data: list });
});

// ── GET /api/kai/conversations/:id ───────────────────────────────────────────
router.get("/conversations/:id", async (req: AuthRequest, res: Response) => {
  const conv = await prisma.kaiConversation.findFirst({
    where:   { id: req.params.id, userId: req.user!.userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conv) throw new AppError("Not found", 404);
  res.json({ success: true, data: conv });
});

// ── DELETE /api/kai/conversations/:id ────────────────────────────────────────
router.delete("/conversations/:id", async (req: AuthRequest, res: Response) => {
  await prisma.kaiConversation.deleteMany({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  res.json({ success: true });
});

// ── POST /api/kai/chat ────────────────────────────────────────────────────────
router.post("/chat", async (req: AuthRequest, res: Response) => {
  const { message, conversationId, context } = req.body;
  if (!message?.trim()) throw new AppError("message required", 400);

  const userId = req.user!.userId;
  const user   = await prisma.user.findUnique({ where: { id: userId }, include: { stores: { take: 1 } } });
  const store  = user?.stores?.[0];

  // Get or create conversation
  let conv: any;
  if (conversationId) {
    conv = await prisma.kaiConversation.findFirst({ where: { id: conversationId, userId } });
  }
  if (!conv) {
    const title = message.length > 45 ? message.slice(0, 45) + "…" : message;
    conv = await prisma.kaiConversation.create({ data: { userId, title } });
  }

  // Save user message
  await prisma.kaiMessage.create({ data: { conversationId: conv.id, role: "user", content: message } });

  // History (last 20)
  const history = await prisma.kaiMessage.findMany({
    where:   { conversationId: conv.id, role: { in: ["user", "assistant"] } },
    orderBy: { createdAt: "asc" },
    take:    20,
  });

  let reply    = "";
  let action:  string | null = null;
  let isDemoMode = false;

  try {
    const sys = `You are KAI — the AI business partner inside DropOS, Africa's leading dropshipping platform.

You're talking to: ${user?.name || "a store owner"}
${context?.store ? `
THEIR LIVE DATA RIGHT NOW:
• Store: "${context.store.name}" (${context.store.slug})  
• Products: ${context.store.products} | Orders: ${context.store.orders} | Customers: ${context.store.customers}
• Revenue today: ₦${(context.revenue?.today || 0).toLocaleString()}
• Revenue this week: ₦${(context.revenue?.week || 0).toLocaleString()}  
• Revenue this month: ₦${(context.revenue?.month || 0).toLocaleString()}
${context.lowStock?.length ? `• ⚠️ Low stock: ${context.lowStock.map((p: any) => `${p.name} (${p.inventory} left)`).join(", ")}` : ""}
${context.recentOrders?.length ? `• Recent orders: ${context.recentOrders.slice(0,3).map((o: any) => `${o.customerName} - ${o.status}`).join(", ")}` : ""}
` : "No store created yet — encourage them to use the Store Builder!"}

DROPOS FEATURES YOU KNOW:
Products, Orders, Customers, Analytics, Customize (themes/colors), Suppliers, Coupons, Flash Sales, Affiliates, Reviews, Abandoned Carts, Import, Shipping, Currency, API Keys, Billing

YOUR PERSONALITY:
• Warm, smart, like a brilliant Nigerian friend who knows business
• Direct — no fluff, give real actionable advice  
• Celebrate wins genuinely ("₦340k this week is FIRE 🔥")
• When confused, simplify — offer to just DO it
• Use emojis naturally, not excessively
• Short sharp responses unless they ask for detail

ACTIONS (add [ACTION:key] at end when relevant):
[ACTION:add_product] [ACTION:view_orders] [ACTION:view_analytics] [ACTION:customize]
[ACTION:add_supplier] [ACTION:create_coupon] [ACTION:flash_sale] [ACTION:create_store]
[ACTION:view_customers] [ACTION:shipping] [ACTION:build_store]

Never reveal API keys or internal architecture. You ARE KAI — a DropOS product.`;

    const apiMsgs = history
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    reply = await callClaude(sys, apiMsgs, 700);

    const match = reply.match(/\[ACTION:(\w+)\]/);
    action = match ? match[1] : null;
    reply  = reply.replace(/\[ACTION:\w+\]/g, "").trim();

  } catch (e: any) {
    if (e.message === "NO_API_KEY") {
      reply      = getDemoResponse(message);
      isDemoMode = true;
    } else {
      throw new AppError("KAI is having a moment, try again!", 500);
    }
  }

  // Save assistant reply
  await prisma.kaiMessage.create({
    data: { conversationId: conv.id, role: "assistant", content: reply, action },
  });
  await prisma.kaiConversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  res.json({ success: true, data: { message: reply, action, conversationId: conv.id, demo: isDemoMode } });
});

// ── POST /api/kai/build-store ─────────────────────────────────────────────────
router.post("/build-store", async (req: AuthRequest, res: Response) => {
  const { description, location, conversationId } = req.body;
  if (!description?.trim()) throw new AppError("description required", 400);

  const userId = req.user!.userId;

  let storeData: any;
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  try {
    const blueprint = await callClaude(
      "Expert African e-commerce store builder. Return ONLY valid JSON, absolutely no markdown or explanation.",
      [{
        role: "user",
        content: `Build a complete dropshipping store blueprint for: "${description}"
Location: ${location || "Nigeria"}

Return ONLY this exact JSON structure:
{
  "name": "Catchy memorable store name",
  "slug": "url-slug-lowercase-no-spaces",
  "tagline": "Short punchy tagline under 60 chars",
  "description": "2 sentence store description",
  "primaryColor": "#hexcolor that matches the niche",
  "theme": "classic",
  "currency": "NGN",
  "products": [
    {
      "name": "Product name",
      "description": "Compelling Nigerian English description 2-3 sentences",
      "price": 15000,
      "comparePrice": 22000,
      "category": "Category name",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Include 6-8 realistic products. Use NGN prices (Nigerian Naira). Make it specific to the niche.`,
      }],
      2500
    );
    storeData = JSON.parse(blueprint.replace(/```json|```/g, "").trim());
  } catch (e: any) {
    if (e.message === "NO_API_KEY") {
      // Demo mode — create a basic store
      const niche = description.split(" ").slice(0, 3).join(" ");
      storeData = {
        name: `${niche} Store`,
        slug: slugify(niche + "-store"),
        tagline: `Premium ${niche} delivered to you`,
        description: `Your trusted ${niche} store. Quality products, fast delivery.`,
        primaryColor: "#7c3aed",
        theme: "classic",
        currency: "NGN",
        products: [
          { name: `${niche} Product 1`, description: "Premium quality product.", price: 15000, comparePrice: 22000, category: niche, tags: [niche] },
          { name: `${niche} Product 2`, description: "Best seller product.", price: 22000, comparePrice: 35000, category: niche, tags: [niche] },
          { name: `${niche} Product 3`, description: "Popular choice.", price: 8500, comparePrice: 12000, category: niche, tags: [niche] },
        ],
      };
    } else {
      throw new AppError("Failed to generate store", 500);
    }
  }

  // Create store
  let slug = slugify(storeData.slug || storeData.name);
  const exists = await prisma.store.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const store = await prisma.store.create({
    data: {
      ownerId: userId, name: storeData.name, slug,
      description: storeData.description, tagline: storeData.tagline,
      primaryColor: storeData.primaryColor || "#7c3aed",
      theme: "classic", currency: "NGN",
      domain: `${slug}.dropos.io`, status: "ACTIVE",
    } as any,
  });

  let created = 0;
  for (const p of (storeData.products || [])) {
    try {
      await prisma.product.create({
        data: {
          storeId: store.id, name: p.name,
          slug: `${slugify(p.name)}-${Date.now().toString(36)}`,
          description: p.description, price: p.price || 10000,
          comparePrice: p.comparePrice, category: p.category,
          tags: p.tags || [], status: "ACTIVE", inventory: 50,
        } as any,
      });
      created++;
    } catch {}
  }

  if (conversationId) {
    try {
      await prisma.kaiMessage.create({
        data: {
          conversationId, role: "assistant",
          content: `🎉 "${store.name}" is live with ${created} products! Your store URL: /store/${store.slug}`,
          action: "view_store",
        },
      });
      await prisma.kaiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
    } catch {}
  }

  res.json({
    success: true,
    data: { store: { id: store.id, name: store.name, slug: store.slug, url: `/store/${store.slug}` }, productsCreated: created },
  });
});

// ── POST /api/kai/generate-ad ─────────────────────────────────────────────────
router.post("/generate-ad", async (req: AuthRequest, res: Response) => {
  const { productName, platform, storeId, price, currency } = req.body;
  if (!productName) throw new AppError("productName required", 400);

  const store = storeId
    ? await prisma.store.findUnique({ where: { id: storeId }, select: { name: true, currency: true } })
    : null;

  const curr = currency || (store as any)?.currency || "NGN";

  const platformMap: Record<string, string> = {
    instagram: "Instagram post with emojis, strong hook first line, 15-20 relevant hashtags",
    tiktok:    "TikTok video caption — viral hook, trending language, hashtags",
    whatsapp:  "WhatsApp broadcast message — personal tone, clear offer, reply CTA",
    facebook:  "Facebook ad — attention headline, benefit-focused body, urgent CTA",
    twitter:   "Twitter/X thread of 3 punchy tweets that build curiosity",
  };

  let adData: any;

  try {
    const raw = await callClaude(
      "Expert African digital marketer. Return ONLY valid JSON, no markdown.",
      [{
        role: "user",
        content: `Create a ${platformMap[platform] || platformMap.instagram} for:
Product: ${productName}
${price ? `Price: ${price} ${curr}` : ""}
${store ? `Store: ${(store as any).name}` : ""}
Target: Nigerian/African market. Conversational, relatable tone.

Return ONLY: {"headline":"...","body":"...","cta":"...","hashtags":["..."],"fullPost":"complete ready-to-post content"}`,
      }],
      500
    );
    adData = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (e: any) {
    if (e.message === "NO_API_KEY") {
      adData = {
        headline: `🔥 ${productName} — Limited Stock!`,
        body: `Get your ${productName} today at an amazing price! Quality guaranteed, fast delivery across Nigeria. Order now before stock runs out!`,
        cta: "DM us to order or click link in bio!",
        hashtags: ["#NigeriaShop", "#OnlineShopping", "#Naija", "#ShopNow", "#Nigeria"],
        fullPost: `🔥 ${productName} — Limited Stock!\n\nGet your ${productName} today${price ? ` for just ${curr === "NGN" ? "₦" : ""}${price}` : ""}! Quality guaranteed, fast delivery across Nigeria. 🚚\n\nOrder now before stock runs out! 🛒\n\nDM us to order or click link in bio!\n\n#NigeriaShop #OnlineShopping #Naija #ShopNow #Nigeria`,
      };
    } else {
      throw new AppError("Failed to generate ad", 500);
    }
  }

  res.json({ success: true, data: adData });
});

// ── POST /api/kai/product-description ────────────────────────────────────────
router.post("/product-description", async (req: AuthRequest, res: Response) => {
  const { productName, category, price } = req.body;
  if (!productName) throw new AppError("productName required", 400);

  let result: any;

  try {
    const raw = await callClaude(
      "Expert Nigerian e-commerce copywriter. Return ONLY valid JSON.",
      [{
        role: "user",
        content: `Write compelling product listing content for:
Name: ${productName}
${category ? `Category: ${category}` : ""}
${price ? `Price: ₦${price}` : ""}

Return ONLY: {"shortDescription":"1-2 sentence hook","fullDescription":"3 paragraph description","bulletPoints":["point1","point2","point3","point4","point5"]}`,
      }],
      600
    );
    result = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (e: any) {
    if (e.message === "NO_API_KEY") {
      result = {
        shortDescription: `Premium quality ${productName}. Perfect for anyone looking for the best.`,
        fullDescription: `Introducing our ${productName} — crafted for quality and built to last. Whether you're buying for yourself or as a gift, this product delivers exceptional value.\n\nOur ${productName} has been carefully selected to meet the highest standards. We source only the best quality products so you can shop with confidence.\n\nFast delivery across Nigeria. Order today and receive within 1-3 business days.`,
        bulletPoints: ["Premium quality guaranteed", "Fast delivery across Nigeria", "Easy returns policy", "Secure payment options", "Customer support available"],
      };
    } else {
      throw new AppError("Failed to generate description", 500);
    }
  }

  res.json({ success: true, data: result });
});

export default router;

// ═══════════════════════════════════════════════════════
// KAI ACTION ENGINE — does real things in the platform
// ═══════════════════════════════════════════════════════

// ── POST /api/kai/action ──────────────────────────────
// KAI calls this to actually DO things inside DropOS
router.post("/action", async (req: AuthRequest, res: Response) => {
  const { type, payload } = req.body;
  const userId  = req.user!.userId;

  // Get user's primary store
  const user = await prisma.user.findUnique({
    where:   { id: userId },
    include: { stores: { take: 1 } },
  });
  const store = user?.stores?.[0];
  const storeId = (store as any)?.id;

  switch (type) {

    // ── PRODUCTS ────────────────────────────────────────
    case "list_products": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const products = await prisma.product.findMany({
        where:   { storeId, status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
        take:    payload?.limit || 10,
        select:  { id: true, name: true, price: true, inventory: true, status: true, category: true },
      });
      return res.json({ success: true, data: products, type: "products_list" });
    }

    case "add_product": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { name, price, description, category, inventory } = payload;
      if (!name || !price) return res.json({ success: false, error: "Product name and price are required" });
      const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const slug = `${slugify(name)}-${Date.now().toString(36)}`;
      const product = await prisma.product.create({
        data: {
          storeId, name, slug,
          description: description || "",
          price:       Number(price),
          category:    category || "",
          inventory:   Number(inventory) || 10,
          status:      "ACTIVE",
          tags:        [],
        } as any,
      });
      return res.json({ success: true, data: product, type: "product_created", message: `✅ "${name}" added at ₦${Number(price).toLocaleString()}!` });
    }

    case "update_product": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { productId, ...updates } = payload;
      if (!productId) return res.json({ success: false, error: "Product ID required" });
      const product = await prisma.product.updateMany({
        where: { id: productId, storeId },
        data:  updates,
      });
      return res.json({ success: true, data: product, type: "product_updated", message: "✅ Product updated!" });
    }

    case "delete_product": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { productId, name } = payload;
      await prisma.product.updateMany({ where: { id: productId, storeId }, data: { status: "ARCHIVED" } });
      return res.json({ success: true, type: "product_deleted", message: `🗑️ "${name || "Product"}" archived` });
    }

    // ── ORDERS ──────────────────────────────────────────
    case "list_orders": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const orders = await prisma.order.findMany({
        where:   { storeId, ...(payload?.status ? { status: payload.status } : {}) },
        orderBy: { createdAt: "desc" },
        take:    payload?.limit || 10,
        select:  { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
      });
      return res.json({ success: true, data: orders, type: "orders_list" });
    }

    case "get_order": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const order = await prisma.order.findFirst({
        where:   { storeId, OR: [{ id: payload?.orderId }, { orderNumber: payload?.orderNumber }] },
        include: { items: { include: { product: { select: { name: true } } } } },
      });
      if (!order) return res.json({ success: false, error: "Order not found" });
      return res.json({ success: true, data: order, type: "order_detail" });
    }

    case "update_order_status": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { orderId, status } = payload;
      await prisma.order.updateMany({ where: { id: orderId, storeId }, data: { status } });
      return res.json({ success: true, type: "order_updated", message: `✅ Order marked as ${status}` });
    }

    // ── ANALYTICS ───────────────────────────────────────
    case "get_analytics": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const now        = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart  = new Date(now.getTime() - 7  * 86400000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayR, weekR, monthR, topProducts, recentOrders, totalCustomers] = await Promise.all([
        prisma.order.aggregate({ where: { storeId, createdAt: { gte: todayStart }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
        prisma.order.aggregate({ where: { storeId, createdAt: { gte: weekStart  }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
        prisma.order.aggregate({ where: { storeId, createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
        prisma.orderItem.groupBy({
          by: ["productId"],
          where: { order: { storeId } },
          _sum: { quantity: true, price: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
        prisma.order.findMany({ where: { storeId }, orderBy: { createdAt: "desc" }, take: 5, select: { orderNumber: true, customerName: true, total: true, status: true } }),
        prisma.customer.count({ where: { storeId } }),
      ]);

      return res.json({
        success: true,
        type: "analytics",
        data: {
          revenue: { today: todayR._sum.total || 0, week: weekR._sum.total || 0, month: monthR._sum.total || 0 },
          orders:  { today: todayR._count, week: weekR._count, month: monthR._count },
          customers: totalCustomers,
          recentOrders,
          topProducts,
        },
      });
    }

    // ── CUSTOMERS ───────────────────────────────────────
    case "list_customers": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const customers = await prisma.customer.findMany({
        where:   { storeId },
        orderBy: { createdAt: "desc" },
        take:    payload?.limit || 10,
        select:  { id: true, name: true, email: true, phone: true, totalSpent: true, orderCount: true, createdAt: true },
      });
      return res.json({ success: true, data: customers, type: "customers_list" });
    }

    // ── COUPONS ─────────────────────────────────────────
    case "create_coupon": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { code, type: couponType, value, minOrder, expiresAt } = payload;
      if (!code || !couponType || !value) return res.json({ success: false, error: "Code, type and value are required" });
      const coupon = await prisma.coupon.create({
        data: {
          storeId,
          code:       code.toUpperCase(),
          type:       couponType || "PERCENTAGE",
          value:      Number(value),
          minOrder:   minOrder ? Number(minOrder) : null,
          maxUses:    payload?.maxUses || null,
          expiresAt:  expiresAt ? new Date(expiresAt) : null,
          status:     "ACTIVE",
        } as any,
      });
      return res.json({ success: true, data: coupon, type: "coupon_created", message: `🎫 Coupon **${code.toUpperCase()}** created! ${couponType === "PERCENTAGE" ? value + "% off" : "₦" + value + " off"}` });
    }

    case "list_coupons": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const coupons = await prisma.coupon.findMany({
        where:   { storeId },
        orderBy: { createdAt: "desc" },
        take:    10,
        select:  { id: true, code: true, type: true, value: true, usedCount: true, status: true, expiresAt: true },
      });
      return res.json({ success: true, data: coupons, type: "coupons_list" });
    }

    // ── STORE ───────────────────────────────────────────
    case "update_store": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const updated = await prisma.store.update({ where: { id: storeId }, data: payload });
      return res.json({ success: true, data: updated, type: "store_updated", message: "✅ Store updated!" });
    }

    case "get_store_info": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const storeInfo = await prisma.store.findUnique({
        where:  { id: storeId },
        select: { id: true, name: true, slug: true, description: true, tagline: true, primaryColor: true, theme: true, currency: true, status: true },
      });
      return res.json({ success: true, data: storeInfo, type: "store_info" });
    }

    // ── INVENTORY ────────────────────────────────────────
    case "low_stock": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const products = await prisma.product.findMany({
        where:   { storeId, status: "ACTIVE", inventory: { lt: payload?.threshold || 10 } },
        orderBy: { inventory: "asc" },
        take:    20,
        select:  { id: true, name: true, inventory: true, price: true },
      });
      return res.json({ success: true, data: products, type: "low_stock_list" });
    }

    case "update_inventory": {
      if (!storeId) return res.json({ success: false, error: "No store found" });
      const { productId, inventory } = payload;
      await prisma.product.updateMany({ where: { id: productId, storeId }, data: { inventory: Number(inventory) } });
      return res.json({ success: true, type: "inventory_updated", message: `✅ Stock updated to ${inventory} units` });
    }

    default:
      return res.json({ success: false, error: `Unknown action: ${type}` });
  }
});

// ── POST /api/kai/smart-chat ──────────────────────────
// Advanced chat that can parse intent and auto-execute actions
router.post("/smart-chat", async (req: AuthRequest, res: Response) => {
  const { message, conversationId, context } = req.body;
  if (!message?.trim()) throw new AppError("message required", 400);

  const userId = req.user!.userId;
  const user   = await prisma.user.findUnique({ where: { id: userId }, include: { stores: { take: 1 } } });
  const store  = user?.stores?.[0];
  const storeId = (store as any)?.id;

  // Get or create conversation
  let conv: any;
  if (conversationId) conv = await prisma.kaiConversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) {
    const title = message.length > 45 ? message.slice(0, 45) + "…" : message;
    conv = await prisma.kaiConversation.create({ data: { userId, title } });
  }

  await prisma.kaiMessage.create({ data: { conversationId: conv.id, role: "user", content: message } });

  const history = await prisma.kaiMessage.findMany({
    where:   { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
    take:    20,
  });

  let reply  = "";
  let action: string | null = null;
  let actionData: any = null;
  let isDemoMode = false;

  // ── Intent Detection ──────────────────────────────────
  const lower = message.toLowerCase();

  // Direct action patterns - no AI needed
  const directActions: Array<{ pattern: RegExp; handler: () => Promise<any> }> = [
    {
      pattern: /show (my )?orders|list orders|recent orders|my orders/i,
      handler: async () => {
        if (!storeId) return null;
        const orders = await prisma.order.findMany({
          where: { storeId }, orderBy: { createdAt: "desc" }, take: 5,
          select: { orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
        });
        return { type: "orders_list", data: orders };
      },
    },
    {
      pattern: /show (my )?products|list products|my products/i,
      handler: async () => {
        if (!storeId) return null;
        const products = await prisma.product.findMany({
          where: { storeId, status: "ACTIVE" }, take: 8,
          select: { name: true, price: true, inventory: true, status: true },
        });
        return { type: "products_list", data: products };
      },
    },
    {
      pattern: /analytics|revenue|sales stats|how am i doing|performance/i,
      handler: async () => {
        if (!storeId) return null;
        const now = new Date();
        const weekStart = new Date(now.getTime() - 7 * 86400000);
        const [weekRev, weekOrders, customers] = await Promise.all([
          prisma.order.aggregate({ where: { storeId, createdAt: { gte: weekStart }, status: { not: "CANCELLED" } }, _sum: { total: true }, _count: true }),
          prisma.order.count({ where: { storeId, createdAt: { gte: weekStart } } }),
          prisma.customer.count({ where: { storeId } }),
        ]);
        return { type: "analytics_summary", data: { weekRevenue: weekRev._sum.total || 0, weekOrders, customers } };
      },
    },
    {
      pattern: /low stock|running out|out of stock|inventory/i,
      handler: async () => {
        if (!storeId) return null;
        const products = await prisma.product.findMany({
          where: { storeId, status: "ACTIVE", inventory: { lt: 5 } }, take: 5,
          select: { name: true, inventory: true },
        });
        return { type: "low_stock", data: products };
      },
    },
    {
      pattern: /show (my )?customers|list customers|my customers/i,
      handler: async () => {
        if (!storeId) return null;
        const customers = await prisma.customer.findMany({
          where: { storeId }, orderBy: { totalSpent: "desc" }, take: 5,
          select: { name: true, email: true, totalSpent: true, orderCount: true },
        });
        return { type: "customers_list", data: customers };
      },
    },
  ];

  // Try direct action first
  let directResult: any = null;
  for (const { pattern, handler } of directActions) {
    if (pattern.test(message)) {
      directResult = await handler();
      break;
    }
  }

  // Build context string with direct result
  let ctxStr = "";
  if (directResult) {
    ctxStr = `\n\nLIVE DATA RETRIEVED:\n${JSON.stringify(directResult.data, null, 2)}\n\nPresent this data to the user in a clear, friendly way.`;
    actionData = directResult;
  }

  try {
    const sys = `You are KAI — DropOS's AI business partner for African entrepreneurs.

Talking to: ${user?.name || "store owner"}
${context?.store ? `Store: "${context.store.name}" | Products: ${context.store.products} | Orders: ${context.store.orders} | Revenue this week: ₦${(context.revenue?.week || 0).toLocaleString()}` : "No store yet"}
${ctxStr}

You can DO things, not just talk. When asked:
- "Add product X at ₦Y" → confirm you'll add it, include [ACTION:add_product]
- "Show my orders" → data is provided above, present it nicely
- "Create coupon CODE for 20% off" → confirm, include [ACTION:create_coupon]
- "Update order #X to shipped" → confirm, include [ACTION:update_order_status]
- "Change my store color to blue" → confirm, include [ACTION:update_store]

Actions to include in response (add at end):
[ACTION:add_product] [ACTION:view_orders] [ACTION:view_analytics] [ACTION:create_coupon]
[ACTION:view_customers] [ACTION:update_store] [ACTION:low_stock] [ACTION:list_products]

PERSONALITY: Warm Nigerian business friend, direct, uses emojis naturally, celebrates wins.
Keep responses SHORT unless showing data. Always end with what you just did or what to do next.`;

    const apiMsgs = history
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    reply = await callClaude(sys, apiMsgs, 600);
    const match = reply.match(/\[ACTION:(\w+)\]/);
    action = match ? match[1] : null;
    reply  = reply.replace(/\[ACTION:\w+\]/g, "").trim();

  } catch (e: any) {
    if (e.message === "NO_API_KEY") {
      isDemoMode = true;
      // Smart demo responses based on direct data
      if (directResult?.type === "orders_list") {
        const orders = directResult.data;
        if (!orders.length) reply = "You don't have any orders yet! Share your store link to start getting sales 🛒";
        else reply = `Here are your recent orders:\n\n${orders.map((o: any) => `• **#${o.orderNumber}** — ${o.customerName} — ₦${(o.total || 0).toLocaleString()} — ${o.status}`).join("\n")}\n\nWant me to update any order status?`;
      } else if (directResult?.type === "products_list") {
        const prods = directResult.data;
        if (!prods.length) reply = "No active products yet! Want me to add some? Just tell me the product name and price 📦";
        else reply = `Your active products:\n\n${prods.map((p: any) => `• **${p.name}** — ₦${(p.price || 0).toLocaleString()} — ${p.inventory} in stock`).join("\n")}\n\nNeed to add or update any product?`;
      } else if (directResult?.type === "analytics_summary") {
        const d = directResult.data;
        reply = `📊 This week's performance:\n\n• Revenue: ₦${(d.weekRevenue || 0).toLocaleString()}\n• Orders: ${d.weekOrders}\n• Total customers: ${d.customers}\n\n${d.weekRevenue > 0 ? "Great progress! Keep sharing your store link 🚀" : "No sales yet — share your store link everywhere to start!"}`;
      } else if (directResult?.type === "low_stock") {
        const prods = directResult.data;
        if (!prods.length) reply = "✅ All products are well stocked! Nothing to worry about.";
        else reply = `⚠️ Low stock alert!\n\n${prods.map((p: any) => `• ${p.name}: only ${p.inventory} left`).join("\n")}\n\nWant me to help restock any of these?`;
      } else if (directResult?.type === "customers_list") {
        const custs = directResult.data;
        if (!custs.length) reply = "No customers yet! Once people buy from your store they'll appear here 👥";
        else reply = `Your top customers:\n\n${custs.map((c: any) => `• ${c.name} — ₦${(c.totalSpent || 0).toLocaleString()} spent — ${c.orderCount} orders`).join("\n")}`;
      } else {
        reply = getDemoResponse(message);
      }
    } else {
      throw new AppError("KAI had an issue, try again!", 500);
    }
  }

  await prisma.kaiMessage.create({ data: { conversationId: conv.id, role: "assistant", content: reply, action } });
  await prisma.kaiConversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

  res.json({ success: true, data: { message: reply, action, actionData, conversationId: conv.id, demo: isDemoMode } });
});