// ============================================================
// KAI Agent Routes
// Path: backend/src/routes/kai.agent.routes.ts
// Add to app.ts: app.use("/api/kai/agent", kaiAgentRoutes);
// ============================================================
import { Router }    from "express";
import rateLimit     from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import { getMyStores, agentChat, executeAction, getAgentContext } from "../controllers/kai.agent.controller";

const router  = Router();
const limit   = rateLimit({ windowMs: 60000, max: 30, message: { success: false, message: "Too many requests" } });

router.use(authenticate);

router.get ("/stores",               getMyStores);
router.post("/chat",     limit,      agentChat);
router.post("/execute",              executeAction);
router.get ("/context/:storeId",     getAgentContext);

export default router;
