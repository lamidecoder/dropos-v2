import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();
router.use(authenticate);

function toCSV(headers: string[], rows: any[][]): string {
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
}

// GET /api/reports/:storeId/:reportId
router.get("/:storeId/:reportId", async (req: any, res: Response) => {
  try {
    const { storeId, reportId } = req.params;
    const period = parseInt(req.query.period as string) || 30;
    const format = req.query.format as string || "csv";
    const since  = new Date(Date.now() - period * 86400000);

    let csv = "";
    let filename = `dropos-${reportId}`;

    switch (reportId) {
      case "revenue": {
        const orders = await prisma.order.findMany({
          where: { storeId, createdAt: { gte: since } },
          select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        csv = toCSV(
          ["Order ID", "Order Number", "Total (NGN)", "Status", "Date"],
          orders.map(o => [o.id, o.orderNumber, o.total, o.status, o.createdAt.toISOString().split("T")[0]])
        );
        filename = `dropos-revenue-${period}days`;
        break;
      }
      case "orders": {
        const orders = await prisma.order.findMany({
          where: { storeId, createdAt: { gte: since } },
          include: { customer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
          orderBy: { createdAt: "desc" },
        });
        csv = toCSV(
          ["Order ID", "Customer Name", "Customer Email", "Items", "Total", "Status", "Date"],
          orders.map(o => [
            o.id, o.customer?.name ?? "Guest", o.customer?.email ?? "",
            o.items.map((i: any) => i.product?.name ?? "").join("; "),
            o.total, o.status, o.createdAt.toISOString().split("T")[0],
          ])
        );
        filename = `dropos-orders-${period}days`;
        break;
      }
      case "customers": {
        const customers = await prisma.storeCustomer.findMany({
          where: { storeId },
          include: { _count: { select: { orders: true } } },
          orderBy: { createdAt: "desc" },
        });
        csv = toCSV(
          ["Customer ID", "Name", "Email", "Phone", "Total Orders", "Joined"],
          customers.map(c => [c.id, c.name, c.email, c.phone ?? "", c._count.orders, c.createdAt.toISOString().split("T")[0]])
        );
        filename = `dropos-customers`;
        break;
      }
      case "products": {
        const products = await prisma.product.findMany({
          where: { storeId },
          select: { id: true, name: true, price: true, inventory: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        csv = toCSV(
          ["Product ID", "Name", "Price (NGN)", "Stock", "Status", "Created"],
          products.map(p => [p.id, p.name, p.price, p.inventory, p.status, p.createdAt.toISOString().split("T")[0]])
        );
        filename = `dropos-products`;
        break;
      }
      case "inventory": {
        const products = await prisma.product.findMany({
          where: { storeId },
          select: { id: true, name: true, sku: true, inventory: true, price: true },
        });
        csv = toCSV(
          ["Product ID", "Name", "SKU", "Stock", "Price (NGN)"],
          products.map(p => [p.id, p.name, p.sku ?? "", p.inventory, p.price])
        );
        filename = `dropos-inventory`;
        break;
      }
      case "tax": {
        const orders = await prisma.order.findMany({
          where: { storeId, createdAt: { gte: since } },
          select: { id: true, orderNumber: true, total: true, tax: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        });
        csv = toCSV(
          ["Order ID", "Order Number", "Subtotal", "Tax", "Date"],
          orders.map(o => [o.id, o.orderNumber, (o.total - (o.tax || 0)).toFixed(2), (o.tax || 0).toFixed(2), o.createdAt.toISOString().split("T")[0]])
        );
        filename = `dropos-tax-${period}days`;
        break;
      }
      default:
        return res.status(400).json({ success: false, message: "Unknown report type" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
