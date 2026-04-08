// ============================================================
// KAI — Complete Background Jobs (Final)
// Path: backend/src/jobs/kai.jobs.ts
// REPLACES the previous kai.jobs.ts
// ============================================================
import { runPulseForAllStores, generateMorningBrief } from "../services/kai.pulse.service";
import { runDailyMarketFetch }                       from "../services/kai.market.service";
import { processReviewRequests }                     from "../services/kai.reviews.service";
import { runPriceDropCheckAll }                      from "../services/kai.pricedrop.service";
import { sendMorningBrief }                          from "../services/whatsapp.service";
import { PrismaClient }                              from "@prisma/client";

const prisma = new PrismaClient();
const apiKey = process.env.ANTHROPIC_API_KEY || "";

function schedule(ms: number, fn: () => Promise<void>, label: string) {
  const run = async () => {
    try { await fn(); }
    catch (err) { console.error(`[Job: ${label}]`, err); }
  };
  run(); // run immediately on startup
  return setInterval(run, ms);
}

if (!apiKey) {
  console.warn("[KAI Jobs] ANTHROPIC_API_KEY not set — AI jobs disabled");
} else {

  // ── KAI Pulse — every 2 hours ──────────────────────────────
  schedule(2 * 60 * 60 * 1000, async () => {
    console.log("[Pulse] Running...");
    await runPulseForAllStores();
  }, "KAI Pulse");

  // ── Market intelligence — daily ────────────────────────────
  schedule(24 * 60 * 60 * 1000, async () => {
    console.log("[Market] Fetching intelligence...");
    await runDailyMarketFetch(apiKey);
  }, "Market Intel");

  // ── Price drop check — daily ───────────────────────────────
  schedule(24 * 60 * 60 * 1000, async () => {
    console.log("[Price Drop] Checking supplier prices...");
    await runPriceDropCheckAll(apiKey);
  }, "Price Drop");

  // ── Review requests — every hour ──────────────────────────
  schedule(60 * 60 * 1000, async () => {
    await processReviewRequests();
  }, "Review Requests");

  // ── Morning brief — every hour, only fires at 7am ─────────
  schedule(60 * 60 * 1000, async () => {
    const hour = new Date().getHours();
    if (hour !== 7) return;

    const stores = await prisma.store.findMany({
      where: { status: "ACTIVE" },
      include: { owner: { select: { phone: true, name: true } } },
      take: 200,
    });

    for (const store of stores) {
      try {
        const brief = await generateMorningBrief(store.id, apiKey);

        // Send via WhatsApp if owner phone + WhatsApp configured
        if (store.owner?.phone) {
          await sendMorningBrief({
            ownerPhone: store.owner.phone,
            storeName: store.name,
            message: brief,
          });
        }
      } catch {}
    }
    console.log(`[Morning Brief] Sent to ${stores.length} stores`);
  }, "Morning Brief");

  console.log("[KAI Jobs] All background jobs started ✅");
}

export {};
