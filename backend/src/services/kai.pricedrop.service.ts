// ============================================================
// KAI — Price Drop Alert (Supplier Monitoring)
// Path: backend/src/services/kai.pricedrop.service.ts
// Runs daily. Checks AliExpress prices vs store prices.
// Alerts owner via KAI Pulse when margin improves.
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Check price drops for a store ────────────────────────────
export async function checkPriceDrops(storeId: string, apiKey: string): Promise<void> {
  // Get products with AliExpress source URLs
  const products = await prisma.product.findMany({
    where: {
      storeId,
      isActive: true,
      sourceUrl: { not: null },
    },
    select: {
      id: true,
      name: true,
      price: true,
      costPrice: true, // what owner paid supplier last time
      sourceUrl: true,
      currency: true,
    },
    take: 20, // check 20 products per run to save API calls
  });

  if (!products.length) return;

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { country: true, currency: true },
  });

  // Get current forex
  const cache = await prisma.kaiMarketCache.findUnique({ where: { key: "forex_rates" } }).catch(() => null);
  const rates = (cache?.data as any) || {};
  const exchangeRate = store?.country === "NG" ? (rates.NGN || 1580) : 1;

  // Use Claude with web search to check prices
  for (const product of products) {
    if (!product.sourceUrl || !product.costPrice) continue;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Find the current price of this product on AliExpress: ${product.sourceUrl}
Return ONLY JSON: {"currentPriceUSD": 12.50, "found": true}
If can't find: {"currentPriceUSD": null, "found": false}`,
          }],
        }),
      });

      if (!response.ok) continue;
      const data: any = await response.json();
      const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

      let parsed: any;
      try { parsed = JSON.parse(text.replace(/```json|```/g, "").trim()); }
      catch { continue; }

      if (!parsed.found || !parsed.currentPriceUSD) continue;

      const newCostLocal    = parsed.currentPriceUSD * exchangeRate;
      const oldCostLocal    = Number(product.costPrice);
      const sellingPrice    = Number(product.price);
      const priceDropAmount = oldCostLocal - newCostLocal;
      const marginImprovement = (priceDropAmount / sellingPrice) * 100;

      // Only alert if price dropped by more than 10%
      if (priceDropAmount > 0 && marginImprovement >= 5) {
        const sym = store?.currency === "NGN" ? "₦" : "$";

        // Create KAI Pulse alert
        await prisma.kaiPulseAlert.create({
          data: {
            storeId,
            type: "pricing_opportunity",
            title: `${product.name} — supplier price dropped!`,
            message: `The AliExpress price for "${product.name}" dropped by ${sym}${Math.round(priceDropAmount).toLocaleString()}. Your margin just improved by ${Math.round(marginImprovement)}%. You can either keep the extra profit or lower your price to beat competitors.`,
            severity: "opportunity",
            actionable: true,
            suggestedPrompt: `The supplier price dropped for ${product.name}. Should I keep the extra profit or lower my selling price to compete? Current price: ${sym}${sellingPrice.toLocaleString()}`,
            data: {
              productId: product.id,
              productName: product.name,
              oldCostLocal: Math.round(oldCostLocal),
              newCostLocal: Math.round(newCostLocal),
              priceDropAmount: Math.round(priceDropAmount),
              marginImprovement: Math.round(marginImprovement),
              sellingPrice,
            },
          },
        });

        // Update stored cost price
        await prisma.product.update({
          where: { id: product.id },
          data: { costPrice: newCostLocal },
        });

        console.log(`[Price Drop] ${product.name}: dropped ${sym}${Math.round(priceDropAmount)}`);
      }

      // Rate limit — don't hammer the API
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      console.error(`[Price Drop] Error checking ${product.name}:`, err);
    }
  }
}

// ── Run for all stores (called by daily cron) ─────────────────
export async function runPriceDropCheckAll(apiKey: string): Promise<void> {
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
    take: 50, // process 50 stores per run
  });

  for (const store of stores) {
    await checkPriceDrops(store.id, apiKey);
    await new Promise(r => setTimeout(r, 2000)); // 2s between stores
  }
}
