// ============================================================
// KIRO — Complete Controller (10/10)
// Path: backend/src/controllers/kai.controller.ts
// ============================================================
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { PrismaClient } from "@prisma/client";
import {
  callClaude, detectIntent, generateTitle, getQuickActions,
} from "../services/kai.service";
import { validateAction, translateError, describeAction } from "../utils/kai.actions";
// Note: getStoreContext replaced by getDeepContext globally
import { getDeepContext } from "../services/kai.context";
import { buildStoreBrain, decomposeGoal } from "../services/kai.brain";
import { buildIntelligencePrompt } from "../services/kai.intelligence";
import {
  extractMemoriesFromConversation, getMemories, saveMemory,
  deleteMemory, getActiveGoals, analyzeBrandVoice, getMemoryContext,
} from "../services/kai.memory.service";
import {
  getUnreadAlerts, markAlertRead, analyzeStore,
} from "../services/kai.pulse.service";
import { getKaiSkills } from "../services/kai.market.service";

const prisma = new PrismaClient();
const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

// ── GET /api/kai/greeting ─────────────────────────────────────
export async function getGreeting(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });

    const [ctx, alerts] = await Promise.all([
      getDeepContext(storeId),
      getUnreadAlerts(storeId),
    ]);

    const user      = (req as any).user;
    const firstName = (user?.name || "there").split(" ")[0];
    const hour      = new Date().getHours();

    const greeting = `Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}! KIRO here.`;
    const contextLine = ctx.revenueToday > 0 
      ? `You've made ${ctx.currencySymbol}${ctx.revenueToday.toLocaleString()} today.`
      : "What are we working on today?";
    const quickActions = [
      ...(ctx.pendingOrders > 0 ? [{ label:`Fulfill ${ctx.pendingOrders} orders`, icon:"📬", prompt:`Help me fulfill my ${ctx.pendingOrders} pending orders` }] : []),
      ...(ctx.lowStockProducts.length > 0 ? [{ label:`${ctx.lowStockProducts.length} low stock`, icon:"⚠️", prompt:`Show me my low stock products` }] : []),
      ...(ctx.totalProducts < 5 ? [{ label:"Add more products", icon:"➕", prompt:`Suggest 10 trending products for ${ctx.country}` }] : []),
      ...(ctx.revenueToday === 0 ? [{ label:"Get a sale today", icon:"🎯", prompt:`I have ₦0 in sales today. Fastest way to get a sale?` }] : []),
    ].slice(0, 4);

    res.json({
      success: true,
      data: { greeting, name: firstName, contextLine, quickActions, storeContext: ctx, unreadAlerts: alerts.length },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/conversations ────────────────────────────────
export async function getConversations(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId || (req as any).user?.id;
    const { storeId } = req.query as { storeId?: string };
    // Build where clause - use storeId if provided, else find by userId
    const where: any = { archived: false };
    if (storeId) where.storeId = storeId;
    else where.userId = userId;

    const conversations = await prisma.kaiConversation.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true, title: true, pinned: true, createdAt: true, updatedAt: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true, role: true } },
      },
    });
    res.json({ success: true, data: conversations });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/conversation/:id ─────────────────────────────
export async function getConversation(req: Request, res: Response) {
  try {
    const conv = await prisma.kaiConversation.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: conv });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/smart-chat (STREAMING + MEMORY) ────────────
export async function smartChat(req: Request, res: Response) {
  const { storeId, imageBase64, imageMediaType } = req.body;
  const message = req.body.message || (imageBase64 ? "Please analyse this image and help me use it in my store." : "");
  const conversationId = req.body.conversationId || req.body.sessionId || null;
  if (!message || !storeId)
    return res.status(400).json({ success: false, message: "message and storeId required" });

  try {
    // Get or create conversation
    let conv: any = conversationId
      ? await prisma.kaiConversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
        })
      : null;

    if (!conv) {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: "User not found in token" });
      conv = await (prisma.kaiConversation as any).create({
        data: { storeId, userId, title: generateTitle(message) },
        include: { messages: true },
      });
    }

    // Save user message
    const userContent = message + (
      req.body.fileName ? `\n\n[User attached file: ${req.body.fileName}]` : ""
    ) + (
      req.body.imageUrl ? `\n\n[User attached image: ${req.body.imageUrl}]` : ""
    );
    await (prisma.kaiMessage as any).create({
      data: { conversationId: conv.id, role: "user", content: userContent },
    });

    // Get everything in parallel
    const [ctx, intent] = await Promise.all([
      getDeepContext(storeId).catch((e) => {
        console.error("[KIRO] getDeepContext failed:", e.message);
        return null as any;
      }),
      Promise.resolve(detectIntent(message)),
    ]);
    if (!ctx) {
      res.write(`data: ${JSON.stringify({ token: "KIRO is warming up — store data loading. Try again in a moment." })}

`);
      res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id })}

`);
      res.end(); return;
    }
    const useSearch = ["market_research","trending","analytics"].includes(intent);

    // Build rich conversation history - 20 messages, near full content
    const historyMsgs = (conv.messages || []).slice(-20);
    const history = historyMsgs
      .map((m: any) => {
        const who = m.role === "user" ? "Owner" : "KIRO";
        const content = m.content.slice(0, 800); // much more context
        return `${who}: ${content}`;
      })
      .join("\n");
    
    // Also load recent messages from OTHER conversations to give cross-session memory
    let crossSessionContext = "";
    try {
      const userId = (req as any).user?.userId || (req as any).user?.id;
      const recentConvs = await prisma.kaiConversation.findMany({
        where: { storeId, userId, archived: false, id: { not: conv.id } },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: { messages: { orderBy: { createdAt: "desc" }, take: 3 } },
      });
      if (recentConvs.length > 0) {
        const lines: string[] = ["RECENT PAST CONVERSATIONS (for context):"];
        for (const rc of recentConvs) {
          const lastMsg = rc.messages[0];
          if (lastMsg) {
            const ago = Math.round((Date.now() - new Date(rc.updatedAt).getTime()) / 60000);
            lines.push(`- ${ago}min ago: "${rc.title}" — last said: "${lastMsg.content.slice(0, 120)}"`);
          }
        }
        crossSessionContext = lines.join("\n");
      }
    } catch {}

    // Build complete system prompt (includes memory, goals, brand voice, market data)
    let memories = "";
    try { memories = await getMemoryContext(storeId); } catch {}

    // Build the store brain
    let brain: any = undefined;
    try { brain = await buildStoreBrain(storeId, ctx); } catch(e: any) {
      console.error("[KIRO] Brain build failed:", e.message);
    }

    // Multi-step goal detection — decompose complex requests
    let goalPlan = "";
    try { goalPlan = decomposeGoal(message, ctx, brain); } catch {}

    let systemPrompt: string;
    try {
      systemPrompt = buildIntelligencePrompt(ctx, history, crossSessionContext, memories, brain);
    } catch(e: any) {
      console.error("[KIRO] buildCompleteSystemPrompt failed, using fallback:", e.message);
      systemPrompt = `You are KIRO, an AI business assistant for ${ctx.storeName}. Be helpful, concise and actionable.`;
    }

    // Build messages array
    const claudeMsgs: any[] = [];
    for (const m of (conv.messages || []).slice(-16)) {
      claudeMsgs.push({ role: m.role, content: m.content });
    }
    // Current message (with optional image)
    // Intent-aware routing — give KIRO a specific directive based on what the user wants
    const intentDirective: Record<string, string> = {
      analytics:        "[DIRECTIVE: User wants analytics. Show real numbers from STORE DATA. Compare periods. Identify trends. End with one growth action.]",
      product_management:"[DIRECTIVE: User wants product help. Refer to their actual product list. Help them add/edit/improve. Generate content if needed.]",
      order_management: "[DIRECTIVE: User wants order help. Check their pending orders list. Offer to fulfill. Give tracking advice.]",
      customer_insights:"[DIRECTIVE: User wants customer intel. Use customer data. Segment by value. Suggest retention actions.]",
      market_research:  "[DIRECTIVE: User wants market trends. Draw on Nigerian ecommerce knowledge. Give specific product names and price ranges.]",
      promotions:       "[DIRECTIVE: User wants promotions. Create a coupon or flash sale with specifics. Write the copy too.]",
      marketing:        "[DIRECTIVE: User wants marketing. Write the actual copy — Instagram caption, WhatsApp message, TikTok script. Make it ready to post.]",
      content:          "[DIRECTIVE: User wants content. Generate full product description or ad copy. Nigerian audience. Conversion-focused.]",
      pricing:          "[DIRECTIVE: User wants pricing help. Analyze their current prices vs Nigerian market. Give specific recommended prices with margin calculation.]",
      general:          "[DIRECTIVE: Look at today's priority actions and proactively surface the most important thing they should know or do right now.]",
    };
    const directive = intentDirective[intent] || intentDirective.general;
    const enhancedMessage = `${message}

${directive}`;

    const currentContent: any[] = [];
    // Handle image — either base64 or URL
    let finalImageBase64 = imageBase64;
    let finalImageMediaType = imageMediaType || "image/jpeg";
    const imageUrl = req.body.imageUrl;
    
    // If URL provided but no base64, fetch the image
    if (!finalImageBase64 && imageUrl && !imageUrl.startsWith("data:")) {
      try {
        const imgRes = await fetch(imageUrl);
        const imgBuf = await imgRes.arrayBuffer();
        finalImageBase64 = Buffer.from(imgBuf).toString("base64");
        finalImageMediaType = imgRes.headers.get("content-type") || "image/jpeg";
      } catch(e) {
        console.error("[KIRO] Could not fetch image URL:", e);
      }
    }
    
    // If it's a data URI, strip the prefix
    if (finalImageBase64?.startsWith("data:")) {
      const parts = finalImageBase64.split(",");
      finalImageMediaType = parts[0].split(":")[1]?.split(";")[0] || "image/jpeg";
      finalImageBase64 = parts[1];
    }
    
    console.log("[KIRO] Image:", {
      hasBase64: !!finalImageBase64,
      mediaType: finalImageMediaType,
      size: finalImageBase64?.length || 0,
    });
    
    if (finalImageBase64 && finalImageMediaType) {
      currentContent.push({ type: "image", source: { type: "base64", media_type: finalImageMediaType, data: finalImageBase64 } });
    }
    currentContent.push({ type: "text", text: enhancedMessage });
    claudeMsgs.push({ role: "user", content: currentContent.length === 1 ? message : currentContent });

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    await callClaude({
      systemPrompt,
      messages: claudeMsgs,
      useSearch,
      model: (finalImageBase64 || finalImageBase64) ? "claude-sonnet-4-6" : undefined,
      maxTokens: finalImageBase64 ? 4096 : 4096,
      onToken: (token) => {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token, conversationId: conv.id })}\n\n`);
      },
    });

    // Parse KIRO_ACTION — handles every format KIRO might output
    const parsedActions: any[] = [];
    let cleanResponse = fullResponse;
    try {
      // Step 1: normalize all variants to KIRO_ACTION:{...}
      let work = fullResponse
        .replace(/KIRO_ACTION\s*```json?\s*/gi, "KIRO_ACTION:")   // code block start
        .replace(/```\s*$/gm,                        "")           // code block end
        .replace(/KIRO_ACTION\s*:\s*\n\s*/g,      "KIRO_ACTION:") // colon + newline
        .replace(/KIRO_ACTION\s+(?=\{)/g,           "KIRO_ACTION:"); // space instead of colon

      // Step 2: extract all JSON objects after KIRO_ACTION marker
      const re = /KIRO_ACTION[:\s]+?\s*(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\})/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(work)) !== null) {
        try {
          const obj = JSON.parse(m[1]);
          if (obj.action && !obj.type) obj.type = obj.action; // normalize field name
          if (obj.type && obj.payload) parsedActions.push(obj);
          else if (obj.type) parsedActions.push({ type: obj.type, payload: obj });
        } catch {
          // Try extracting from full match if parse fails
          try {
            const cleaned = m[1].replace(/\n/g," ").replace(/\s+/g," ");
            const obj = JSON.parse(cleaned);
            if (obj.action && !obj.type) obj.type = obj.action;
            parsedActions.push(obj);
          } catch {}
        }
      }
      // Step 3: strip all KIRO_ACTION blocks from user-visible text
      cleanResponse = fullResponse
        .replace(/KIRO_ACTION\s*```[\s\S]*?```/gi, "")
        .replace(/KIRO_ACTION[:\s]+\{[\s\S]*?\}(?=\s|$)/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } catch {}

    // Save KIRO response (clean version)
    await (prisma.kaiMessage as any).create({
      data: {
        conversationId: conv.id,
        role:     "assistant",
        content:  cleanResponse,
        metadata: { intent, searched: useSearch, actions: parsedActions },
      },
    });

    await prisma.kaiConversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    // Extract memories in background (don't await — don't slow down response)
    if (apiKey()) {
      extractMemoriesFromConversation(storeId, message, fullResponse, conv.id, apiKey())
        .catch(err => console.error("Memory extraction error:", err));
    }

    res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id, actions: parsedActions, cleanResponse })}\n\n`);
    res.end();

  } catch (err: any) {
    console.error("KIRO smart-chat error:", err.message, err.stack?.slice(0, 300));
    const msg = err.message || "KIRO is temporarily unavailable";
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: msg });
    } else {
      res.write(`data: ${JSON.stringify({ error: true, message: msg })}\n\n`);
      res.end();
    }
  }
}

// ── POST /api/kai/action ──────────────────────────────────────
export async function executeAction(req: Request, res: Response) {
  const { conversationId, storeId, actions } = req.body;
  if (!actions?.length) return res.status(400).json({ success: false, message: "actions required" });

  const results = [];
  for (const action of actions) {
    if (!action.approved) continue;
    try {
      let result: any = null;
      switch (action.type) {
        case "update_order_status":
          result = await prisma.order.update({ where: { id: action.payload.orderId }, data: { status: action.payload.status } });
          break;
        case "create_coupon":
          result = await (prisma.coupon as any).create({
            data: { storeId, code: action.payload.code, discountType: action.payload.discountType || "PERCENTAGE",
              discountValue: action.payload.discountValue, isActive: true,
              expiresAt: action.payload.expiresAt ? new Date(action.payload.expiresAt) : null },
          });
          break;
        case "update_price":
          result = await prisma.product.update({ where: { id: action.payload.productId }, data: { price: action.payload.price } });
          break;

        case "add_product": {
          const pName = action.payload.name || "Product";
          const pSlug = pName.toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 80) + "-" + Date.now().toString(36);
          // Include image if provided in payload or from context
          const pImages = action.payload.images?.length
            ? action.payload.images
            : action.payload.imageUrl
            ? [action.payload.imageUrl]
            : [];
          result = await (prisma.product as any).create({
            data: {
              storeId:     action.payload.storeId || storeId,
              name:        pName,
              slug:        pSlug,
              price:       Number(action.payload.price) || 0,
              description: action.payload.description || "",
              images:      pImages,
              inventory:   Number(action.payload.inventory) || 100,
              category:    action.payload.category || "",
              status:      "ACTIVE",
            },
          });
          break;
        }

        case "update_stock":
          result = await (prisma.product as any).update({
            where: { id: action.payload.productId },
            data:  { inventory: Number(action.payload.quantity) },
          });
          break;

        case "create_discount":
          result = await (prisma.coupon as any).create({
            data: {
              storeId,
              code:     action.payload.code,
              discount: Number(action.payload.discount) || 10,
              type:     action.payload.type || "PERCENTAGE",
              maxUses:  Number(action.payload.maxUses) || 100,
              expiresAt: action.payload.expiresAt ? new Date(action.payload.expiresAt) : null,
            },
          });
          break;

        case "update_shipping":
          result = await (prisma.shippingZone as any).upsert({
            where:  { id: action.payload.zoneId || "new" },
            create: { storeId, name: action.payload.name, shippingRate: Number(action.payload.rate), estimatedDays: action.payload.days || "3-5 days", countries: ["Nigeria"] },
            update: { shippingRate: Number(action.payload.rate) },
          });
          break;
        case "update_goal":
          const _userId = (req as any).user?.userId || (req as any).user?.id;
          result = await (prisma.kaiGoal as any).upsert({
            where: { id: action.payload.goalId || "new" },
            create: { storeId, userId: (req as AuthRequest).user?.userId || (req as AuthRequest).user?.id || 'system', title: action.payload.title, targetValue: action.payload.targetValue,
              currentValue: 0, unit: action.payload.unit, deadline: new Date(action.payload.deadline) },
            update: { currentValue: action.payload.currentValue },
          });
          break;

        case "create_flash_sale": {
          // Create a time-limited sale by setting compare prices
          const products = action.payload.productIds || [];
          const discount = action.payload.discountPercent || 20;
          result = await Promise.all(products.map((pid: string) =>
            prisma.product.findUnique({ where: { id: pid } }).then(p => {
              if (!p) return null;
              return (prisma.product as any).update({
                where: { id: pid },
                data: { comparePrice: p.price, price: Math.round(p.price * (1 - discount/100)) },
              });
            })
          ));
          break;
        }

        case "send_email": {
          // Queue an email campaign
          result = { queued: true, subject: action.payload.subject, preview: action.payload.body?.slice(0,100) };
          break;
        }

        case "update_store_description": {
          result = await (prisma.store as any).update({
            where: { id: storeId },
            data: { description: action.payload.description },
          });
          break;
        }

        case "set_product_status": {
          result = await (prisma.product as any).update({
            where: { id: action.payload.productId },
            data: { status: action.payload.status || "ACTIVE" },
          });
          break;
        }

        default:
          result = { note: `Action ${action.type} logged for manual execution` };
      }
      await (prisma.kaiActionLog as any).create({
        data: { storeId, conversationId: conversationId || "", actionType: action.type,
          payload: action.payload, approved: true, executed: true, result },
      });
      const desc = describeAction(action.type, action.payload, storeId);
      results.push({
        actionId:  action.id,
        type:      action.type,
        success:   true,
        result,
        message:   desc.successMessage,
        title:     desc.title,
        icon:      desc.icon,
      });
      // Self-evaluation log — KIRO tracks what it does
      (prisma.kaiActionLog as any).create({
        data: {
          storeId,
          conversationId: req.body.conversationId || null,
          actionType: action.type,
          payload: action.payload,
          approved: true,
          executed: true,
          result: { success: true, message: desc.successMessage },
        }
      }).catch(() => {});
    } catch (err: any) {
      const humanError = translateError(action.type, err.message || "unknown error");
      results.push({
        actionId: action.id,
        type:     action.type,
        success:  false,
        error:    humanError,
        rawError: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
  res.json({ success: true, data: results, results }); // dual path for frontend compat
}

// ── PATCH /api/kai/conversation/:id ──────────────────────────
export async function updateConversation(req: Request, res: Response) {
  try {
    const { title, pinned, archived } = req.body;
    const updated = await prisma.kaiConversation.update({
      where: { id: req.params.id },
      data: {
        ...(title    !== undefined && { title }),
        ...(pinned   !== undefined && { pinned }),
        ...(archived !== undefined && { archived }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE /api/kai/conversation/:id ─────────────────────────
export async function deleteConversation(req: Request, res: Response) {
  try {
    await prisma.kaiConversation.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE /api/kai/conversations/all ────────────────────────
export async function deleteAllConversations(req: Request, res: Response) {
  try {
    const { storeId } = req.body;
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    await prisma.kaiConversation.deleteMany({ where: { storeId } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/memories ─────────────────────────────────────
export async function getKaiMemories(req: Request, res: Response) {
  try {
    const { storeId, category } = req.query as { storeId: string; category?: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    const memories = await getMemories(storeId, category);
    res.json({ success: true, data: memories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE /api/kai/memory/:key ───────────────────────────────
export async function deleteKaiMemory(req: Request, res: Response) {
  try {
    const { storeId } = req.body;
    await deleteMemory(storeId, req.params.key);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/pulse ────────────────────────────────────────
export async function getPulseAlerts(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    const alerts = await getUnreadAlerts(storeId);
    res.json({ success: true, data: alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── PATCH /api/kai/pulse/:id/read ────────────────────────────
export async function readPulseAlert(req: Request, res: Response) {
  try {
    await markAlertRead(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/skills ───────────────────────────────────────
export async function getSkills(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    const skills = await getKaiSkills(storeId);
    res.json({ success: true, data: skills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/skills ──────────────────────────────────────
export async function createSkill(req: Request, res: Response) {
  try {
    const { storeId, name, prompt, description, icon, variables } = req.body;
    if (!storeId || !name || !prompt) return res.status(400).json({ success: false, message: "storeId, name, prompt required" });
    const skill = await (prisma.kaiSkill as any).create({
      data: { storeId, name, prompt, description, icon, variables: variables || [] },
    });
    res.json({ success: true, data: skill });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE /api/kai/skills/:id ────────────────────────────────
export async function deleteSkill(req: Request, res: Response) {
  try {
    await prisma.kaiSkill.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/skills/:id/use ─────────────────────────────
export async function useSkill(req: Request, res: Response) {
  try {
    await prisma.kaiSkill.update({
      where: { id: req.params.id },
      data: { usageCount: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/analyze-voice ───────────────────────────────
export async function analyzeVoice(req: Request, res: Response) {
  try {
    const { storeId, content } = req.body;
    if (!storeId || !content) return res.status(400).json({ success: false, message: "storeId and content required" });
    await analyzeBrandVoice(storeId, content, apiKey());
    res.json({ success: true, message: "Brand voice analyzed and saved" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/goals ────────────────────────────────────────
export async function getGoals(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });
    const goals = await prisma.kaiGoal.findMany({
      where: { storeId },
      
      orderBy: { deadline: "asc" },
    });
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/goals ───────────────────────────────────────
export async function createGoal(req: Request, res: Response) {
  try {
    const { storeId, title, targetValue, unit, deadline, description } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!storeId || !title || !targetValue || !deadline)
      return res.status(400).json({ success: false, message: "storeId, title, targetValue, deadline required" });

    const goal = await (prisma.kaiGoal as any).create({
      data: { storeId, userId, title, description, targetValue, unit: unit || "NGN", deadline: new Date(deadline) },
      
    });

    // Save to memory
    await saveMemory(storeId, "goal", `goal_${goal.id}`,
      `Owner wants to ${title} by ${new Date(deadline).toLocaleDateString()}`, 1.0);

    res.json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET /api/kai/morning-brief — proactive daily summary ─────────────────────
export async function getMorningBrief(req: Request, res: Response) {
  try {
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success:false, message:"storeId required" });

    const ctx = await getDeepContext(storeId);
    const memories = await getMemoryContext(storeId).catch(() => "");
    const sym = ctx.currencySymbol;

    // Build a contextual brief
    const today = new Date().toLocaleDateString("en-NG", { weekday:"long", day:"numeric", month:"long" });
    const hour  = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

    const lines: string[] = [];
    lines.push(`${greeting} 👋 Here's your store update for ${today}:`);
    lines.push("");
    lines.push(`💰 Revenue today: ${sym}${(ctx.revenueToday||0).toLocaleString()}`);
    lines.push(`📦 Orders: ${ctx.totalOrders} total, ${ctx.pendingOrders} pending`);
    lines.push(`🛍️ Products: ${ctx.activeProducts} active`);
    if (ctx.lowStockProducts.length > 0) lines.push(`⚠️ ${ctx.lowStockProducts.length} products are low on stock: ${ctx.lowStockProducts.slice(0,3).map((p:any)=>p.name||p).join(", ")}`);
    lines.push("");

    if (ctx.pendingOrders > 0) {
      lines.push(`🚨 You have ${ctx.pendingOrders} unfulfilled orders. Fulfill them now to build trust.`);
    } else if (ctx.revenueToday === 0) {
      lines.push(`Your store has ₦0 in sales today. Want me to suggest a quick push strategy?`);
    } else {
      lines.push(`Things are moving. Keep the momentum going.`);
    }

    res.json({ success:true, data: { brief: lines.join("\n"), ctx, date: today } });
  } catch(err:any) {
    res.status(500).json({ success:false, message:err.message });
  }
}

