// ============================================================
// Prisma Singleton — REPLACES all `new PrismaClient()` calls
// Path: backend/src/lib/prisma.ts
//
// CRITICAL: Import from here everywhere, not PrismaClient directly
// import prisma from "../lib/prisma";
// ============================================================
import { PrismaClient } from "@prisma/client";

// Global singleton — prevents connection exhaustion in dev/prod
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ── Auto-reconnect on connection loss ────────────────────────
async function connectWithRetry(attempts = 3): Promise<void> {
  for (let i = 0; i < attempts; i++) {
    try {
      await prisma.$connect();
      console.log("[DB] Connected");
      return;
    } catch (err) {
      if (i === attempts - 1) throw err;
      console.warn(`[DB] Connection attempt ${i + 1} failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

// ── Keep connection alive ─────────────────────────────────────
// Ping DB every 5 minutes to prevent idle disconnection
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      console.warn("[DB] Keepalive failed — reconnecting...");
      try { await prisma.$connect(); } catch {}
    }
  }, 5 * 60 * 1000);
}

// ── Graceful shutdown ─────────────────────────────────────────
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
export { connectWithRetry };
