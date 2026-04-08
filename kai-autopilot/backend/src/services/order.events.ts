// ============================================================
// Order Event Hooks
// Path: backend/src/services/order.events.ts
//
// Add these calls to your existing order controller
// wherever order status changes
// ============================================================
import { onOrderPaid, onOrderDelivered } from "./kai.autopilot.service";
import { awardPoints }                   from "./loyalty.service";

// ── Call this when Paystack webhook confirms payment ──────────
// In your webhook handler / order payment confirmation:
export async function handleOrderPaid(orderId: string): Promise<void> {
  // Fire these in parallel — don't await (non-blocking)
  Promise.allSettled([
    onOrderPaid(orderId),     // → auto-fulfills with CJ, notifies customer
    awardPoints(orderId),     // → awards loyalty points
  ]).catch(err => console.error("[Order Events]", err));
}

// ── Call this when order status becomes DELIVERED ─────────────
// In your order status update controller:
export async function handleOrderDelivered(orderId: string): Promise<void> {
  await onOrderDelivered(orderId); // → schedules review request for 5 days later
}

// ══════════════════════════════════════════════════════════════
// HOW TO ADD TO YOUR EXISTING ORDER CONTROLLER:
//
// In backend/src/controllers/order.controller.ts
//
// Import:
// import { handleOrderPaid, handleOrderDelivered } from "../services/order.events";
//
// In your Paystack webhook handler (after verifying payment):
//   await handleOrderPaid(order.id);
//
// In your order status update endpoint (when status = DELIVERED):
//   await handleOrderDelivered(orderId);
//
// That's it. Everything else runs automatically.
// ══════════════════════════════════════════════════════════════
