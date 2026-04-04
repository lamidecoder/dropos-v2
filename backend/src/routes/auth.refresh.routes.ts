// ============================================================
// Auth Routes — Session-Persistent
// Path: backend/src/routes/auth.routes.ts (additions)
// Add these endpoints to your existing auth routes
// ============================================================
import { Router, Request, Response } from "express";
import {
  generateTokens, saveRefreshToken,
  setRefreshCookie, clearRefreshCookie,
  rotateRefreshToken, revokeAllSessions,
} from "../services/session.service";
import prisma from "../lib/prisma";

const router = Router();

// ── POST /api/auth/refresh ────────────────────────────────────
// Called automatically by frontend every 13 minutes
// Uses httpOnly cookie — user never sees this
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const oldToken = req.cookies?.dropos_refresh;
    if (!oldToken) {
      return res.status(401).json({
        success: false,
        code:    "NO_REFRESH_TOKEN",
        message: "No refresh token",
      });
    }

    const result = await rotateRefreshToken(
      oldToken,
      req.ip,
      req.headers["user-agent"],
    );

    if (!result) {
      clearRefreshCookie(res);
      return res.status(401).json({
        success: false,
        code:    "INVALID_REFRESH_TOKEN",
        message: "Session expired — please log in again",
      });
    }

    // Set new refresh token as httpOnly cookie
    setRefreshCookie(res, result.refreshToken);

    res.json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user:        result.user,
      },
    });
  } catch (err) {
    console.error("[Auth/Refresh]", err);
    res.status(500).json({ success: false, message: "Session refresh failed" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.dropos_refresh;
    if (refreshToken) {
      // Revoke the specific token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data:  { revokedAt: new Date() },
      }).catch(() => {});
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out" });
  } catch {
    res.json({ success: true }); // Always succeed logout
  }
});

// ── POST /api/auth/logout-all ─────────────────────────────────
// Logout from all devices
router.post("/logout-all", async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (user?.id) await revokeAllSessions(user.id);
    clearRefreshCookie(res);
    res.json({ success: true, message: "Logged out from all devices" });
  } catch {
    res.json({ success: true });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────
// Get current user — used on app load to restore session
router.get("/me", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.dropos_refresh;
    if (!refreshToken) {
      return res.status(401).json({ success: false, code: "NO_SESSION" });
    }

    // Try to refresh if we have a cookie
    const result = await rotateRefreshToken(refreshToken, req.ip, req.headers["user-agent"]);
    if (!result) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, code: "SESSION_EXPIRED" });
    }

    setRefreshCookie(res, result.refreshToken);
    res.json({
      success: true,
      data: { accessToken: result.accessToken, user: result.user },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not restore session" });
  }
});

export default router;
