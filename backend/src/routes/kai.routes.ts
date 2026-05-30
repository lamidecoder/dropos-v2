// ============================================================
// KAI — Complete Routes (10/10)
// Path: backend/src/routes/kai.routes.ts
// ============================================================
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import {
  getMorningBrief, getGreeting, getConversations, getConversation, smartChat,
  executeAction, updateConversation, deleteConversation,
  deleteAllConversations, getKaiMemories, deleteKaiMemory,
  getPulseAlerts, readPulseAlert, getSkills, createSkill,
  deleteSkill, useSkill, analyzeVoice, getGoals, createGoal,
} from "../controllers/kai.controller";
import {
  fbAdsHandler,
  tiktokSpyHandler,
  saturationHandler,
} from "../controllers/kai.scraper.controller";
import {
  generateImageHandler,
  scrapeUrlHandler as scrapeUrl,
  scrapeBatchHandler as scrapeBatch,
  researchTopicHandler as researchTopic,
  trendingHandler as trending,
  profitCalcHandler as profitCalc,
} from "../controllers/kai.scraper.controller";
import { QUICK_COMMANDS, getSuggestedCommands } from "../services/kai.commands.service";

const router = Router();

const kaiLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  message: { success: false, message: "Too many KAI requests — slow down a bit" },
});


// GET /api/kai/health — test KIRO is ready (no auth needed)
router.get("/health", async (req: any, res: any) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const hasKey = !!(apiKey && apiKey.startsWith("sk-ant"));
  
  let dbOk = false;
  try {
    const { PrismaClient } = require("@prisma/client");
    const p = new PrismaClient();
    await p.$queryRaw`SELECT 1`;
    await p.$disconnect();
    dbOk = true;
  } catch(e: any) {}

  res.json({
    ok: hasKey && dbOk,
    apiKey: hasKey ? "configured" : "MISSING - add ANTHROPIC_API_KEY to Render env",
    db: dbOk ? "connected" : "error",
    model: process.env.KIRO_MODEL || "claude-haiku-4-5-20251001",
  });
});

router.use(authenticate);

// Core chat
router.get   ("/greeting",              getGreeting);
router.post  ("/smart-chat",            kaiLimit, smartChat);
router.post  ("/action",                executeAction);

// Conversations
router.get   ("/conversations",         getConversations);
router.get   ("/conversation/:id",      getConversation);
router.patch ("/conversation/:id",      updateConversation);
router.delete("/conversation/:id",      deleteConversation);
router.delete("/conversations/all",     deleteAllConversations);

// Memory
router.get   ("/memories",              getKaiMemories);
router.delete("/memory/:key",           deleteKaiMemory);

// KAI Pulse (proactive alerts)
router.get   ("/pulse",                 getPulseAlerts);
router.patch ("/pulse/:id/read",        readPulseAlert);

// Skills (saved prompts)
// Quick Commands — power user shortcuts
router.get("/commands", (req, res) => {
  res.json({ success: true, data: QUICK_COMMANDS });
});
router.get("/commands/suggested", async (req, res) => {
  const storeId = (req.query.storeId as string) || "";
  const data = await getSuggestedCommands(storeId);
  res.json({ success: true, data });
});

router.get   ("/skills",                getSkills);
router.post  ("/skills",                createSkill);
router.delete("/skills/:id",            deleteSkill);
router.post  ("/skills/:id/use",        useSkill);

// Brand voice
router.post  ("/analyze-voice",         analyzeVoice);

// Goals
router.get   ("/goals",                 getGoals as any);
router.post  ("/goals",                 createGoal as any);

// GET /api/kai/test-key — check API key config (no auth required for diagnosis)
// Web scraper & research
router.post  ("/generate-image",         generateImageHandler);
router.post  ("/scrape-url",            scrapeUrl);
router.post  ("/fb-ads",               fbAdsHandler);
router.post  ("/tiktok-spy",           tiktokSpyHandler);
router.post  ("/saturation",           saturationHandler);
router.post  ("/scrape-batch",          scrapeBatch);
router.post  ("/research-market",       researchTopic);
router.get   ("/trending",              trending);
router.post  ("/profit-calc",           profitCalc);

router.get("/test-key", ((req: any, res: any) => {
  const key = process.env.ANTHROPIC_API_KEY;
  const model = process.env.KIRO_MODEL || "claude-sonnet-4-5";
  if (!key) { res.status(500).json({ success: false, message: "ANTHROPIC_API_KEY not set" }); return; }
  res.json({ success: true, keyPrefix: key.slice(0,10)+"...", model, length: key.length });
}) as any);

export default router;
