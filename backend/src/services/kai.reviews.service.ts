// ============================================================
// KAI — Review Request Automation
// Path: backend/src/services/kai.reviews.service.ts
// Triggered: 5 days after order status = DELIVERED
// ============================================================
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Send review request to customer ──────────────────────────
export async function sendReviewRequest(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        store: { select: { id: true, name: true, slug: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
    });

    if (!order || !order.customer) return;

    // Check not already sent
    const alreadySent = await prisma.reviewRequest.findFirst({
      where: { orderId, customerId: order.customer.id },
    });
    if (alreadySent) return;

    const firstName    = order.customer.name?.split(" ")[0] || "there";
    const productName  = order.items[0]?.product?.name || "your recent purchase";
    const storeName    = order.store.name;
    const reviewUrl    = `https://${order.store.slug}.droposHQ.com/review/${orderId}`;

    // Save review request record
    await prisma.reviewRequest.create({
      data: {
        orderId,
        customerId: order.customer.id,
        storeId: order.store.id,
      },
    });

    // Send email via Resend
    await sendReviewEmail({
      to: order.customer.email,
      customerName: firstName,
      productName,
      storeName,
      reviewUrl,
    });

    console.log(`[Review Request] Sent to ${order.customer.email} for order ${orderId}`);
  } catch (err) {
    console.error("[Review Request] Error:", err);
  }
}

// ── Email sending ─────────────────────────────────────────────
async function sendReviewEmail(params: {
  to: string;
  customerName: string;
  productName: string;
  storeName: string;
  reviewUrl: string;
}): Promise<void> {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${params.storeName} <noreply@droposHQ.com>`,
      to: [params.to],
      subject: `How was your ${params.productName}? ⭐`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Hi ${params.customerName} 👋</h2>
          <p style="color: #444; line-height: 1.6;">
            How are you enjoying your <strong>${params.productName}</strong>?
            We'd love to hear what you think — it only takes 30 seconds.
          </p>
          <a href="${params.reviewUrl}" 
             style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #7c3aed; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
            ⭐ Leave a Quick Review
          </a>
          <p style="color: #888; font-size: 13px;">
            Your feedback helps other customers and means a lot to our small business.
          </p>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            — The ${params.storeName} Team
          </p>
        </div>
      `,
    }),
  });
}

// ── Schedule check — runs every hour via cron ─────────────────
// Called from kai.jobs.ts
export async function processReviewRequests(): Promise<void> {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const sixDaysAgo  = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);

  // Find orders delivered 5-6 days ago, no review request sent yet
  const eligibleOrders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      updatedAt: { gte: sixDaysAgo, lte: fiveDaysAgo },
      reviewRequests: { none: {} },
    },
    select: { id: true },
    take: 50,
  });

  for (const order of eligibleOrders) {
    await sendReviewRequest(order.id);
    // Small delay to avoid Resend rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  if (eligibleOrders.length > 0) {
    console.log(`[Review Requests] Processed ${eligibleOrders.length} orders`);
  }
}
