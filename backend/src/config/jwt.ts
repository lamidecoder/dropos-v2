// src/config/jwt.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   string;
  iat?:   number;
  exp?:   number;
}

const JWT_SECRET         = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets must be defined in environment variables");
}

export const signAccessToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  } as SignOptions);
};

export const signRefreshToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new AppError("Token expired", 401);
    throw new AppError("Invalid token", 401);
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new AppError("Refresh token expired", 401);
    throw new AppError("Invalid refresh token", 401);
  }
};

export const setRefreshCookie = (res: any, token: string) => {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh",
  });
};

export const clearRefreshCookie = (res: any) => {
  res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
};
