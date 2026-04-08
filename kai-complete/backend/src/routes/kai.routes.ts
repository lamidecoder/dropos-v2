// ============================================================
// KAI — Complete Routes (10/10)
// Path: backend/src/routes/kai.routes.ts
// ============================================================
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import {
  getGreeting, getConversations, getConversation, smartChat,
  executeAction, updateConversation, deleteConversation,
  deleteAllConversations, getKaiMemories, deleteKaiMemory,
  getPulseAlerts, readPulseAlert, getSkills, createSkill,
  deleteSkill, useSkill, analyzeVoice, getGoals, createGoal,
} from "../controllers/kai.controller";

const router = Router();

const kaiLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  message: { success: false, message: "Too many KAI requests — slow down a bit" },
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
router.get   ("/skills",                getSkills);
router.post  ("/skills",                createSkill);
router.delete("/skills/:id",            deleteSkill);
router.post  ("/skills/:id/use",        useSkill);

// Brand voice
router.post  ("/analyze-voice",         analyzeVoice);

// Goals
router.get   ("/goals",                 getGoals);
router.post  ("/goals",                 createGoal);

export default router;
