// ============================================================
// KAI — Background Jobs (Cron)
// Path: backend/src/jobs/kai.jobs.ts
// Add to app.ts: import "./jobs/kai.jobs";
// ============================================================
import { runPulseForAllStores, generateMorningBrief } from "../services/kai.pulse.service";
import { runDailyMarketFetch } from "../services/kai.market.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple cron without external dependency
function schedule(intervalMs: number, fn: () => Promise<void>, label: string) {
  const run = async () => {
    try {
      await fn();
    } catch (err) {
      console.error(`[KAI Job] ${label} error:`, err);
    }
  };
  // Run immediately then on interval
  run();
  return setInterval(run, intervalMs);
}

// Only start jobs if API key is configured
const apiKey = process.env.ANTHROPIC_API_KEY;
if (apiKey) {
  // ── KAI Pulse — every 2 hours ────────────────────────────────
  schedule(2 * 60 * 60 * 1000, async () => {
    console.log("[KAI Pulse] Running store analysis...");
    await runPulseForAllStores();
    console.log("[KAI Pulse] Done");
  }, "KAI Pulse");

  // ── Daily market fetch — every 24 hours ──────────────────────
  schedule(24 * 60 * 60 * 1000, async () => {
    console.log("[KAI Market] Fetching market intelligence...");
    await runDailyMarketFetch(apiKey);
    console.log("[KAI Market] Done");
  }, "KAI Market");

  // ── Morning briefs — every hour, generates for stores at 7am ──
  schedule(60 * 60 * 1000, async () => {
    const hour = new Date().getHours();
    if (hour !== 7) return; // Only at 7am

    const stores = await prisma.store.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    for (const store of stores) {
      try {
        await generateMorningBrief(store.id, apiKey);
      } catch {}
    }
    console.log(`[KAI Morning Brief] Generated for ${stores.length} stores`);
  }, "Morning Brief");

  console.log("[KAI Jobs] Background jobs started");
} else {
  console.warn("[KAI Jobs] ANTHROPIC_API_KEY not set — background jobs disabled");
}

export {};
