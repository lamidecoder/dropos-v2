// ============================================================
// Theme Routes
// Path: backend/src/routes/theme.routes.ts
// Add to app.ts: app.use("/api/theme", themeRoutes);
// ============================================================
import { Router }    from "express";
import { authenticate } from "../middleware/auth";
import { getTheme, updateTheme, kaiThemeCommand } from "../controllers/theme.controller";

const router = Router();
router.use(authenticate);

router.get  ("/:storeId",     getTheme);
router.patch("/:storeId",     updateTheme);
router.post ("/:storeId/kai", kaiThemeCommand);

export default router;
