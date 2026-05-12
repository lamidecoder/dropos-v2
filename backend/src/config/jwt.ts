// src/config/jwt.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   string;
  type?:  string;
  iat?:   number;
  exp?:   number;
}

const JWT_SECRET         = process.env.JWT_SECRET         || "dropos-super-secret-jwt-key-2024-change-this";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dropos-refresh-secret-key-2024-change-this";

// ── Sign access token (15 min) ────────────────────────────────
export const signAccessToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(
    { ...payload, type: "access" },   // ← type field required by auth middleware
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" } as SignOptions
  );
};

// ── Sign refresh token (7 days) ──────────────────────────────
export const signRefreshToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(
    { ...payload, type: "refresh" },  // ← type field for safety
    JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" } as SignOptions
  );
};

// ── Verify access token ───────────────────────────────────────
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new AppError("Token expired", 401);
    throw new AppError("Invalid token", 401);
  }
};

// ── Verify refresh token ──────────────────────────────────────
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new AppError("Refresh token expired", 401);
    throw new AppError("Invalid refresh token", 401);
  }
};

// ── Cookie helpers (not used directly — use session.service) ──
export const setRefreshCookie = (res: any, token: string) => {
  res.cookie("dropos_refresh", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge:   7 * 24 * 60 * 60 * 1000,
    path:     "/api/auth",
  });
};

export const clearRefreshCookie = (res: any) => {
  res.clearCookie("dropos_refresh", { path: "/api/auth" });
};
