import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { trackFunnelEvent, trackUtmSession, getFunnelAnalytics, getCohortAnalytics } from "../controllers/funnel.controller";
const r = Router();
r.post("/event", trackFunnelEvent);
r.post("/utm", trackUtmSession);
r.get("/:storeId/cohort", authenticate, getCohortAnalytics); // specific BEFORE generic
r.get("/:storeId", authenticate, getFunnelAnalytics);
export default r;
