// ============================================================
// KAI Agent Controller — Dashboard In Chat
// Path: backend/src/controllers/kai.agent.controller.ts
// ============================================================
import { Request, Response } from "express";
import prisma                from "../lib/prisma";
import { detectAgentAction, executeAgentAction, getUserStores } from "../services/kai.agent.service";
import { getStoreContext, buildCompleteSystemPrompt, callClaude, generateTitle, detectIntent, needsWebSearch } from "../services/kai.service";
import { extractMemoriesFromConversation } from "../services/kai.memory.service";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// ── GET /api/kai/agent/stores ─────────────────────────────────
// Returns all stores for the logged-in user
export async function getMyStores(req: Request, res: Response) {
  try {
    const user   = (req as any).user;
    const stores = await getUserStores(user.id);
    res.json({ success: true, data: stores });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/agent/chat (STREAMING + AGENT) ─────────────
// The main endpoint — handles both conversation and actions
export async function agentChat(req: Request, res: Response) {
  const { message, conversationId, storeId, imageBase64, imageMediaType } = req.body;
  const user = (req as any).user;

  if (!message) return res.status(400).json({ success: false, message: "message required" });

  // ── Multi-store: check if store is selected ──────────────────
  if (!storeId) {
    const stores = await getUserStores(user.id);
    if (stores.length === 0) {
      return res.status(400).json({
        success: false,
        code:    "NO_STORE",
        message: "No stores found. Create a store first.",
      });
    }
    if (stores.length === 1) {
      // Auto-select if only one store
      req.body.storeId = stores[0].id;
    } else {
      // Ask which store
      return res.json({
        success: true,
        code:    "SELECT_STORE",
        data: {
          message: `You have ${stores.length} stores. Which one should I help with?`,
          stores:  stores.map(s => ({
            id:       s.id,
            name:     s.name,
            products: (s as any)._count.products,
            orders:   (s as any)._count.orders,
            status:   s.status,
          })),
        },
      });
    }
  }

  const activeStoreId = req.body.storeId || storeId;

  try {
    // ── Detect if this is an action or a conversation ────────────
    const { action, confidence, extractedData } = detectAgentAction(message);

    // High confidence action — present for approval before executing
    if (confidence >= 0.8 && action !== "unknown") {
      const proposal = buildActionProposal(action, extractedData, activeStoreId);

      if (proposal) {
        return res.json({
          success: true,
          code:    "ACTION_PROPOSAL",
          data: {
            action,
            proposal,
            extractedData,
            storeId: activeStoreId,
            message: proposal.description,
          },
        });
      }
    }

    // ── Regular conversation — stream response ───────────────────
    let conv: any = conversationId
      ? await prisma.kaiConversation.findUnique({
          where:   { id: conversationId },
          include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
        })
      : null;

    if (!conv) {
      conv = await prisma.kaiConversation.create({
        data:    { storeId: activeStoreId, title: generateTitle(message) },
        include: { messages: true },
      });
    }

    await prisma.kaiMessage.create({
      data: { conversationId: conv.id, role: "user", content: message },
    });

    const ctx         = await getStoreContext(activeStoreId);
    const intent      = detectIntent(message);
    const useSearch   = needsWebSearch(message, intent);
    const history     = (conv.messages || []).slice(-8).map((m: any) =>
      `${m.role === "user" ? "Owner" : "KAI"}: ${m.content.slice(0, 200)}`
    ).join("\n");

    const systemPrompt = await buildCompleteSystemPrompt(ctx, activeStoreId, history);

    const claudeMsgs: any[] = (conv.messages || []).slice(-6).map((m: any) => ({
      role:    m.role,
      content: m.content,
    }));

    const currentContent: any[] = [];
    if (imageBase64 && imageMediaType) {
      currentContent.push({ type: "image", source: { type: "base64", media_type: imageMediaType, data: imageBase64 } });
    }
    currentContent.push({ type: "text", text: message });
    claudeMsgs.push({ role: "user", content: currentContent.length === 1 ? message : currentContent });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    await callClaude({
      systemPrompt,
      messages:   claudeMsgs,
      useSearch,
      maxTokens:  1024,
      onToken:    (token) => {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token, conversationId: conv.id })}\n\n`);
      },
    });

    await prisma.kaiMessage.create({
      data: { conversationId: conv.id, role: "assistant", content: fullResponse, metadata: { intent, searched: useSearch } },
    });
    await prisma.kaiConversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });

    if (apiKey()) {
      extractMemoriesFromConversation(activeStoreId, message, fullResponse, conv.id, apiKey()).catch(() => {});
    }

    res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id })}\n\n`);
    res.end();

  } catch (err: any) {
    console.error("[KAI Agent]", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "KAI ran into an issue — please try again" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "KAI error" })}\n\n`);
      res.end();
    }
  }
}

// ── POST /api/kai/agent/execute ───────────────────────────────
// Executes an approved action
export async function executeAction(req: Request, res: Response) {
  const { action, data, storeId, approved } = req.body;
  const user = (req as any).user;

  if (!approved) return res.status(400).json({ success: false, message: "Action not approved" });
  if (!action)   return res.status(400).json({ success: false, message: "action required" });

  try {
    // Verify user owns this store
    const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: user.id } });
    if (!store) return res.status(403).json({ success: false, message: "Not your store" });

    const result = await executeAgentAction(action, data || {}, storeId);

    // Log the action
    await prisma.kaiActionLog.create({
      data: {
        storeId,
        conversationId: data?.conversationId || "",
        actionType:     action,
        payload:        data || {},
        approved:       true,
        executed:       result.success,
        result:         result.result,
      },
    }).catch(() => {});

    res.json({ success: result.success, data: result.result, message: result.message });

  } catch (err: any) {
    const msg = err.message === "PRODUCT_NOT_FOUND"
      ? "I couldn't find that product. Can you give me the exact name?"
      : err.message === "NEED_PRODUCT"
      ? "Which product should I update? Give me the name."
      : err.message === "NEED_ORDER_ID"
      ? "Which order? Share the order number."
      : "Action failed — please try again";

    res.status(500).json({ success: false, message: msg });
  }
}

// ── GET /api/kai/agent/context/:storeId ──────────────────────
// Full store context for the frontend action cards
export async function getAgentContext(req: Request, res: Response) {
  try {
    const { storeId } = req.params;
    const [products, orders, coupons] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId, status: { in: ["PENDING","PROCESSING"] } } }),
      prisma.coupon.count({ where: { storeId, isActive: true } }),
    ]);
    res.json({ success: true, data: { products, pendingOrders: orders, coupons } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── Build action proposal for user approval ───────────────────
function buildActionProposal(action: string, data: any, storeId: string): any | null {
  const proposals: Record<string, any> = {
    add_product: {
      title:       "Add Product",
      description: `Create new product${data.name ? ` "${data.name}"` : ""}${data.price ? ` at ₦${Number(data.price).toLocaleString()}` : ""}`,
      icon:        "📦",
      color:       "#34d399",
      warning:     null,
      fields: [
        { key: "name",  label: "Product name",   value: data.name  || "",  required: true },
        { key: "price", label: "Selling price ₦", value: data.price || "",  required: true },
        { key: "stock", label: "Stock quantity",  value: data.stock || 0,   required: false },
        { key: "description", label: "Description", value: "", required: false },
        { key: "publish", label: "Publish immediately", value: true, type: "boolean" },
      ],
    },
    update_product_price: {
      title:       "Update Price",
      description: `Change price${data.name ? ` of "${data.name}"` : ""}${data.price ? ` to ₦${Number(data.price).toLocaleString()}` : ""}`,
      icon:        "💰",
      color:       "#fbbf24",
      warning:     null,
      fields: [
        { key: "name",  label: "Product",      value: data.name  || "", required: true },
        { key: "price", label: "New price ₦",  value: data.price || "", required: true },
      ],
    },
    bulk_update_prices: {
      title:       "Update All Prices",
      description: `${data.direction === "increase" ? "Increase" : "Decrease"} all product prices by ${data.percent}%`,
      icon:        "📊",
      color:       "#f97316",
      warning:     "This affects ALL your products",
      fields: [
        { key: "direction", label: "Direction", value: data.direction, type: "select", options: ["increase","decrease"] },
        { key: "percent",   label: "Percentage", value: data.percent || "", required: true },
      ],
    },
    update_product_stock: {
      title:       "Update Stock",
      description: `Set stock${data.name ? ` for "${data.name}"` : ""} to ${data.stock} units`,
      icon:        "📦",
      color:       "#60a5fa",
      warning:     null,
      fields: [
        { key: "name",  label: "Product",      value: data.name  || "", required: true },
        { key: "stock", label: "New quantity", value: data.stock || "", required: true },
      ],
    },
    delete_product: {
      title:       "Delete Product",
      description: `Permanently delete "${data.name}"`,
      icon:        "🗑️",
      color:       "#f87171",
      warning:     "This cannot be undone",
      fields: [
        { key: "name", label: "Product to delete", value: data.name || "", required: true },
      ],
    },
    update_order_status: {
      title:       "Update Order",
      description: `Mark order as ${data.status}`,
      icon:        "📬",
      color:       "#34d399",
      warning:     null,
      fields: [
        { key: "orderId", label: "Order ID", value: data.orderId || "", required: true },
        { key: "status",  label: "New status", value: data.status || "SHIPPED", type: "select", options: ["PROCESSING","SHIPPED","DELIVERED","CANCELLED"] },
      ],
    },
    create_coupon: {
      title:       "Create Coupon",
      description: `New coupon: ${data.code || "auto-generate"} — ${data.discount}${data.type === "PERCENTAGE" ? "%" : "₦"} off`,
      icon:        "🎟️",
      color:       "#a78bfa",
      warning:     null,
      fields: [
        { key: "code",     label: "Coupon code (or leave blank)",  value: data.code || "" },
        { key: "discount", label: "Discount",                      value: data.discount || 10, required: true },
        { key: "type",     label: "Type",                          value: data.type || "PERCENTAGE", type: "select", options: ["PERCENTAGE","FIXED"] },
        { key: "limit",    label: "Usage limit (0 = unlimited)",   value: data.limit || 0 },
      ],
    },
    create_flash_sale: {
      title:       "Start Flash Sale",
      description: `Run a flash sale with ${data.discount}% discount`,
      icon:        "⚡",
      color:       "#fbbf24",
      warning:     null,
      fields: [
        { key: "discount",  label: "Discount %",     value: data.discount || 20, required: true },
        { key: "endHours",  label: "Duration (hours)", value: 24 },
        { key: "products",  label: "Apply to", value: "all", type: "select", options: ["all","specific"] },
      ],
    },
    update_store_name: {
      title:       "Rename Store",
      description: `Change store name to "${data.name}"`,
      icon:        "🏪",
      color:       "#60a5fa",
      warning:     null,
      fields: [
        { key: "name", label: "New store name", value: data.name || "", required: true },
      ],
    },
    toggle_store_status: {
      title:       data.status === "ACTIVE" ? "Open Store" : "Close Store",
      description: data.status === "ACTIVE" ? "Your store will be visible and accepting orders" : "Your store will be hidden from customers",
      icon:        data.status === "ACTIVE" ? "🟢" : "🔴",
      color:       data.status === "ACTIVE" ? "#34d399" : "#f87171",
      warning:     data.status !== "ACTIVE" ? "Customers won't be able to place orders" : null,
      fields:      [],
    },
    change_store_template: {
      title:       "Change Template",
      description: `Switch to "${data.template}" theme`,
      icon:        "🎨",
      color:       "#a78bfa",
      warning:     "Your store design will change immediately",
      fields: [
        { key: "template", label: "Template", value: data.template || "" },
      ],
    },
  };

  return proposals[action] || null;
}
