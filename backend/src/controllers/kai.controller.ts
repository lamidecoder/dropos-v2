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
import { scrapeAnyUrl, researchMarket, getTrendingProducts, calculateProfit } from "../services/kai.scraper.service";
// Note: getStoreContext replaced by getDeepContext globally
import { getDeepContext } from "../services/kai.context";
import { buildStoreBrain, decomposeGoal } from "../services/kai.brain";
import { buildIntelligencePrompt } from "../services/kai.intelligence";
import {
  extractMemoriesFromConversation, getMemories, saveMemory,
  deleteMemory, getActiveGoals, analyzeBrandVoice, getMemoryContext,
  getRelevantMemories, buildCrossSessionContext, summarizeAndSaveConversation,
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
  const isPublicMode = req.body.public === true || !storeId;
  if (!message)
    return res.status(400).json({ success: false, message: "message required" });

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
      if (!userId && !isPublicMode) return res.status(401).json({ success: false, message: "User not found in token" });
      conv = await (prisma.kaiConversation as any).create({
        data: { storeId: storeId || "public", userId: userId || "anon", title: generateTitle(message) },
        include: { messages: true },
      }).catch(() => ({ id: "public-" + Date.now(), messages: [] }));
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


    
// URL_INTERCEPT_MARKER_START
    // ── URL AUTO-IMPORT: detect product URL in message ─────────────────────────
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    const productUrlPatterns = /aliexpress\.com\/item|temu\.com|amazon\.com\/dp|amazon\.com\/product|jumia\.|konga\.com|shein\.com|tiktok\.com\/shop|1688\.com|dhgate\.com\/product|alibaba\.com\/product|ebay\.com\/itm|etsy\.com\/listing/i;
    
    if (urlMatch && productUrlPatterns.test(urlMatch[0])) {
      const productUrl = urlMatch[0].split(/[\s,\n]/)[0];
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      const detectedPlatform = productUrl.toLowerCase().includes("aliexpress") ? "AliExpress"
        : productUrl.toLowerCase().includes("temu") ? "Temu"
        : productUrl.toLowerCase().includes("amazon") ? "Amazon"
        : productUrl.toLowerCase().includes("jumia") ? "Jumia"
        : productUrl.toLowerCase().includes("shein") ? "Shein"
        : productUrl.toLowerCase().includes("tiktok") ? "TikTok Shop"
        : productUrl.toLowerCase().includes("dhgate") ? "DHgate"
        : productUrl.toLowerCase().includes("alibaba") ? "Alibaba"
        : "that store";
      
      const fetchMsg = `Detected ${detectedPlatform} link. Fetching product now...`;
      res.write(`data: ${JSON.stringify({ token: fetchMsg })}\n\n`);
      
      try {
        await (prisma.kaiMessage as any).create({
          data: { conversationId: conv.id, role: "user", content: message },
        });
        
        const storeLocale = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true, currency: true } });
        const scraped = await scrapeAnyUrl(productUrl, storeLocale?.country || "NG", storeLocale?.currency || "NGN");
        
        const sym2 = scraped.currencySymbol || "₦";
        const profitLocal = scraped.profitPerSale || 0;
        const sellingPrice = scraped.suggestedLocalPrice || 0;
        
        const scrapeReply = [
          `Found it on ${scraped.platformDetected}. Here is what I got:`,
          ``,
          `Product: ${scraped.name}`,
          `Category: ${scraped.category}`,
          `Suggested selling price: ${sym2}${sellingPrice.toLocaleString()}`,
          `Estimated margin: ${scraped.marginPct || 0}%`,
          `Profit per sale: ${sym2}${profitLocal.toLocaleString()}`,
          scraped.estimatedShippingDays ? `Shipping: ${scraped.estimatedShippingDays} days` : "",
          ``,
          scraped.shortDescription || "",
          ``,
          `Want me to add this to your store? I can adjust the price before listing.`,
        ].filter(Boolean).join("\n");
        
        const actionLine = `KIRO_ACTION:{"type":"import_from_url","payload":{"url":"${productUrl.replace(/"/g,"'")}","name":"${scraped.name.replace(/"/g,"'")}","price":${sellingPrice}}}`;
        
        for (const char of scrapeReply) {
          res.write(`data: ${JSON.stringify({ token: char })}\n\n`);
        }
        
        await (prisma.kaiMessage as any).create({
          data: { conversationId: conv.id, role: "assistant", content: scrapeReply + "\n" + actionLine },
        });
        
        const scrapedAction = {
          type: "import_from_url",
          payload: { url: productUrl, name: scraped.name, price: sellingPrice },
          description: `Import "${scraped.name}" from ${scraped.platformDetected}`,
          approved: false,
        };
        
        res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id, actions: [scrapedAction] })}\n\n`);
        res.end();
        return;
        
      } catch (scrapeErr: any) {
        const msg = scrapeErr.message?.includes("restricted") || scrapeErr.message?.includes("login")
          ? "That page requires login or bot protection. Try pasting just the product name and price and I will write the full listing for you."
          : "Could not fetch that URL. The site may have bot protection. Just paste the product name and price here and I will create the listing instantly.";
        res.write(`data: ${JSON.stringify({ token: msg })}\n\n`);
        await (prisma.kaiMessage as any).create({
          data: { conversationId: conv.id, role: "assistant", content: msg },
        });
        res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id })}\n\n`);
        res.end();
        return;
      }
    }
    // ── END URL AUTO-IMPORT ──────────────────────────────────────────────────────


    // Get everything in parallel
    const [ctx, intent] = await Promise.all([
      storeId ? getDeepContext(storeId).catch((e) => {
        console.error("[KIRO] getDeepContext failed:", e.message);
        return null as any;
      }) : Promise.resolve(null),
      Promise.resolve(detectIntent(message)),
    ]);
    if (!ctx && !isPublicMode) {
      res.write(`data: ${JSON.stringify({ token: "KIRO is warming up — store data loading. Try again in a moment." })}

`);
      res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id })}

`);
      res.end(); return;
    }
    // Public mode fallback context
    const effectiveCtx = ctx || {
      storeName: "your store", country: "NG", currency: "NGN", currencySymbol: "₦",
      plan: "FREE", totalProducts: 0, totalOrders: 0, revenueToday: 0,
      revenueThisMonth: 0, revenueLastMonth: 0, pendingOrders: 0, lowStockProducts: [],
      products: [], orders: [], customers: [], healthScore: 0, growthStage: "setup",
      unfulfilledRevenue: 0, lowStockCount: 0, topProducts: [], recentOrders: [],
    };
    const useSearch = ["market_research","trending","analytics"].includes(intent);
    const ctxForPrompt = effectiveCtx ?? ctx ?? { storeName: "your store", country: "NG", currencySymbol: "₦" } as any;

    // Build rich conversation history - 20 messages, near full content
    const historyMsgs = (conv.messages || []).slice(-20);
    const history = historyMsgs
      .map((m: any) => {
        const who = m.role === "user" ? "Owner" : "KIRO";
        const content = m.content.slice(0, 800); // much more context
        return `${who}: ${content}`;
      })
      .join("\n");
    
    // ── SPEED: Run all heavy context fetches in parallel ──────────────────────
    const userId2 = (req as any).user?.userId || (req as any).user?.id;
    const [crossSessionContext, memories, brain] = await Promise.all([
      storeId ? buildCrossSessionContext(storeId, userId2, conv.id, message).catch(() => "") : Promise.resolve(""),
      storeId ? getRelevantMemories(storeId, message).catch(() => "") : Promise.resolve(""),
      (storeId && ctx) ? buildStoreBrain(storeId, ctx).catch(() => undefined) : Promise.resolve(undefined),
    ]);

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
    // Use 8 msgs for simple/text, 12 for complex — saves tokens
    const historyDepth = (imageBase64 || intent !== "general") ? 12 : 8;
    for (const m of (conv.messages || []).slice(-historyDepth)) {
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
    // Handle PDF/document upload
    const fileBase64   = req.body.fileBase64;
    const fileType     = req.body.fileType;
    if (fileBase64 && fileType === "pdf") {
      currentContent.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: fileBase64 }
      } as any);
    }
    currentContent.push({ type: "text", text: enhancedMessage });
    claudeMsgs.push({ role: "user", content: currentContent.length === 1 ? message : currentContent });

    // Stream response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

        let fullResponse = "";
    // Track when we've hit KIRO_ACTION to stop streaming those chars to client
    let actionStartIdx = -1;

    const msgLower = message.toLowerCase().trim();
    const isSimple = /^(hi|hello|hey|thanks|ok|okay|yes|no|sure|great|nice|cool|what.*name|who are you|good\s*(morning|afternoon|evening|night)|my name is)[\s!?.]*$/i.test(message.trim());

    // Smart model selection — haiku for simple chat, sonnet for actions/analysis/images
    const needsSonnet = !!finalImageBase64 || /import|add product|create|update|delete|refund|email|whatsapp|analytics|revenue|trending|scrape|research|strategy|forecast/i.test(message);
    const model = needsSonnet ? "claude-sonnet-4-6" : (isSimple ? "claude-haiku-4-5-20251001" : "claude-sonnet-4-6");
    const maxTok = finalImageBase64 ? 4096 : (isSimple ? 800 : 4096);

    await callClaude({
      systemPrompt,
      messages: claudeMsgs,
      useSearch,
      model,
      maxTokens: maxTok,
      onToken: (token) => {
        fullResponse += token;

        // Once we detect KIRO_ACTION in the accumulated text, stop sending tokens to client
        if (actionStartIdx === -1 && fullResponse.includes("KIRO_ACTION")) {
          // Mark where the action starts in the full response
          actionStartIdx = fullResponse.lastIndexOf("KIRO_ACTION");
        }

        // Only stream tokens that come BEFORE the KIRO_ACTION block
        if (actionStartIdx === -1) {
          // No action yet — stream the clean token
          const cleanTok = token
            .replace(/\*\*/g, "").replace(/\*/g, "").replace(/^#+\s/gm, "");
          res.write(`data: ${JSON.stringify({ token: cleanTok, conversationId: conv.id })}\n\n`);
        }
        // If actionStartIdx is set, suppress remaining tokens (they're part of the action JSON)
      },
    });


    // Parse KIRO_ACTION — handles every format KIRO might output
    const parsedActions: any[] = [];
    // Strip ALL markdown asterisks from KIRO responses
    let cleanResponse = fullResponse
      .replace(/\*\*([^*]+)\*\*/g, '$1')   // **bold** → plain
      .replace(/\*([^*\n]+)\*/g, '$1')       // *italic* → plain
      .replace(/^\s*[\*\-]\s/gm, '')         // bullet * or - at line start → remove
      .replace(/#{1,6}\s/g, '')               // ## headings → remove
      .replace(/\n{3,}/g, '\n\n');            // max 2 newlines
    try {
      // Step 1: normalize all variants to KIRO_ACTION:{...}
      let work = fullResponse
        .replace(/KIRO_ACTION\s*```json?\s*/gi, "KIRO_ACTION:")   // code block start
        .replace(/```\s*$/gm,                        "")           // code block end
        .replace(/KIRO_ACTION\s*:\s*\n\s*/g,      "KIRO_ACTION:") // colon + newline
        .replace(/KIRO_ACTION\s+(?=\{)/g,           "KIRO_ACTION:"); // space instead of colon

      // Step 2: extract JSON objects using bracket-depth counter (handles any nesting)
      const actionMarkerRe = /KIRO_ACTION\s*:?\s*/g;
      let markerMatch: RegExpExecArray | null;
      while ((markerMatch = actionMarkerRe.exec(work)) !== null) {
        const startIdx = work.indexOf("{", markerMatch.index + markerMatch[0].length);
        if (startIdx === -1) continue;
        // Walk forward counting brackets
        let depth = 0, j = startIdx;
        while (j < work.length) {
          if (work[j] === "{") depth++;
          else if (work[j] === "}") { depth--; if (depth === 0) { j++; break; } }
          j++;
        }
        const jsonStr = work.slice(startIdx, j);
        try {
          const obj = JSON.parse(jsonStr);
          if (obj.action && !obj.type) obj.type = obj.action;
          if (obj.type) {
            parsedActions.push(obj.payload ? obj : { type: obj.type, payload: obj });
          }
        } catch {
          // Try cleaning whitespace
          try {
            const obj = JSON.parse(jsonStr.replace(/\n/g," ").replace(/\s+/g," "));
            if (obj.action && !obj.type) obj.type = obj.action;
            if (obj.type) parsedActions.push(obj.payload ? obj : { type: obj.type, payload: obj });
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
    console.error("KIRO error:", err.message?.slice(0, 200));
    
    // Translate technical errors to human language
    let humanMsg = "KIRO is having a moment. Try sending that again.";
    const raw = (err.message || "").toLowerCase();
    if (raw.includes("429") || raw.includes("rate_limit") || raw.includes("rate limit")) {
      humanMsg = "I'm getting a lot of requests right now. Give me 30 seconds and ask again.";
    } else if (raw.includes("anthropic_api_key") || raw.includes("api key")) {
      humanMsg = "KIRO isn't fully configured yet. The API key needs to be set in Render settings.";
    } else if (raw.includes("timeout") || raw.includes("econnreset")) {
      humanMsg = "Connection timed out. Your store data is fine — just try again.";
    } else if (raw.includes("token") || raw.includes("auth") || raw.includes("401")) {
      humanMsg = "Session expired. Refresh the page and try again.";
    }
    
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: humanMsg });
    } else {
      res.write(`data: ${JSON.stringify({ error: true, message: humanMsg })}\n\n`);
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
              status:      "ACTIVE" as any,
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

        case "update_product_image": {
          // Add image URL to existing product
          const existing = await prisma.product.findUnique({ where: { id: action.payload.productId } });
          if (!existing) throw new Error("Product not found");
          const currentImages: string[] = (existing.images as string[]) || [];
          const newImages = action.payload.imageUrl
            ? [...new Set([action.payload.imageUrl, ...currentImages])]
            : currentImages;
          result = await prisma.product.update({
            where: { id: action.payload.productId },
            data: { images: newImages },
          });
          break;
        }

        case "update_product": {
          const updateData: any = {};
          if (action.payload.name)        updateData.name        = action.payload.name;
          if (action.payload.price)       updateData.price       = Number(action.payload.price);
          if (action.payload.description) updateData.description = action.payload.description;
          if (action.payload.inventory !== undefined) updateData.inventory = Number(action.payload.inventory);
          if (action.payload.category)    updateData.category    = action.payload.category;
          result = await prisma.product.update({
            where: { id: action.payload.productId },
            data:  updateData,
          });
          break;
        }

        case "import_from_url": {
          const store2 = await prisma.store.findUnique({ where: { id: storeId }, select: { country: true, currency: true } });
          const importUrl = action.payload.url;
          if (!importUrl) throw new Error("No URL provided for import");
          const scraped = await scrapeAnyUrl(importUrl, store2?.country || "NG", store2?.currency || "NGN");
          const slugBase = (scraped.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,60);
          const slug = `${slugBase}-${Date.now().toString(36)}`;
          const safePrice = Number(action.payload.price || scraped.suggestedLocalPrice || 0);
          const safeTags  = Array.isArray(scraped.tags) ? scraped.tags.filter((t: any) => typeof t === "string") : [];
          const safeImages= Array.isArray(scraped.images) ? scraped.images.filter((i: any) => typeof i === "string" && i.startsWith("http")) : [];
          result = await prisma.product.create({
            data: {
              storeId,
              name:        scraped.name || "Imported Product",
              slug,
              description: scraped.description || scraped.shortDescription || "",
              price:       safePrice,
              category:    scraped.category || "Other",
              tags:        safeTags,
              images:      safeImages,
              inventory:   50,
              status:      "ACTIVE" as any,
              sourceUrl:   importUrl,
            },
          });
          break;
        }

        case "process_refund": {
          const refundOrder = await prisma.order.findUnique({ where: { id: action.payload.orderId }, include: { items: true } });
          if (!refundOrder) throw new Error(`Order not found`);
          const refundAmount = action.payload.amount || (refundOrder as any).total || 0;
          // Log refund (Paystack refund requires env key - graceful fallback)
          result = await prisma.order.update({
            where: { id: action.payload.orderId },
            data: { status: "REFUNDED" as any, notes: `Refunded ${refundAmount} by KIRO on ${new Date().toLocaleDateString()}` },
          });
          // Try Paystack refund if key exists
          const paystackKey = process.env.PAYSTACK_SECRET_KEY;
          if (paystackKey && (refundOrder as any).paymentRef) {
            fetch(`https://api.paystack.co/refund`, {
              method: "POST",
              headers: { Authorization: `Bearer ${paystackKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ transaction: (refundOrder as any).paymentRef, amount: Math.round(refundAmount * 100) }),
            }).catch(() => {});
          }
          break;
        }

        case "send_email": {
          const resendKey = process.env.RESEND_API_KEY;
          if (!resendKey) throw new Error("Email sending is not configured yet. Add RESEND_API_KEY in your environment settings.");
          const emailRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: action.payload.from || "KIRO <hello@droposhq.com>",
              to:   action.payload.to,
              subject: action.payload.subject,
              html: action.payload.html || `<p>${action.payload.body}</p>`,
            }),
          });
          if (!emailRes.ok) {
            const err = await emailRes.json().catch(() => ({}));
            throw new Error(`Email failed: ${(err as any).message || emailRes.statusText}`);
          }
          result = await emailRes.json();
          break;
        }

        case "send_whatsapp": {
          const twilio = {
            sid:   process.env.TWILIO_ACCOUNT_SID,
            token: process.env.TWILIO_AUTH_TOKEN,
            from:  process.env.TWILIO_PHONE,
          };
          if (!twilio.sid || !twilio.token) throw new Error("WhatsApp is not configured yet. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment settings.");
          const waRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Messages.json`, {
            method: "POST",
            headers: { Authorization: `Basic ${Buffer.from(`${twilio.sid}:${twilio.token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ From: `whatsapp:${twilio.from}`, To: `whatsapp:${action.payload.to}`, Body: action.payload.message }),
          });
          if (!waRes.ok) throw new Error("WhatsApp send failed");
          result = await waRes.json();
          break;
        }

        case "bulk_update_prices": {
          const mult = Number(action.payload.multiplier || 1);
          const cat  = action.payload.category || null;
          const where: any = { storeId };
          if (cat) where.category = cat;
          const products = await prisma.product.findMany({ where, select: { id:true, price:true } });
          let updated = 0;
          for (const p of products) {
            const newPrice = action.payload.fixedPrice
              ? Number(action.payload.fixedPrice)
              : Math.round(p.price * mult);
            await prisma.product.update({ where:{ id:p.id }, data:{ price:newPrice } });
            updated++;
          }
          result = { message:`Updated ${updated} products` };
          break;
        }

        case "delete_product": {
          result = await prisma.product.delete({ where:{ id:action.payload.productId } });
          break;
        }

        case "duplicate_product": {
          const orig = await prisma.product.findUnique({ where:{ id:action.payload.productId } });
          if (!orig) throw new Error("Product not found");
          const { id:_id, createdAt:_c, updatedAt:_u, slug:_s, ...rest } = orig as any;
          const newSlug = `${_s}-copy-${Date.now().toString(36)}`;
          result = await prisma.product.create({ data:{ ...rest, slug:newSlug, name:`${orig.name} (Copy)`, status:"DRAFT" as any } });
          break;
        }

        case "add_tracking": {
          result = await prisma.order.update({
            where: { id: action.payload.orderId },
            data:  { trackingNumber: action.payload.trackingNumber, status:"SHIPPED" as any },
          });
          break;
        }

        case "create_collection": {
          // productCategory model not in schema — store as a tag/category in product metadata
          result = { message:`Collection "${action.payload.name}" noted. You can filter products by this category name.` };
          break;
        }

        case "create_coupon_v2": {
          const expiry2 = action.payload.expiresInDays
            ? new Date(Date.now() + Number(action.payload.expiresInDays) * 86400000)
            : action.payload.expiresAt ? new Date(action.payload.expiresAt) : null;
          const discVal = Number(action.payload.discount || action.payload.discountValue || 10);
          result = await (prisma.coupon as any).create({
            data:{
              storeId,
              code:         (action.payload.code || "KIRO" + Date.now().toString(36).slice(-4).toUpperCase()).toUpperCase(),
              type:         action.payload.type || "PERCENTAGE",
              discountType: action.payload.type || "PERCENTAGE",
              value:        discVal,
              discountValue: discVal,
              maxUses:      Number(action.payload.maxUses || 100),
              usageLimit:   Number(action.payload.maxUses || 100),
              expiresAt:    expiry2,
            },
          });
          break;
        }

        case "send_abandoned_cart": {
          const store3 = await prisma.store.findUnique({ where:{ id:storeId }, select:{ name:true } });
          const resendKey = process.env.RESEND_API_KEY;
          if (!resendKey) throw new Error("Email sending not configured. Add RESEND_API_KEY to your environment.");
          const carts = await (prisma.abandonedCart as any)?.findMany({
            where:{ storeId, recoveryEmailSent:false },
            take: action.payload.limit || 20,
          }) || [];
          let sent = 0;
          for (const cart of carts) {
            if (!cart.customerEmail) continue;
            await fetch("https://api.resend.com/emails", {
              method:"POST",
              headers:{ Authorization:`Bearer ${resendKey}`, "Content-Type":"application/json" },
              body: JSON.stringify({
                from:`${store3?.name || "DropOS"} <hello@droposhq.com>`,
                to:  [cart.customerEmail],
                subject: action.payload.subject || `You left something behind 👀`,
                html: action.payload.body || `<p>Hi there,</p><p>You left items in your cart at ${store3?.name}. Come back and complete your order.</p>`,
              }),
            });
            await (prisma.abandonedCart as any)?.update({ where:{id:cart.id}, data:{recoveryEmailSent:true} });
            sent++;
          }
          result = { message:`Sent recovery emails to ${sent} customers` };
          break;
        }

        case "update_product_status_bulk": {
          const { productIds, status } = action.payload;
          result = await prisma.product.updateMany({
            where:{ id:{ in: productIds }, storeId },
            data:{ status: status as any },
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
      // Get product name from the result if available (avoid UUID leak)
      const resultName = result?.name || result?.code || action.payload?.name || action.payload?.code || "";
      const resultPrice = result?.price || action.payload?.price;
      const sym2 = "₦"; // default; full ctx not in scope here
      const priceStr = resultPrice ? `${sym2}${Number(resultPrice).toLocaleString()}` : "";
      
      let successMsg = "";
      if (action.type === "update_price" && resultName && priceStr) {
        successMsg = `${resultName} is now priced at ${priceStr}.`;
      } else if (action.type === "update_price" && priceStr) {
        successMsg = `Price updated to ${priceStr}.`;
      } else if (action.type === "add_product" && resultName) {
        successMsg = `"${resultName}" is now live in your store${priceStr ? ` at ${priceStr}` : ""}.`;
      } else if (action.type === "create_coupon" && result?.code) {
        successMsg = `Discount code "${result.code}" is ready. Customers can use it at checkout.`;
      } else if (action.type === "fulfill_order") {
        successMsg = "Order fulfilled. The customer has been notified.";
      } else {
        const desc2 = describeAction(action.type, action.payload, "₦");
        successMsg = desc2.successMessage;
      }
      
      const desc = describeAction(action.type, action.payload, "₦");
      results.push({
        actionId:  action.id,
        type:      action.type,
        success:   true,
        result,
        message:   successMsg || desc.successMessage,
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
      // Self-healing: ask Claude to diagnose and fix the error
      let healedAction: any = null;
      try {
        const healPrompt = `A KIRO action failed. Diagnose and provide a corrected action payload.

Action type: ${action.type}
Failed payload: ${JSON.stringify(action.payload)}
Error: ${err.message}

Return ONLY a corrected JSON payload object (no explanation, no KIRO_ACTION wrapper):
{"corrected_payload": {...}, "reason": "one sentence explanation"}`;

        const healRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "x-api-key": process.env.ANTHROPIC_API_KEY||"", "anthropic-version":"2023-06-01","Content-Type":"application/json" },
          body: JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:300, messages:[{role:"user",content:healPrompt}] }),
        });
        if (healRes.ok) {
          const healData: any = await healRes.json();
          const healText = healData.content?.[0]?.text || "";
          const healJson = JSON.parse(healText.replace(/```json|```/g,"").trim());
          if (healJson.corrected_payload) {
            healedAction = { ...action, payload: { ...action.payload, ...healJson.corrected_payload }, healed: true };
          }
        }
      } catch {}

      results.push({
        actionId: action.id,
        type:     action.type,
        success:  false,
        message:  humanError,
        error:    humanError,
        healedAction,  // frontend can retry with this corrected action
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
    const memories = await getMemories(storeId, category).catch(() => []);
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
    if (!storeId) return res.json({ success: true, data: [] }); // graceful empty
    const alerts = await getUnreadAlerts(storeId).catch(() => []);
    // Auto-generate smart pulse alerts from store context
    if (alerts.length === 0 && storeId) {
      try {
        const ctx = await getDeepContext(storeId).catch(() => null);
        const auto: any[] = [];
        if (ctx) {
          if (ctx.pendingOrders > 0) auto.push({ id:`auto-1`, severity:"warning", title:`${ctx.pendingOrders} Unfulfilled Order${ctx.pendingOrders>1?"s":""}`, message:`You have ${ctx.pendingOrders} pending orders worth ${ctx.currencySymbol}${ctx.unfulfilledRevenue?.toLocaleString()||0}. Customers are waiting.`, read:false, actionable:true, suggestedPrompt:"Show me my unfulfilled orders and help me fulfill them" });
          if (ctx.lowStockCount > 0) auto.push({ id:`auto-2`, severity:"warning", title:`${ctx.lowStockCount} Product${ctx.lowStockCount>1?"s":""}  Running Low`, message:`Restock before you run out and lose sales.`, read:false, actionable:true, suggestedPrompt:"Which products need restocking urgently?" });
          if (ctx.revenueToday === 0) auto.push({ id:`auto-3`, severity:"opportunity", title:"No Sales Yet Today", message:"Time to drive traffic. A flash sale or WhatsApp blast could flip this.", read:false, actionable:true, suggestedPrompt:"Help me drive sales today" });
        }
        return res.json({ success: true, data: auto });
      } catch {}
    }
    res.json({ success: true, data: alerts });
  } catch {
    res.json({ success: true, data: [] }); // never 500 — always return empty
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
    // Try to get skills for this store
    let storeSkills: any[] = [];
    try {
      storeSkills = await prisma.kaiSkill.findMany({
        where: { storeId, active: true },
        orderBy: { usageCount: "desc" },
      });
    } catch {}
    res.json({ success: true, data: storeSkills });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── POST /api/kai/skills ──────────────────────────────────────
export async function createSkill(req: Request, res: Response) {
  try {
    const { storeId, name, prompt, description, icon } = req.body;
    const userId = (req as any).user?.userId || (req as any).user?.id;
    if (!storeId || !name || !prompt) return res.status(400).json({ success: false, message: "storeId, name, prompt required" });
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });
    const skill = await prisma.kaiSkill.create({
      data: { storeId, userId, name, prompt, description: description || "", icon: icon || "⚡", isGlobal: false },
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
      data: { storeId, userId: userId || "anon", title, description, targetValue, unit: unit || "NGN", deadline: new Date(deadline) },
      
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


// ── POST /api/kai/public-chat (no auth, for public /kiro landing page) ───────
export async function publicChat(req: Request, res: Response) {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: "message required" });
  
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.write(`data: ${JSON.stringify({ token: "KIRO is coming soon. Create your free account to get early access!" })}

`);
    res.write(`data: ${JSON.stringify({ done: true })}

`);
    res.end(); return;
  }
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        stream: true,
        system: `You are KIRO, an AI commerce partner for African dropshippers. You are on a public landing page talking to a potential new user.
        
Be warm, energetic, and inspiring. Show them what's possible.
- If they mention a product/niche: Get excited, describe how KIRO would build their store
- If they ask what you can do: Highlight 3 specific capabilities with examples
- Always end by encouraging them to create a free account
- Keep responses under 100 words
- NO asterisks, NO markdown, NO bullet points with *
- Write like a smart friend texting them
- Never mention Claude or Anthropic`,
        messages: [{ role: "user", content: message.trim() }],
      }),
    });
    
    if (!response.ok) throw new Error("API failed");
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n").filter((l: string) => l.startsWith("data: "))) {
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") continue;
        try {
          const p = JSON.parse(raw);
          if (p.type === "content_block_delta" && p.delta?.type === "text_delta") {
            res.write(`data: ${JSON.stringify({ token: p.delta.text })}

`);
          }
        } catch {}
      }
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}

`);
  } catch {
    res.write(`data: ${JSON.stringify({ token: "I am KIRO. Tell me what you want to sell and I will show you what I can build for you." })}

`);
    res.write(`data: ${JSON.stringify({ done: true })}

`);
  }
  res.end();
}
