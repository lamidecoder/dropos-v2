// ============================================================
// Theme Controller + Routes
// Path: backend/src/controllers/theme.controller.ts
// ============================================================
import { Request, Response } from "express";
import { getThemeSettings, saveThemeSettings, applyKAIThemeCommand } from "../services/theme.service";

const apiKey = () => process.env.ANTHROPIC_API_KEY || "";

export async function getTheme(req: Request, res: Response) {
  try {
    const { storeId } = req.params;
    const settings = await getThemeSettings(storeId);
    res.json({ success: true, data: settings });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function updateTheme(req: Request, res: Response) {
  try {
    const { storeId }  = req.params;
    const { settings } = req.body;
    await saveThemeSettings(storeId, settings);
    res.json({ success: true, message: "Theme saved" });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

export async function kaiThemeCommand(req: Request, res: Response) {
  try {
    const { storeId }           = req.params;
    const { instruction, current } = req.body;
    if (!instruction) return res.status(400).json({ success: false, message: "instruction required" });
    const result = await applyKAIThemeCommand(storeId, instruction, current, apiKey());
    res.json({ success: true, data: result });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
}

// ── Routes ────────────────────────────────────────────────────
import { Router }    from "express";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.get  ("/:storeId",         getTheme);
router.patch("/:storeId",         updateTheme);
router.post ("/:storeId/kai",     kaiThemeCommand);
export default router;

// Add to app.ts:
// import themeRoutes from "./routes/theme.routes";
// app.use("/api/theme", themeRoutes);
