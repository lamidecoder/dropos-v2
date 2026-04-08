// ============================================================
// KAI Supplier Autopilot
// Path: backend/src/services/kai.autopilot.service.ts
//
// THE FULL AUTOMATION LOOP:
//
// 1. Order placed → CJ/Supplier notified automatically
// 2. Supplier ships → tracking flows back automatically
// 3. Customer gets tracking via WhatsApp + Email
// 4. Supplier stock drops → store updates + seller alerted
// 5. Supplier raises price → margin protected automatically
// 6. Stock hits zero → product hidden automatically
// 7. Morning brief includes all overnight activity
//
// Seller just focuses on marketing.
// Everything else: autopilot.
// ============================================================
import prisma           from "../lib/prisma";
import { getLocale }    from "../utils/kai.locale";
import { sendWhatsApp } from "./whatsapp.service";

// ═══════════════════════════════════════════════════════════════
// STEP 1 — ORDER PLACED → NOTIFY SUPPLIER AUTOMATICALLY
// ═══════════════════════════════════════════════════════════════
export async function onOrderPaid(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where:   { id: orderId },
    include: {
      store:    { include: { integrations: true } },
      customer: true,
      items:    { include: { product: true } },
    },
  });

  if (!order || order.status !== "PAID") return;

  const cjIntegration = order.store.integrations?.find(i => i.provider === "cjdropshipping" && i.isActive);
  const locale        = getLocale(order.store.country || "NG");

  // Categorise items by supplier
  const cjItems = order.items.filter(i =>
    i.product.sourceUrl?.includes("cjdropshipping") ||
    (i.product.metadata as any)?.supplier === "cj"
  );

  const manualItems = order.items.filter(i => !cjItems.includes(i));

  // ── Auto-fulfill CJ items ───────────────────────────────────
  if (cjItems.length > 0 && cjIntegration) {
    await fulfillViaCJ({
      order,
      items:   cjItems,
      locale,
      apiKey:  cjIntegration.accessToken,
      email:   cjIntegration.email!,
      password: cjIntegration.password!,
    });
  }

  // ── Alert seller about manual items ────────────────────────
  if (manualItems.length > 0) {
    const sym = locale.currencySymbol;
    await prisma.kaiPulseAlert.create({
      data: {
        storeId:    order.storeId,
        type:       "new_order_manual",
        severity:   "info",
        title:      `New order needs your attention`,
        message:    `Order #${orderId.slice(-8).toUpperCase()} — ${sym}${Number(order.total).toLocaleString()} — ${manualItems.length} item(s) need manual fulfillment:\n${manualItems.map(i => `• ${i.product.name} × ${i.quantity}`).join("\n")}`,
        actionable: true,
        suggestedPrompt: `Help me fulfill order #${orderId.slice(-8).toUpperCase()}`,
        data:       { orderId, manualItems: manualItems.map(i => ({ name: i.product.name, qty: i.quantity, sourceUrl: i.product.sourceUrl })) } as any,
      },
    }).catch(() => {});
  }

  // ── Send order confirmation to customer ─────────────────────
  await sendOrderConfirmationToCustomer(order, locale);
}

// ── Actually place the CJ order ──────────────────────────────
async function fulfillViaCJ(params: {
  order:    any;
  items:    any[];
  locale:   any;
  apiKey:   string;
  email:    string;
  password: string;
}): Promise<void> {
  const { order, items, locale } = params;

  try {
    // Get CJ token
    const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email: params.email, password: params.password }),
    });

    const authData: any = await authRes.json();
    if (!authData.data?.accessToken) throw new Error("CJ auth failed");
    const token = authData.data.accessToken;

    // Place the order
    const customer = order.customer;
    const orderPayload = {
      orderNumber:           order.id,
      shippingCountryCode:   customer.country || "NG",
      shippingCountry:       customer.country || "Nigeria",
      shippingProvince:      customer.state   || "",
      shippingCity:          customer.city    || "",
      shippingAddress:       customer.address || "",
      shippingCustomerName:  customer.name    || "",
      shippingPhone:         customer.phone   || "",
      shippingZip:           customer.zip     || "100001",
      remark:                `DropOS Order — Store: ${order.store.name}`,
      products: items.map(item => ({
        vid:          (item.product.metadata as any)?.cjVariantId || extractCJId(item.product.sourceUrl),
        quantity:     item.quantity,
        shippingName: "CJPacket Ordinary",
      })),
    };

    const orderRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2", {
      method:  "POST",
      headers: { "CJ-Access-Token": token, "Content-Type": "application/json" },
      body:    JSON.stringify(orderPayload),
    });

    const orderData: any = await orderRes.json();

    if (orderData.code === 200 && orderData.data?.orderId) {
      // Update DropOS order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: "FULFILLED",
          status:            "PROCESSING",
          cjOrderId:         orderData.data.orderId,
          fulfilledAt:       new Date(),
        } as any,
      });

      // Alert seller silently — no action needed
      await prisma.kaiPulseAlert.create({
        data: {
          storeId:    order.storeId,
          type:       "auto_fulfilled",
          severity:   "success",
          title:      `Order auto-fulfilled ✅`,
          message:    `Order #${order.id.slice(-8).toUpperCase()} (${locale.currencySymbol}${Number(order.total).toLocaleString()}) was automatically sent to CJDropshipping. Tracking will arrive in 24–48 hours.`,
          actionable: false,
          data:       { orderId: order.id, cjOrderId: orderData.data.orderId } as any,
        },
      }).catch(() => {});

    } else {
      // Auto-fulfill failed — alert seller to do it manually
      await prisma.kaiPulseAlert.create({
        data: {
          storeId:    order.storeId,
          type:       "fulfillment_failed",
          severity:   "critical",
          title:      `⚠️ Order needs manual fulfillment`,
          message:    `Auto-fulfillment failed for order #${order.id.slice(-8).toUpperCase()}. Reason: ${orderData.message || "CJ error"}. Please fulfill this order manually.`,
          actionable: true,
          suggestedPrompt: `Help me manually fulfill order #${order.id.slice(-8).toUpperCase()}`,
          data:       { orderId: order.id, error: orderData.message } as any,
        },
      }).catch(() => {});
    }
  } catch (err: any) {
    await prisma.kaiPulseAlert.create({
      data: {
        storeId:    order.storeId,
        type:       "fulfillment_error",
        severity:   "critical",
        title:      `⚠️ Auto-fulfillment error`,
        message:    `Could not auto-fulfill order #${order.id.slice(-8).toUpperCase()}. Error: ${err.message}. Please check your CJ connection and fulfill manually.`,
        actionable: true,
        data:       { orderId: order.id } as any,
      },
    }).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — ORDER SHIPPED → TRACKING TO CUSTOMER AUTOMATICALLY
// ═══════════════════════════════════════════════════════════════
export async function syncAndNotifyTracking(storeId: string): Promise<number> {
  const store = await prisma.store.findUnique({
    where:   { id: storeId },
    include: { integrations: true, owner: { select: { phone: true } } },
  });

  const cjIntegration = store?.integrations?.find(i => i.provider === "cjdropshipping" && i.isActive);
  if (!cjIntegration) return 0;

  // Get CJ token
  const authRes = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email: cjIntegration.email, password: cjIntegration.password }),
  });
  const authData: any = await authRes.json();
  if (!authData.data?.accessToken) return 0;
  const token = authData.data.accessToken;

  // Find orders that are fulfilled but no tracking yet
  const orders = await prisma.order.findMany({
    where: {
      storeId,
      fulfillmentStatus: "FULFILLED",
      trackingNumber: null,
      cjOrderId:      { not: null },
    } as any,
    include: { customer: { select: { name: true, email: true, phone: true } } },
    take: 30,
  });

  let notified = 0;
  const locale = getLocale(store?.country || "NG");

  for (const order of orders) {
    try {
      const cjOrderId = (order as any).cjOrderId;
      const res = await fetch(`https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=${cjOrderId}`, {
        headers: { "CJ-Access-Token": token },
      });

      const data: any = await res.json();
      const cjOrder   = data.data;

      if (!cjOrder?.trackNumber) continue; // Not shipped yet

      const trackingNumber = cjOrder.trackNumber;
      const carrier        = cjOrder.logisticName || "CJPacket";
      const trackingUrl    = `https://t.17track.net/en#nums=${trackingNumber}`;

      // Update order
      await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingNumber,
          carrier,
          status:    "SHIPPED",
          shippedAt: new Date(),
        } as any,
      });

      // Notify customer via WhatsApp
      if (order.customer?.phone) {
        const firstName = order.customer.name?.split(" ")[0] || "there";
        await sendWhatsApp({
          to:      order.customer.phone,
          message: `Hi ${firstName}! 📦 Your order from ${store?.name} has shipped!\n\nTracking: ${trackingNumber}\nCarrier: ${carrier}\nTrack here: ${trackingUrl}\n\nEstimated delivery: 7–14 days.\n\nThank you for shopping with us! 🙏`,
        }).catch(() => {});
      }

      // Notify customer via email
      await sendTrackingEmail({
        to:           order.customer?.email || "",
        customerName: order.customer?.name || "Customer",
        storeName:    store?.name || "Store",
        orderId:      order.id,
        trackingNumber,
        carrier,
        trackingUrl,
      }).catch(() => {});

      notified++;
      await new Promise(r => setTimeout(r, 300));
    } catch {}
  }

  if (notified > 0) {
    await prisma.kaiPulseAlert.create({
      data: {
        storeId,
        type:       "tracking_synced",
        severity:   "success",
        title:      `${notified} tracking numbers synced`,
        message:    `${notified} customers received their tracking numbers automatically via WhatsApp and email.`,
        actionable: false,
        data:       { notified } as any,
      },
    }).catch(() => {});
  }

  return notified;
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — SUPPLIER STOCK CHANGES → STORE UPDATES AUTOMATICALLY
// ═══════════════════════════════════════════════════════════════
export async function syncSupplierStock(storeId: string): Promise<{
  updated: number; hidden: number; alerts: string[];
}> {
  const store = await prisma.store.findUnique({
    where:   { id: storeId },
    include: { integrations: true },
    select: { country: true, name: true, integrations: true } as any,
  });

  const locale  = getLocale((store as any)?.country || "NG");
  const apiKey  = process.env.ANTHROPIC_API_KEY || "";
  const updated = 0;
  let hidden    = 0;
  const alerts: string[] = [];

  if (!apiKey) return { updated, hidden, alerts };

  // Get products with CJ source URLs
  const products = await prisma.product.findMany({
    where: {
      storeId, isActive: true,
      sourceUrl: { contains: "cjdropshipping" },
    },
    select: { id: true, name: true, price: true, costPrice: true, stockQuantity: true, sourceUrl: true },
    take: 20,
  });

  for (const product of products) {
    if (!product.sourceUrl) continue;

    try {
      // Use KAI to check CJ product status
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Check if this CJDropshipping product is in stock and get current price: ${product.sourceUrl}
Return ONLY JSON: {"inStock": true, "stockLevel": "high", "currentPriceUSD": 5.99, "found": true}
If cannot verify: {"inStock": null, "found": false}`,
          }],
        }),
      });

      if (!res.ok) continue;
      const data: any = await res.json();
      const text = data.content?.find((b: any) => b.type === "text")?.text || "{}";

      let info: any;
      try { info = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch { continue; }
      if (!info.found) continue;

      const newCostLocal = info.currentPriceUSD ? Math.round(info.currentPriceUSD * locale.exchangeRateToUSD) : null;
      const oldCost      = Number(product.costPrice || 0);

      // Handle out of stock
      if (info.inStock === false) {
        await prisma.product.update({ where: { id: product.id }, data: { isActive: false, stockQuantity: 0 } });
        hidden++;
        alerts.push(`"${product.name}" went out of stock at supplier — hidden from your store automatically`);
      }

      // Handle price increase >10%
      if (newCostLocal && oldCost > 0 && newCostLocal > oldCost * 1.1) {
        const changePct = Math.round(((newCostLocal - oldCost) / oldCost) * 100);
        const newPrice  = Math.round(Number(product.price) * (1 + changePct / 100));

        await prisma.product.update({
          where: { id: product.id },
          data:  { costPrice: newCostLocal, price: newPrice },
        });

        alerts.push(`"${product.name}" supplier cost increased ${changePct}% — your selling price auto-adjusted to protect margin`);
      }

      // Handle price drop >10%
      if (newCostLocal && oldCost > 0 && newCostLocal < oldCost * 0.9) {
        const savingPerUnit = oldCost - newCostLocal;
        await prisma.product.update({ where: { id: product.id }, data: { costPrice: newCostLocal } });
        alerts.push(`"${product.name}" supplier price dropped — you're now making ${locale.currencySymbol}${savingPerUnit.toLocaleString()} extra per sale`);
      }

      await new Promise(r => setTimeout(r, 1500));
    } catch {}
  }

  // Create one consolidated alert instead of spamming
  if (alerts.length > 0) {
    await prisma.kaiPulseAlert.create({
      data: {
        storeId,
        type:       "supplier_sync",
        severity:   hidden > 0 ? "warning" : "info",
        title:      `Supplier sync: ${alerts.length} update${alerts.length > 1 ? "s" : ""}`,
        message:    alerts.join("\n"),
        actionable: hidden > 0,
        data:       { alerts, hidden } as any,
      },
    }).catch(() => {});
  }

  return { updated: products.length, hidden, alerts };
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 — ORDER DELIVERED → REQUEST REVIEW AUTOMATICALLY
// ═══════════════════════════════════════════════════════════════
export async function onOrderDelivered(orderId: string): Promise<void> {
  // Schedule review request for 5 days later
  // The review job in kai.reviews.service.ts picks this up
  await prisma.order.update({
    where: { id: orderId },
    data:  { deliveredAt: new Date() } as any,
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 — ORDER CONFIRMATION TO CUSTOMER
// ═══════════════════════════════════════════════════════════════
async function sendOrderConfirmationToCustomer(order: any, locale: any): Promise<void> {
  const firstName = order.customer?.name?.split(" ")[0] || "there";
  const sym       = locale.currencySymbol;
  const itemList  = order.items.map((i: any) => `• ${i.product.name} × ${i.quantity}`).join("\n");

  // WhatsApp confirmation
  if (order.customer?.phone) {
    await sendWhatsApp({
      to:      order.customer.phone,
      message: `Hi ${firstName}! ✅ Your order from ${order.store.name} is confirmed!\n\nOrder: #${order.id.slice(-8).toUpperCase()}\n${itemList}\nTotal: ${sym}${Number(order.total).toLocaleString()}\n\nWe'll send your tracking number as soon as it ships. 📦`,
    }).catch(() => {});
  }

  // Email confirmation
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && order.customer?.email) {
    await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body:    JSON.stringify({
        from:    `${order.store.name} <noreply@droposHQ.com>`,
        to:      [order.customer.email],
        subject: `Order confirmed — #${order.id.slice(-8).toUpperCase()}`,
        html:    `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2>Order Confirmed ✅</h2>
            <p>Hi ${firstName},</p>
            <p>Your order from <strong>${order.store.name}</strong> is confirmed!</p>
            <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
              <p><strong>Order:</strong> #${order.id.slice(-8).toUpperCase()}</p>
              <p><strong>Items:</strong><br>${itemList.replace(/\n/g, "<br>")}</p>
              <p><strong>Total:</strong> ${sym}${Number(order.total).toLocaleString()}</p>
            </div>
            <p>We'll email and WhatsApp you your tracking number as soon as it ships.</p>
            <p>Thank you for shopping with us! 🙏</p>
          </div>
        `,
      }),
    }).catch(() => {});
  }
}

async function sendTrackingEmail(params: {
  to: string; customerName: string; storeName: string;
  orderId: string; trackingNumber: string; carrier: string; trackingUrl: string;
}): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !params.to) return;

  await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body:    JSON.stringify({
      from:    `${params.storeName} <noreply@droposHQ.com>`,
      to:      [params.to],
      subject: `Your order has shipped! 📦 Track it here`,
      html:    `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
          <h2>Your order has shipped! 📦</h2>
          <p>Hi ${params.customerName.split(" ")[0]},</p>
          <p>Great news — your order from <strong>${params.storeName}</strong> is on its way!</p>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin:16px 0">
            <p><strong>Tracking Number:</strong> ${params.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${params.carrier}</p>
          </div>
          <a href="${params.trackingUrl}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;border-radius:8px;text-decoration:none;font-weight:600">
            📍 Track My Order
          </a>
          <p style="margin-top:16px;color:#888;font-size:13px">Estimated delivery: 7–14 days from ship date.</p>
        </div>
      `,
    }),
  }).catch(() => {});
}

function extractCJId(url: string): string {
  const match = url?.match(/vid=([^&]+)/) || url?.match(/\/p\/([a-zA-Z0-9-]+)/);
  return match?.[1] || "";
}
