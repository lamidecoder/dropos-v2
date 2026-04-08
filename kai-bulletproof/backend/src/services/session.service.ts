// ============================================================
// Session Service — Database-Backed
// Path: backend/src/services/session.service.ts
//
// Sessions survive server restarts because they're in the DB.
// Refresh tokens in httpOnly cookies (not localStorage).
// Access tokens in memory only (XSS-safe).
// ============================================================
import jwt                from "jsonwebtoken";
import { Response }       from "express";
import prisma             from "../lib/prisma";

const ACCESS_SECRET   = process.env.JWT_SECRET || "dropos-access-secret-change-in-prod";
const REFRESH_SECRET  = process.env.JWT_REFRESH_SECRET || "dropos-refresh-secret-change-in-prod";
const ACCESS_EXPIRY   = "15m";
const REFRESH_EXPIRY  = "30d";
const COOKIE_NAME     = "dropos_refresh";

// ── Generate token pair ───────────────────────────────────────
export function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role, type: "access" },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: "refresh" },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );

  return { accessToken, refreshToken };
}

// ── Save refresh token to DB ──────────────────────────────────
export async function saveRefreshToken(
  userId: string,
  refreshToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.refreshToken.create({
    data: {
      token:     refreshToken,
      userId,
      expiresAt,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
  });

  // Clean up old expired tokens for this user
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
}

// ── Set refresh token as httpOnly cookie ──────────────────────
export function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,              // Not accessible via JS (XSS protection)
    secure:   process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict",          // CSRF protection
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
    path:     "/api/auth",       // Only sent to auth endpoints
  });
}

// ── Clear refresh cookie ──────────────────────────────────────
export function clearRefreshCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/api/auth" });
}

// ── Rotate refresh token ──────────────────────────────────────
export async function rotateRefreshToken(
  oldToken: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ accessToken: string; refreshToken: string; user: any } | null> {

  // Verify the old refresh token
  let decoded: any;
  try {
    decoded = jwt.verify(oldToken, REFRESH_SECRET);
  } catch {
    return null;
  }

  // Check it exists in DB and isn't revoked
  const stored = await prisma.refreshToken.findFirst({
    where: {
      token:     oldToken,
      userId:    decoded.userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) return null;

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data:  { revokedAt: new Date() },
  });

  // Get user
  const user = await prisma.user.findUnique({
    where:   { id: decoded.userId },
    include: {
      subscription: { select: { plan: true, status: true, currentPeriodEnd: true } },
      stores:       { select: { id: true, name: true, slug: true, status: true } },
    },
  });

  if (!user || user.status === "BANNED" || user.status === "SUSPENDED") return null;

  // Issue new token pair
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

  // Save new refresh token
  await saveRefreshToken(user.id, newRefreshToken, ipAddress, userAgent);

  return { accessToken, refreshToken: newRefreshToken, user };
}

// ── Revoke all sessions for a user (logout all devices) ───────
export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where:  { userId, revokedAt: null },
    data:   { revokedAt: new Date() },
  });
}

// ── Verify access token ───────────────────────────────────────
export function verifyAccessToken(token: string): { userId: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as any;
    if (decoded.type !== "access") return null;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}
