// ============================================================
// Auth Middleware — Bulletproof
// Path: backend/src/middleware/auth.ts
// REPLACES existing auth middleware
// ============================================================
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken }               from "../services/session.service";
import prisma                              from "../lib/prisma";

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token  = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        code:    "NO_TOKEN",
        message: "Authentication required",
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        code:    "TOKEN_EXPIRED",
        message: "Session expired — please refresh",
      });
    }

    // Get user from DB (with caching to avoid hitting DB on every request)
    const cacheKey = `user_${decoded.userId}`;
    let user = (req as any)._userCache?.[cacheKey];

    if (!user) {
      user = await prisma.user.findUnique({
        where:   { id: decoded.userId },
        select: {
          id:            true,
          name:          true,
          email:         true,
          role:          true,
          status:        true,
          avatar:        true,
          emailVerified: true,
          subscription:  { select: { plan: true, status: true, currentPeriodEnd: true } },
          stores:        { select: { id: true, name: true, slug: true, status: true } },
        },
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        code:    "USER_NOT_FOUND",
        message: "Account not found",
      });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        code:    "ACCOUNT_BANNED",
        message: "Your account has been suspended. Contact support@droposHQ.com",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        code:    "ACCOUNT_SUSPENDED",
        message: "Account suspended. Please check your email for details.",
      });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    console.error("[Auth]", err);
    return res.status(500).json({
      success: false,
      code:    "AUTH_ERROR",
      message: "Authentication failed — please try again",
    });
  }
}

// ── Optional auth — doesn't block if no token ────────────────
// Used for public KAI widget (works with or without login)
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token  = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    (req as any).user = null;
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    (req as any).user = null;
    return next();
  }

  try {
    const user = await prisma.user.findUnique({
      where:  { id: decoded.userId },
      select: {
        id: true, name: true, email: true, role: true, status: true,
        stores: { select: { id: true, name: true, slug: true } },
        subscription: { select: { plan: true } },
      },
    });
    (req as any).user = user?.status === "ACTIVE" ? user : null;
  } catch {
    (req as any).user = null;
  }

  next();
}

// ── Admin only ────────────────────────────────────────────────
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      code:    "FORBIDDEN",
      message: "Admin access required",
    });
  }
  next();
}
