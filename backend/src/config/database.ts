// src/config/database.ts
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances in development (hot reload)
export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after  = Date.now();
  if (process.env.NODE_ENV === "development") {
    logger.debug(`Prisma ${params.model}.${params.action} — ${after - before}ms`);
  }
  return result;
});

export default prisma;
