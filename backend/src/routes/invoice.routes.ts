// src/routes/invoice.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";

const router = Router();

// GET /api/invoices/:orderId  — returns printable HTML invoice
router.get("/:orderId", authenticate, async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where:   { id: req.params.orderId },
    include: {
      items: true,
      store: true,
    },
  });
  if (!order) throw new AppError("Order not found", 404);

  const symbol  = order.currency === "NGN" ? "₦" : order.currency === "GBP" ? "£" : "$";
  const fmt     = (n: number) => `${symbol}${n.toFixed(2)}`;
  const date    = new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const addr    = order.shippingAddress as any;

  const rows = order.items.map((item: any) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;font-size:14px">${item.name}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px">${item.quantity}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px">${fmt(item.price)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:14px">${fmt(item.total)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${order.orderNumber}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;padding:40px;max-width:800px;margin:0 auto}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #e2e8f0}
  .logo{font-size:26px;font-weight:900;color:#7c3aed}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#f8fafc;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;border-bottom:2px solid #e2e8f0}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;color:#475569}
  .total-final{border-top:2px solid #7c3aed;margin-top:8px;padding-top:12px;font-size:18px;font-weight:900;color:#1e293b}
  @media print{.no-print{display:none}}
</style></head>
<body>
  <div class="header">
    <div><div class="logo">⚡ DropOS</div><div style="color:#64748b;font-size:14px;margin-top:4px">${order.store?.name || ""}</div></div>
    <div style="text-align:right">
      <div style="font-size:28px;font-weight:900">INVOICE</div>
      <div style="color:#7c3aed;font-weight:700">#${order.orderNumber}</div>
      <div style="color:#64748b;font-size:13px;margin-top:4px">${date}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px">
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px">Bill To</div>
      <div style="font-size:14px;line-height:1.8">
        <strong>${order.customerName}</strong><br>
        ${order.customerEmail}<br>
        ${addr ? `${addr.address || ""}<br>${addr.city || ""} ${addr.state || ""}<br>${addr.country || ""}` : ""}
      </div>
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:8px">Order Info</div>
      <div style="font-size:14px;line-height:1.8">
        <strong>Order:</strong> ${order.orderNumber}<br>
        <strong>Date:</strong> ${date}<br>
        <strong>Status:</strong> ${order.status}
      </div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th>Product</th><th style="text-align:center">Qty</th>
      <th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="margin-left:auto;width:260px">
    <div class="total-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
    ${order.shippingCost > 0 ? `<div class="total-row"><span>Shipping</span><span>${fmt(order.shippingCost)}</span></div>` : ""}
    ${order.taxAmount > 0 ? `<div class="total-row"><span>Tax</span><span>${fmt(order.taxAmount)}</span></div>` : ""}
    ${order.discountAmount > 0 ? `<div class="total-row" style="color:#16a34a"><span>Discount</span><span>-${fmt(order.discountAmount)}</span></div>` : ""}
    <div class="total-row total-final"><span>Total</span><span>${fmt(order.total)}</span></div>
  </div>

  <div style="margin-top:48px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#94a3b8">
    Thank you! Questions? ${order.store?.supportEmail || "support@dropos.io"}
  </div>

  <div class="no-print" style="margin-top:24px;text-align:center">
    <button onclick="window.print()" style="padding:12px 28px;background:#7c3aed;color:white;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer">
      🖨️ Print / Save as PDF
    </button>
  </div>
</body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
