// ============================================================
// KAI Jobs — Complete Autopilot Schedule
// Path: backend/src/jobs/kai.jobs.ts
// REPLACES all previous versions
// ============================================================
import { PrismaClient }              from "@prisma/client";
import { runPulseForAllStores }      from "../services/kai.pulse.service";
import { runDailyMarketFetch }       from "../services/kai.market.service";
import { processReviewRequests }     from "../services/kai.reviews.service";
import { runPriceDropCheckAll }      from "../services/kai.pricedrop.service";
import { evaluateProfitRules }       from "../services/kai.intelligence.service";
import {
  syncAndNotifyTracking,
  syncSupplierStock,
} from "../services/kai.autopilot.service";

const prisma = new PrismaClient();
const apiKey = process.env.ANTHROPIC_API_KEY || "";

function schedule(ms: number, fn: () => Promise<void>, label: string) {
  const run = async () => {
    try {
      await fn();
    } catch (err) {
      console.error(`[Job: ${label}]`, err);
    }
  };
  // Small random offset per job so they don't all hit at once
  const offset = Math.floor(Math.random() * 60000);
  setTimeout(() => {
    run();
    setInterval(run, ms);
  }, offset);
}

async function getAllActiveStores(limit = 100) {
  return prisma.store.findMany({
    where:  { status: "ACTIVE" },
    select: { id: true, country: true },
    take:   limit,
  });
}

async function getStoresWithCJ(limit = 100) {
  return prisma.store.findMany({
    where: {
      status:       "ACTIVE",
      integrations: { some: { provider: "cjdropshipping", isActive: true } },
    },
    select: { id: true, country: true },
    take:   limit,
  });
}

if (!apiKey) {
  console.warn("[KAI Jobs] ANTHROPIC_API_KEY not set — AI jobs disabled");
} else {

  // ══════════════════════════════════════════════════════════
  // EVERY 15 MINUTES — Auto-fulfill new paid orders
  // Most important job — keeps sellers hands-free
  // ══════════════════════════════════════════════════════════
  schedule(15 * 60 * 1000, async () => {
    const { autoFulfillPendingOrders } = await import("../services/kai.autopilot.service");
    const stores = await getStoresWithCJ();
    for (const store of stores) {
      await autoFulfillPendingOrders(store.id);
      await new Promise(r => setTimeout(r, 1000));
    }
  }, "Auto Fulfillment");

  // ══════════════════════════════════════════════════════════
  // EVERY 2 HOURS — Sync tracking numbers + notify customers
  // ══════════════════════════════════════════════════════════
  schedule(2 * 60 * 60 * 1000, async () => {
    const stores = await getStoresWithCJ();
    let totalNotified = 0;
    for (const store of stores) {
      const n = await syncAndNotifyTracking(store.id);
      totalNotified += n;
      await new Promise(r => setTimeout(r, 500));
    }
    if (totalNotified > 0) {
      console.log(`[Tracking Sync] Notified ${totalNotified} customers`);
    }
  }, "Tracking + Customer Notify");

  // ══════════════════════════════════════════════════════════
  // EVERY 2 HOURS — KAI Pulse (store health monitoring)
  // ══════════════════════════════════════════════════════════
  schedule(2 * 60 * 60 * 1000, async () => {
    await runPulseForAllStores();
  }, "KAI Pulse");

  // ══════════════════════════════════════════════════════════
  // EVERY 6 HOURS — Supplier stock + price sync
  // Hides out-of-stock, adjusts prices to protect margins
  // ══════════════════════════════════════════════════════════
  schedule(6 * 60 * 60 * 1000, async () => {
    const stores = await getStoresWithCJ(50);
    for (const store of stores) {
      await syncSupplierStock(store.id);
      await new Promise(r => setTimeout(r, 2000));
    }
  }, "Supplier Stock Sync");

  // ══════════════════════════════════════════════════════════
  // EVERY 6 HOURS — Profit protection rules
  // Auto-hides products, adjusts prices per seller's rules
  // ══════════════════════════════════════════════════════════
  schedule(6 * 60 * 60 * 1000, async () => {
    const stores = await getAllActiveStores();
    for (const store of stores) {
      await evaluateProfitRules(store.id);
      await new Promise(r => setTimeout(r, 500));
    }
  }, "Profit Rules");

  // ══════════════════════════════════════════════════════════
  // EVERY HOUR — Review request emails (5 days post-delivery)
  // ══════════════════════════════════════════════════════════
  schedule(60 * 60 * 1000, async () => {
    await processReviewRequests();
  }, "Review Requests");

  // ══════════════════════════════════════════════════════════
  // DAILY — Market intelligence per country
  // Fetches trending products for each country
  // ══════════════════════════════════════════════════════════
  schedule(24 * 60 * 60 * 1000, async () => {
    await runDailyMarketFetch(apiKey);
  }, "Market Intelligence");

  // ══════════════════════════════════════════════════════════
  // DAILY — Price drop alerts (compares to supplier)
  // ══════════════════════════════════════════════════════════
  schedule(24 * 60 * 60 * 1000, async () => {
    await runPriceDropCheckAll(apiKey);
  }, "Price Drop Alerts");

  // ══════════════════════════════════════════════════════════
  // 7AM DAILY — Morning brief generation
  // ══════════════════════════════════════════════════════════
  schedule(60 * 60 * 1000, async () => {
    const hour = new Date().getHours();
    if (hour !== 7) return;

    const { generateMorningBrief } = await import("../services/kai.pulse.service");
    const { sendMorningBrief }     = await import("../services/whatsapp.service");

    const stores = await prisma.store.findMany({
      where:   { status: "ACTIVE" },
      include: { owner: { select: { phone: true, name: true } } },
      take:    200,
    });

    for (const store of stores) {
      try {
        const brief = await generateMorningBrief(store.id, apiKey);
        if (store.owner?.phone) {
          await sendMorningBrief({
            ownerPhone: store.owner.phone,
            storeName:  store.name,
            message:    brief,
          });
        }
      } catch {}
    }
    console.log(`[Morning Brief] Generated for ${stores.length} stores`);
  }, "Morning Brief");

  console.log(`
╔════════════════════════════════════════╗
║   KAI Autopilot — All Jobs Active     ║
╠════════════════════════════════════════╣
║  Every 15 min  — Auto-fulfillment     ║
║  Every 2 hrs   — Tracking + notify   ║
║  Every 2 hrs   — KAI Pulse           ║
║  Every 6 hrs   — Supplier sync       ║
║  Every 6 hrs   — Profit rules        ║
║  Every hour    — Review requests     ║
║  Daily         — Market intel        ║
║  Daily         — Price drop alerts   ║
║  7am daily     — Morning brief       ║
╚════════════════════════════════════════╝
  `);
}

export {};
