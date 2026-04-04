// ============================================================
// KAI — Complete Controller (10/10)
// Path: backend/src/controllers/kai.controller.ts
// ============================================================
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  getStoreContext, buildCompleteSystemPrompt, callClaude,
  detectIntent, needsWebSearch, generateTitle,
  buildGreeting, buildQuickActions,
} from "../services/kai.service";
import {
  extractMemoriesFromConversation, getMemories, saveMemory,
  deleteMemory, getActiveGoals, analyzeBrandVoice,
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
      getStoreContext(storeId),
      getUnreadAlerts(storeId),
    ]);

    const user      = (req as any).user;
    const firstName = (user?.name || "there").split(" ")[0];
    const hour      = new Date().getHours();

    const { greeting, contextLine } = buildGreeting(firstName, ctx, hour);
    const quickActions = buildQuickActions(ctx);

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
    const { storeId } = req.query as { storeId: string };
    if (!storeId) return res.status(400).json({ success: false, message: "storeId required" });

    const conversations = await prisma.kaiConversation.findMany({
      where: { storeId, archived: false },
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
  const { message, conversationId, storeId, imageBase64, imageMediaType } = req.body;
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
      conv = await prisma.kaiConversation.create({
        data: { storeId, title: generateTitle(message) },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.kaiMessage.create({
      data: { conversationId: conv.id, role: "user", content: message },
    });

    // Get everything in parallel
    const [ctx, intent] = await Promise.all([
      getStoreContext(storeId),
      Promise.resolve(detectIntent(message)),
    ]);
    const useSearch = needsWebSearch(message, intent);

    // Build conversation history
    const history = (conv.messages || [])
      .slice(-8)
      .map((m: any) => `${m.role === "user" ? "Owner" : "KAI"}: ${m.content.slice(0, 200)}`)
      .join("\n");

    // Build complete system prompt (includes memory, goals, brand voice, market data)
    const systemPrompt = await buildCompleteSystemPrompt(ctx, storeId, history);

    // Build messages array
    const claudeMsgs: any[] = [];
    for (const m of (conv.messages || []).slice(-6)) {
      claudeMsgs.push({ role: m.role, content: m.content });
    }
    // Current message (with optional image)
    const currentContent: any[] = [];
    if (imageBase64 && imageMediaType) {
      currentContent.push({ type: "image", source: { type: "base64", media_type: imageMediaType, data: imageBase64 } });
    }
    currentContent.push({ type: "text", text: message });
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
      maxTokens: 1024,
      onToken: (token) => {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token, conversationId: conv.id })}\n\n`);
      },
    });

    // Save KAI response
    await prisma.kaiMessage.create({
      data: {
        conversationId: conv.id,
        role: "assistant",
        content: fullResponse,
        metadata: { intent, searched: useSearch },
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

    res.write(`data: ${JSON.stringify({ done: true, conversationId: conv.id })}\n\n`);
    res.end();

  } catch (err: any) {
    console.error("KAI smart-chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "KAI is temporarily unavailable" });
    } else {
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
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
          result = await prisma.coupon.create({
            data: { storeId, code: action.payload.code, discountType: action.payload.discountType || "PERCENTAGE",
              discountValue: action.payload.discountValue, isActive: true,
              expiresAt: action.payload.expiresAt ? new Date(action.payload.expiresAt) : null },
          });
          break;
        case "update_price":
          result = await prisma.product.update({ where: { id: action.payload.productId }, data: { price: action.payload.price } });
          break;
        case "update_goal":
          result = await prisma.kaiGoal.upsert({
            where: { id: action.payload.goalId || "new" },
            create: { storeId, title: action.payload.title, targetValue: action.payload.targetValue,
              currentValue: 0, unit: action.payload.unit, deadline: new Date(action.payload.deadline) },
            update: { currentValue: action.payload.currentValue },
          });
          break;
        default:
          result = { note: `Action ${action.type} logged for manual execution` };
      }
      await prisma.kaiActionLog.create({
        data: { storeId, conversationId: conversationId || "", actionType: action.type,
          payload: action.payload, approved: true, executed: true, result },
      });
      results.push({ actionId: action.id, success: true, result });
    } catch (err: any) {
      results.push({ actionId: action.id, success: false, error: err.message });
    }
  }
  res.json({ success: true, data: results });
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
    const skill = await prisma.kaiSkill.create({
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
      include: { milestones: true },
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
    if (!storeId || !title || !targetValue || !deadline)
      return res.status(400).json({ success: false, message: "storeId, title, targetValue, deadline required" });

    const goal = await prisma.kaiGoal.create({
      data: { storeId, title, description, targetValue, unit: unit || "NGN", deadline: new Date(deadline) },
      include: { milestones: true },
    });

    // Save to memory
    await saveMemory(storeId, "goal", `goal_${goal.id}`,
      `Owner wants to ${title} by ${new Date(deadline).toLocaleDateString()}`, 1.0);

    res.json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
