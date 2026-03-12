// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../config/jwt";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";

export interface AuthRequest extends Request {
  user?: JwtPayload & { dbUser?: any };
}

// Authenticate any valid JWT
export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("No token provided", 401);
  }
  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token);

  // Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, status: true, name: true },
  });

  if (!user) throw new AppError("User not found", 401);
  if (user.status === "SUSPENDED") throw new AppError("Account suspended", 403);
  if (user.status === "BANNED") throw new AppError("Account banned", 403);

  req.user = { ...payload, dbUser: user };
  next();
};

// Restrict to specific roles
export const authorize = (...roles: string[]) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError("Not authenticated", 401);
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };

// Must be super admin
export const requireAdmin = authorize("SUPER_ADMIN");

// Must be store owner or admin
export const requireOwner = authorize("STORE_OWNER", "SUPER_ADMIN");

// Optional auth — doesn't fail if no token
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const token = header.split(" ")[1];
      req.user = verifyAccessToken(token);
    } catch {}
  }
  next();
};
