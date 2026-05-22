// Path: backend/src/jobs/kai.jobs.ts
// KIRO Autopilot Jobs — morning brief, order notifications, pulse alerts
// Imported in server.ts on startup

import prisma from "../lib/prisma";
import { sendWhatsApp } from "../services/whatsapp.service";
import { emailService } from "../services/email.service";
import { logger } from "../utils/logger";

const fmt = (n: number, cur = "NGN") =>
  new Intl.NumberFormat("en-NG", { style:"currency", currency:cur, maximumFractionDigits:0 }).format(n||0);

function scheduleDaily(hour: number, fn: () => void) {
  const now  = new Date();
  const next = new Date();
  next.setHours(hour, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  setTimeout(() => { fn(); setInterval(fn, 24 * 60 * 60 * 1000); }, delay);
}

// ── Morning Brief — runs at 7:30 AM WAT every day ─────────────────────────────
async function sendMorningBriefs() {
  logger.info("[KIRO Jobs] Sending morning briefs…");
  try {
    const stores = await (prisma as any).store.findMany({
      where: { isActive: true },
      include: {
        owner: { select: { name:true, phone:true, email:true, subscription:true } },
        orders: {
          where: {
            createdAt: { gte: new Date(Date.now() - 24*60*60*1000) },
          },
          select: { total:true, status:true },
        },
      },
    });

    for (const store of stores) {
      try {
        const orders    = store.orders || [];
        const revenue   = orders.reduce((s: number, o: any) => s + (o.total||0), 0);
        const pending   = orders.filter((o: any) => o.status === "PENDING").length;
        const fulfilled = orders.filter((o: any) => o.status === "FULFILLED").length;
        const currency  = store.currency || "NGN";
        const ownerName = store.owner?.name?.split(" ")[0] || "Boss";

        const msg = [
          `🌅 *Good morning, ${ownerName}!*`,
          `Here's your KIRO daily brief for *${store.name}*:`,
          ``,
          `📦 *Yesterday's Summary*`,
          `• Revenue: ${fmt(revenue, currency)}`,
          `• Total Orders: ${orders.length}`,
          `• Pending: ${pending} orders need action`,
          `• Fulfilled: ${fulfilled} orders`,
          ``,
          pending > 0
            ? `⚠️ *Action needed:* You have ${pending} pending order${pending>1?"s":""} waiting. Login to process them.`
            : `✅ All orders are up to date!`,
          ``,
          `🔗 Dashboard: https://droposhq.com/dashboard`,
          ``,
          `_Powered by KIRO — Built by Darkweb & DropOS_`,
        ].join("\n");

        // Send WhatsApp if phone available
        if (store.owner?.phone) {
          await sendWhatsApp({ to: store.owner.phone, message: msg });
        }

        // Send email brief
        if (store.owner?.email) {
          await emailService.send({
            to:      store.owner.email,
            subject: `☀️ Your KIRO Morning Brief — ${store.name}`,
            html: `
              <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
                <div style="background:linear-gradient(135deg,#6B35E8,#4C1D95);borderRadius:16px;padding:24px;marginBottom:24px;color:#fff;">
                  <h1 style="margin:0 0 4px;fontSize:22px;fontWeight:900">Good morning, ${ownerName}! ☀️</h1>
                  <p style="margin:0;opacity:.75;fontSize:13px">Your daily KIRO brief</p>
                </div>
                <div style="background:#F9F8FF;borderRadius:12px;padding:20px;marginBottom:16px;">
                  <h3 style="margin:0 0 12px;fontSize:14px;color:#666;textTransform:uppercase;letterSpacing:.06em">Yesterday</h3>
                  <div style="display:flex;gap:16px;">
                    ${[
                      ["Revenue", fmt(revenue,currency)],
                      ["Orders",  orders.length.toString()],
                      ["Pending", pending.toString()],
                    ].map(([l,v])=>`<div style="flex:1;background:#fff;borderRadius:10px;padding:12px;textAlign:center"><p style="fontSize:11px;color:#999;margin:0 0 4px">${l}</p><p style="fontSize:20px;fontWeight:900;color:#6B35E8;margin:0">${v}</p></div>`).join("")}
                  </div>
                </div>
                ${pending > 0 ? `<div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);borderRadius:12px;padding:16px;marginBottom:16px;"><p style="margin:0;fontSize:13px;color:#92400E;fontWeight:600">⚠️ ${pending} order${pending>1?"s":""} need your attention</p></div>` : `<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);borderRadius:12px;padding:16px;marginBottom:16px;"><p style="margin:0;fontSize:13px;color:#065F46;fontWeight:600">✅ All orders are up to date!</p></div>`}
                <a href="https://droposhq.com/dashboard" style="display:block;background:linear-gradient(135deg,#6B35E8,#4C1D95);color:#fff;textDecoration:none;textAlign:center;padding:14px;borderRadius:12px;fontWeight:700;fontSize:14px">Open Dashboard →</a>
                <p style="textAlign:center;fontSize:11px;color:#aaa;marginTop:16px">KIRO · Built by Darkweb & DropOS</p>
              </div>
            `,
          });
        }
      } catch (err: any) {
        logger.error(`[KIRO Jobs] Brief failed for store ${store.id}:`, err.message);
      }
    }
    logger.info(`[KIRO Jobs] Morning briefs sent to ${stores.length} stores`);
  } catch (err: any) {
    logger.error("[KIRO Jobs] Morning brief batch failed:", err.message);
  }
}

// ── Order Notifications — called directly when order is placed ────────────────
export async function notifyNewOrder(order: {
  id: string; orderNumber: string | number; total: number;
  customerName: string; storeId: string; items?: any[];
}) {
  try {
    const store = await (prisma as any).store.findUnique({
      where:   { id: order.storeId },
      include: { owner: { select: { name:true, phone:true, email:true } } },
    });
    if (!store) return;

    const currency = store.currency || "NGN";
    const items    = order.items || [];
    const itemList = items.slice(0,3).map((i:any) => `• ${i.name} × ${i.quantity}`).join("\n");

    const msg = [
      `🛍️ *New Order!* #${order.orderNumber}`,
      ``,
      `👤 Customer: ${order.customerName}`,
      `💰 Total: ${fmt(order.total, currency)}`,
      items.length > 0 ? `\n📦 Items:\n${itemList}${items.length>3?`\n...and ${items.length-3} more`:""}` : "",
      ``,
      `👉 Fulfill now: https://droposhq.com/dashboard/orders`,
    ].filter(Boolean).join("\n");

    if (store.owner?.phone) {
      await sendWhatsApp({ to: store.owner.phone, message: msg });
    }
    if (store.owner?.email) {
      await emailService.send({
        to:      store.owner.email,
        subject: `🛍️ New Order #${order.orderNumber} — ${fmt(order.total, currency)}`,
        html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
          <h2 style="color:#6B35E8;margin:0 0 16px">New Order #${order.orderNumber}</h2>
          <p style="color:#333;font-size:14px;margin:0 0 8px">Customer: <strong>${order.customerName}</strong></p>
          <p style="color:#333;font-size:14px;margin:0 0 16px">Total: <strong style="color:#6B35E8">${fmt(order.total,currency)}</strong></p>
          <a href="https://droposhq.com/dashboard/orders" style="display:inline-block;background:#6B35E8;color:#fff;textDecoration:none;padding:12px 24px;borderRadius:10px;fontWeight:700;font-size:14px">View Order →</a>
        </div>`,
      });
    }
  } catch (err: any) {
    logger.error("[KIRO Jobs] Order notification failed:", err.message);
  }
}

// ── Pulse alerts — weekly store health check ─────────────────────────────────
async function sendPulseAlerts() {
  logger.info("[KIRO Jobs] Sending weekly pulse alerts…");
  try {
    const stores = await (prisma as any).store.findMany({
      where: { isActive: true },
      include: {
        owner: { select: { phone:true, email:true, name:true } },
        products: { select: { inventory:true, name:true }, where: { inventory: { lte: 3 } }, take: 5 },
        orders: {
          where: { createdAt: { gte: new Date(Date.now() - 7*24*60*60*1000) } },
          select: { total:true },
        },
      },
    });

    for (const store of stores) {
      const lowStock = store.products || [];
      if (lowStock.length === 0) continue;

      const msg = [
        `📊 *Weekly Pulse — ${store.name}*`,
        ``,
        `⚠️ *Low Stock Alert:*`,
        ...lowStock.map((p:any) => `• ${p.name}: only ${p.inventory} left`),
        ``,
        `Restock before you lose sales!`,
        `👉 https://droposhq.com/dashboard/products`,
      ].join("\n");

      if (store.owner?.phone) await sendWhatsApp({ to: store.owner.phone, message: msg });
    }
  } catch (err: any) {
    logger.error("[KIRO Jobs] Pulse alert failed:", err.message);
  }
}

// ── Schedule all jobs ─────────────────────────────────────────────────────────
scheduleDaily(7,  sendMorningBriefs);  // 7 AM daily
scheduleDaily(18, sendPulseAlerts);    // 6 PM weekly (runs daily but only alerts on low stock)

logger.info("[KIRO Jobs] Autopilot jobs scheduled: morning brief @ 7AM, pulse @ 6PM");
