// ============================================================
// KAI Agent Service — Dashboard In Chat
// Path: backend/src/services/kai.agent.service.ts
//
// EVERY dashboard action available through chat.
// KAI detects intent, asks for confirmation, executes.
// Multi-store aware — always asks which store when ambiguous.
// ============================================================
import prisma from "../lib/prisma";

// ── All actions KAI can perform ───────────────────────────────
export type AgentAction =
  // Store management
  | "select_store"
  | "get_store_info"
  | "update_store_settings"
  | "change_store_template"
  | "toggle_store_status"           // open/close store
  // Products
  | "add_product"
  | "edit_product"
  | "delete_product"
  | "update_product_price"
  | "bulk_update_prices"
  | "update_product_stock"
  | "toggle_product_active"
  | "duplicate_product"
  | "list_products"
  | "search_products"
  // Images
  | "add_product_image"
  | "remove_product_image"
  | "reorder_product_images"
  // Orders
  | "list_orders"
  | "get_order_detail"
  | "update_order_status"
  | "add_order_note"
  | "process_refund"
  | "create_manual_order"
  // Inventory
  | "check_inventory"
  | "restock_product"
  | "low_stock_report"
  // Customers
  | "list_customers"
  | "get_customer"
  | "add_customer_note"
  // Coupons & Marketing
  | "create_coupon"
  | "list_coupons"
  | "delete_coupon"
  | "create_flash_sale"
  | "end_flash_sale"
  // Analytics
  | "get_analytics"
  | "get_sales_summary"
  | "get_top_products"
  // Shipping
  | "list_shipping_zones"
  | "update_shipping_rate"
  // Settings
  | "update_store_name"
  | "update_store_logo"
  | "update_payment_settings"
  | "unknown";

// ── Intent detection — maps user message to action ───────────
export function detectAgentAction(message: string): {
  action: AgentAction;
  confidence: number;
  extractedData: Record<string, any>;
} {
  const m = message.toLowerCase().trim();

  // ── STORE SELECTION ──────────────────────────────────────────
  if (/which store|switch store|change store|my stores/.test(m))
    return { action: "select_store", confidence: 0.95, extractedData: {} };

  // ── ADD PRODUCT ───────────────────────────────────────────────
  if (/add (a )?product|create (a )?product|new product|list (a )?product/.test(m)) {
    const name   = extractQuoted(message) || extractAfter(message, ["called", "named", "product"]);
    const price  = extractPrice(message);
    const stock  = extractNumber(message, ["stock", "units", "pieces", "qty"]);
    return { action: "add_product", confidence: 0.9, extractedData: { name, price, stock } };
  }

  // ── UPDATE PRICE ──────────────────────────────────────────────
  if (/change (the )?price|update (the )?price|set price|price to|price of/.test(m)) {
    const name  = extractQuoted(message);
    const price = extractPrice(message);
    return { action: "update_product_price", confidence: 0.9, extractedData: { name, price } };
  }

  // ── BULK PRICE UPDATE ─────────────────────────────────────────
  if (/increase (all |every )?price|decrease (all |every )?price|reduce (all |every )?price|all products? (by|price)/.test(m)) {
    const percent = extractPercent(message);
    const amount  = extractPrice(message);
    const direction = /increase|raise|up/.test(m) ? "increase" : "decrease";
    return { action: "bulk_update_prices", confidence: 0.85, extractedData: { percent, amount, direction } };
  }

  // ── UPDATE STOCK ──────────────────────────────────────────────
  if (/restock|update stock|set stock|stock (of|for)|add stock|units/.test(m)) {
    const name  = extractQuoted(message);
    const stock = extractNumber(message, ["to", "stock", "units", "pieces"]);
    return { action: "update_product_stock", confidence: 0.85, extractedData: { name, stock } };
  }

  // ── DELETE PRODUCT ────────────────────────────────────────────
  if (/delete|remove (the )?product|take down/.test(m)) {
    const name = extractQuoted(message) || extractAfter(message, ["delete", "remove"]);
    return { action: "delete_product", confidence: 0.85, extractedData: { name } };
  }

  // ── LIST PRODUCTS ─────────────────────────────────────────────
  if (/show (my |all |)products|list (my |all |)products|what (products|items) (do i|do you)|my products/.test(m))
    return { action: "list_products", confidence: 0.9, extractedData: {} };

  // ── INVENTORY ─────────────────────────────────────────────────
  if (/inventory|low stock|out of stock|stock levels|check stock/.test(m))
    return { action: "check_inventory", confidence: 0.9, extractedData: {} };

  // ── ORDERS ────────────────────────────────────────────────────
  if (/show (my |all |)orders|list orders|pending orders|recent orders/.test(m))
    return { action: "list_orders", confidence: 0.9, extractedData: {} };

  if (/mark (as |)shipped|ship order|update order|order status|mark delivered|mark paid/.test(m)) {
    const orderId = extractOrderId(message);
    const status  = extractOrderStatus(message);
    return { action: "update_order_status", confidence: 0.85, extractedData: { orderId, status } };
  }

  if (/refund|cancel order/.test(m)) {
    const orderId = extractOrderId(message);
    return { action: "process_refund", confidence: 0.8, extractedData: { orderId } };
  }

  // ── COUPONS ───────────────────────────────────────────────────
  if (/create (a )?coupon|make (a )?coupon|add (a )?discount code/.test(m)) {
    const code     = extractCode(message);
    const discount = extractPercent(message) || extractPrice(message);
    const type     = /percent|%/.test(m) ? "PERCENTAGE" : "FIXED";
    return { action: "create_coupon", confidence: 0.9, extractedData: { code, discount, type } };
  }

  if (/show coupons|list coupons|my coupons/.test(m))
    return { action: "list_coupons", confidence: 0.9, extractedData: {} };

  // ── FLASH SALE ────────────────────────────────────────────────
  if (/flash sale|run (a )?sale|start (a )?sale/.test(m)) {
    const discount = extractPercent(message) || extractPrice(message);
    return { action: "create_flash_sale", confidence: 0.85, extractedData: { discount } };
  }

  // ── ANALYTICS ─────────────────────────────────────────────────
  if (/analytics|sales summary|how (am i|are we) doing|revenue|how much (have i|did i) make/.test(m))
    return { action: "get_sales_summary", confidence: 0.9, extractedData: {} };

  if (/top (selling|products)|best seller|what's selling/.test(m))
    return { action: "get_top_products", confidence: 0.9, extractedData: {} };

  // ── CUSTOMERS ─────────────────────────────────────────────────
  if (/show customers|list customers|my customers|how many customers/.test(m))
    return { action: "list_customers", confidence: 0.9, extractedData: {} };

  // ── STORE SETTINGS ────────────────────────────────────────────
  if (/change (my |the |store )?name|rename (my |the )?store/.test(m)) {
    const name = extractQuoted(message) || extractAfter(message, ["to", "name"]);
    return { action: "update_store_name", confidence: 0.85, extractedData: { name } };
  }

  if (/change template|switch template|use (the )?.*template|change (my |the )?theme/.test(m)) {
    const template = extractTemplateName(message);
    return { action: "change_store_template", confidence: 0.8, extractedData: { template } };
  }

  if (/close (my |the )?store|open (my |the )?store|pause (my |the )?store/.test(m)) {
    const status = /close|pause/.test(m) ? "INACTIVE" : "ACTIVE";
    return { action: "toggle_store_status", confidence: 0.9, extractedData: { status } };
  }

  if (/shipping (rate|price|zone)|change (the )?delivery/.test(m))
    return { action: "update_shipping_rate", confidence: 0.8, extractedData: {} };

  return { action: "unknown", confidence: 0, extractedData: {} };
}

// ── Execute an action against the database ────────────────────
export async function executeAgentAction(
  action: AgentAction,
  data: Record<string, any>,
  storeId: string
): Promise<{ success: boolean; result: any; message: string }> {

  switch (action) {

    case "list_products": {
      const products = await prisma.product.findMany({
        where:   { storeId },
        select:  { id: true, name: true, price: true, stockQuantity: true, isActive: true },
        orderBy: { createdAt: "desc" },
        take:    20,
      });
      return {
        success: true,
        result:  products,
        message: `Found ${products.length} products`,
      };
    }

    case "add_product": {
      const product = await prisma.product.create({
        data: {
          storeId,
          name:          data.name || "New Product",
          price:         data.price || 0,
          stockQuantity: data.stock || 0,
          description:   data.description || "",
          isActive:      data.publish !== false,
          images:        data.images || [],
          category:      data.category || "General",
        },
      });
      return { success: true, result: product, message: `Product "${product.name}" created` };
    }

    case "update_product_price": {
      if (!data.productId && !data.name) throw new Error("NEED_PRODUCT");
      const product = await findProductByNameOrId(storeId, data.productId, data.name);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");

      const updated = await prisma.product.update({
        where: { id: product.id },
        data:  { price: data.price },
      });
      return { success: true, result: updated, message: `Price updated to ₦${data.price.toLocaleString()}` };
    }

    case "bulk_update_prices": {
      const products = await prisma.product.findMany({ where: { storeId }, select: { id: true, price: true } });
      if (data.percent) {
        const multiplier = data.direction === "increase" ? 1 + data.percent / 100 : 1 - data.percent / 100;
        await Promise.all(products.map(p =>
          prisma.product.update({ where: { id: p.id }, data: { price: Math.round(Number(p.price) * multiplier) } })
        ));
      }
      return { success: true, result: { count: products.length }, message: `Updated prices for ${products.length} products` };
    }

    case "update_product_stock": {
      const product = await findProductByNameOrId(storeId, data.productId, data.name);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const updated = await prisma.product.update({
        where: { id: product.id },
        data:  { stockQuantity: data.stock },
      });
      return { success: true, result: updated, message: `Stock updated to ${data.stock} units` };
    }

    case "delete_product": {
      const product = await findProductByNameOrId(storeId, data.productId, data.name);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      await prisma.product.delete({ where: { id: product.id } });
      return { success: true, result: null, message: `"${product.name}" deleted` };
    }

    case "toggle_product_active": {
      const product = await findProductByNameOrId(storeId, data.productId, data.name);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const updated = await prisma.product.update({
        where: { id: product.id },
        data:  { isActive: data.active },
      });
      return { success: true, result: updated, message: `"${product.name}" ${data.active ? "activated" : "hidden"}` };
    }

    case "check_inventory": {
      const [outOfStock, lowStock, totalActive] = await Promise.all([
        prisma.product.count({ where: { storeId, stockQuantity: 0, isActive: true } }),
        prisma.product.findMany({ where: { storeId, stockQuantity: { gt: 0, lte: 5 }, isActive: true }, select: { name: true, stockQuantity: true }, orderBy: { stockQuantity: "asc" } }),
        prisma.product.count({ where: { storeId, isActive: true } }),
      ]);
      return { success: true, result: { outOfStock, lowStock, totalActive }, message: "Inventory checked" };
    }

    case "list_orders": {
      const filter: any = { storeId };
      if (data.status) filter.status = data.status;
      const orders = await prisma.order.findMany({
        where:   filter,
        include: { customer: { select: { name: true } }, items: { take: 1, include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: "desc" },
        take:    10,
      });
      return { success: true, result: orders, message: `Found ${orders.length} orders` };
    }

    case "update_order_status": {
      if (!data.orderId) throw new Error("NEED_ORDER_ID");
      const order = await prisma.order.update({
        where: { id: data.orderId },
        data:  { status: data.status },
        include: { customer: { select: { name: true } } },
      });
      return { success: true, result: order, message: `Order marked as ${data.status}` };
    }

    case "create_coupon": {
      const code = data.code || generateCouponCode();
      const coupon = await prisma.coupon.create({
        data: {
          storeId,
          code:          code.toUpperCase(),
          discountType:  data.type || "PERCENTAGE",
          discountValue: data.discount || 10,
          isActive:      true,
          usageLimit:    data.limit || null,
          expiresAt:     data.expiresAt ? new Date(data.expiresAt) : null,
        },
      });
      return { success: true, result: coupon, message: `Coupon ${coupon.code} created` };
    }

    case "list_coupons": {
      const coupons = await prisma.coupon.findMany({
        where:   { storeId, isActive: true },
        orderBy: { createdAt: "desc" },
        take:    10,
      });
      return { success: true, result: coupons, message: `Found ${coupons.length} active coupons` };
    }

    case "get_sales_summary": {
      const now         = new Date();
      const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
      const [todayOrders, monthOrders, allOrders] = await Promise.all([
        prisma.order.findMany({ where: { storeId, createdAt: { gte: todayStart }, status: { in: ["PAID","SHIPPED","DELIVERED"] } }, select: { total: true } }),
        prisma.order.findMany({ where: { storeId, createdAt: { gte: monthStart }, status: { in: ["PAID","SHIPPED","DELIVERED"] } }, select: { total: true } }),
        prisma.order.aggregate({ where: { storeId, status: { in: ["PAID","SHIPPED","DELIVERED"] } }, _count: true, _sum: { total: true } }),
      ]);
      return {
        success: true,
        result: {
          revenueToday:     todayOrders.reduce((s, o) => s + Number(o.total), 0),
          revenueThisMonth: monthOrders.reduce((s, o) => s + Number(o.total), 0),
          totalRevenue:     Number(allOrders._sum.total || 0),
          totalOrders:      allOrders._count,
          ordersToday:      todayOrders.length,
        },
        message: "Sales summary fetched",
      };
    }

    case "get_top_products": {
      const topItems = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { storeId, status: { in: ["PAID","SHIPPED","DELIVERED"] } } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });
      const products = await Promise.all(topItems.map(async t => {
        const p = await prisma.product.findUnique({ where: { id: t.productId }, select: { name: true, price: true } });
        return { name: p?.name, price: p?.price, unitsSold: t._sum.quantity };
      }));
      return { success: true, result: products, message: "Top products fetched" };
    }

    case "list_customers": {
      const customers = await prisma.customer.findMany({
        where: { storeId },
        include: { orders: { select: { total: true }, where: { status: { in: ["PAID","SHIPPED","DELIVERED"] } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return {
        success: true,
        result: customers.map(c => ({
          id:         c.id,
          name:       c.name,
          email:      c.email,
          phone:      c.phone,
          orderCount: c.orders.length,
          totalSpent: c.orders.reduce((s, o) => s + Number(o.total), 0),
        })),
        message: `Found ${customers.length} customers`,
      };
    }

    case "update_store_name": {
      const store = await prisma.store.update({
        where: { id: storeId },
        data:  { name: data.name },
      });
      return { success: true, result: store, message: `Store renamed to "${data.name}"` };
    }

    case "toggle_store_status": {
      const store = await prisma.store.update({
        where: { id: storeId },
        data:  { status: data.status },
      });
      return { success: true, result: store, message: `Store is now ${data.status === "ACTIVE" ? "open" : "closed"}` };
    }

    case "change_store_template": {
      await prisma.store.update({
        where: { id: storeId },
        data:  { themeSettings: { template: data.template } as any },
      });
      return { success: true, result: null, message: `Template changed to ${data.template}` };
    }

    default:
      return { success: false, result: null, message: "Action not recognised" };
  }
}

// ── Get all stores for a user ─────────────────────────────────
export async function getUserStores(userId: string) {
  return prisma.store.findMany({
    where:  { ownerId: userId },
    select: {
      id:     true,
      name:   true,
      slug:   true,
      status: true,
      _count: { select: { products: true, orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Helpers ───────────────────────────────────────────────────
async function findProductByNameOrId(storeId: string, id?: string, name?: string) {
  if (id) return prisma.product.findFirst({ where: { id, storeId } });
  if (name) return prisma.product.findFirst({
    where: { storeId, name: { contains: name, mode: "insensitive" } },
  });
  return null;
}

function extractQuoted(text: string): string | undefined {
  const match = text.match(/["']([^"']+)["']/) || text.match(/called\s+([^\s,]+)/i);
  return match?.[1];
}

function extractAfter(text: string, keywords: string[]): string | undefined {
  for (const kw of keywords) {
    const match = text.match(new RegExp(`${kw}\\s+([\\w\\s]+?)(?:\\s+(?:at|for|to)|$)`, "i"));
    if (match) return match[1].trim();
  }
}

function extractPrice(text: string): number | undefined {
  const match = text.match(/[₦$£]?\s*(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(/,/g, "")) : undefined;
}

function extractNumber(text: string, after: string[]): number | undefined {
  for (const kw of after) {
    const match = text.match(new RegExp(`${kw}\\s+(\\d+)`, "i"));
    if (match) return parseInt(match[1]);
  }
  const match = text.match(/\b(\d+)\s*(?:units|pieces|pcs|qty)?\b/);
  return match ? parseInt(match[1]) : undefined;
}

function extractPercent(text: string): number | undefined {
  const match = text.match(/(\d+)\s*%/);
  return match ? parseInt(match[1]) : undefined;
}

function extractOrderId(text: string): string | undefined {
  const match = text.match(/#?([a-z0-9]{8,})/i);
  return match?.[1];
}

function extractOrderStatus(text: string): string {
  if (/ship|shipped/.test(text))    return "SHIPPED";
  if (/deliver|delivered/.test(text)) return "DELIVERED";
  if (/paid|pay/.test(text))        return "PAID";
  if (/cancel/.test(text))          return "CANCELLED";
  if (/process/.test(text))         return "PROCESSING";
  return "SHIPPED";
}

function extractCode(text: string): string | undefined {
  const match = text.match(/code\s+([A-Z0-9]+)/i) || text.match(/\b([A-Z]{3,}[0-9]*)\b/);
  return match?.[1];
}

function extractTemplateName(text: string): string {
  const templates = ["Lagos Noir", "Bold", "Classic", "Glow", "Circuit", "Runway", "Boutique", "Cozy", "Suya", "Feast"];
  for (const t of templates) {
    if (text.toLowerCase().includes(t.toLowerCase())) return t;
  }
  return "Bold";
}

function generateCouponCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
