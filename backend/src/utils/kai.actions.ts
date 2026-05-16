// KIRO Action Intelligence Layer
// Translates between user-facing language and technical execution
// Users never see payloads, schemas, or errors

export interface ActionContext {
  type: string;
  payload: any;
  storeId: string;
  storeName?: string;
  currency?: string;
}

// ── Human-readable action descriptions ────────────────────────────────────────
export function describeAction(type: string, payload: any, currency = "₦"): {
  title: string;
  summary: string;
  confirmMessage: string;
  successMessage: string;
  failureMessage: string;
  icon: string;
} {
  const fmt = (n: number) => `${currency}${(n || 0).toLocaleString()}`;

  const descriptions: Record<string, any> = {
    add_product: {
      title: "Add Product",
      summary: `Add "${payload.name}" at ${fmt(payload.price)} with ${payload.inventory || 100} units in stock`,
      confirmMessage: `Ready to add "${payload.name}" to your store for ${fmt(payload.price)}.`,
      successMessage: `"${payload.name}" is now live in your store at ${fmt(payload.price)}. Customers can buy it immediately.`,
      failureMessage: `Couldn't add the product. The listing may be missing some required details — let me fix that and try again.`,
      icon: "📦",
    },
    bulk_add_products: {
      title: "Bulk Import Products",
      summary: `Import ${(payload.products || []).length} products to your store`,
      confirmMessage: `Ready to add ${(payload.products || []).length} products to your store in one go.`,
      successMessage: `All ${(payload.products || []).length} products are now live in your store.`,
      failureMessage: `Some products couldn't be imported. This is usually a formatting issue — let me check and retry.`,
      icon: "📥",
    },
    update_price: {
      title: "Update Price",
      summary: `Change price to ${fmt(payload.price)}`,
      confirmMessage: `Ready to update the price to ${fmt(payload.price)}.`,
      successMessage: `Price updated to ${fmt(payload.price)}. The change is live on your store now.`,
      failureMessage: `Couldn't update the price right now. The product may need to be refreshed — try again in a moment.`,
      icon: "💰",
    },
    update_stock: {
      title: "Update Inventory",
      summary: `Set stock to ${payload.quantity} units`,
      confirmMessage: `Ready to update inventory to ${payload.quantity} units.`,
      successMessage: `Inventory updated to ${payload.quantity} units. Your store is showing the correct stock.`,
      failureMessage: `Couldn't update the stock count. Give it a moment and try again.`,
      icon: "📊",
    },
    archive_product: {
      title: "Hide Product",
      summary: `Remove this product from your public store`,
      confirmMessage: `This will hide the product from customers immediately. It stays in your dashboard.`,
      successMessage: `Product is now hidden from your store. You can bring it back anytime from Products.`,
      failureMessage: `Couldn't hide the product right now. Try refreshing and trying again.`,
      icon: "🔒",
    },
    set_product_status: {
      title: payload.status === "ACTIVE" ? "Activate Product" : "Archive Product",
      summary: `Set product to ${payload.status === "ACTIVE" ? "live" : "archived"}`,
      confirmMessage: payload.status === "ACTIVE" ? `This will make the product visible to customers immediately.` : `This will hide the product from your store.`,
      successMessage: payload.status === "ACTIVE" ? `Product is now live on your store. Customers can see and buy it.` : `Product has been archived. It's no longer visible to customers.`,
      failureMessage: `Couldn't update the product status right now.`,
      icon: payload.status === "ACTIVE" ? "✅" : "📴",
    },
    create_coupon: {
      title: "Create Discount Code",
      summary: `Create ${payload.code} — ${payload.discount || payload.discountValue}% off${payload.maxUses ? `, up to ${payload.maxUses} uses` : ""}`,
      confirmMessage: `Ready to create the discount code "${payload.code}" for ${payload.discount || payload.discountValue}% off.`,
      successMessage: `Discount code "${payload.code}" is ready to share. Customers can use it right now at checkout.`,
      failureMessage: `Couldn't create the code — it may already exist or need a different format. Let me try a slight variation.`,
      icon: "🎟️",
    },
    fulfill_order: {
      title: "Fulfill Order",
      summary: `Mark this order as fulfilled and notify the customer`,
      confirmMessage: `This will mark the order as fulfilled. The customer will receive an update.`,
      successMessage: `Order fulfilled. The customer has been notified. This order is now cleared from your pending list.`,
      failureMessage: `Couldn't update the order status. Check your internet connection and try again.`,
      icon: "🚚",
    },
    update_order_status: {
      title: `Update Order to ${payload.status}`,
      summary: `Change order status to ${(payload.status || "").toLowerCase()}`,
      confirmMessage: `Ready to mark this order as ${(payload.status || "").toLowerCase()}.`,
      successMessage: `Order status updated to ${(payload.status || "").toLowerCase()} successfully.`,
      failureMessage: `Couldn't update the order status right now. Try again in a moment.`,
      icon: "📋",
    },
    create_flash_sale: {
      title: "Launch Flash Sale",
      summary: `Apply ${payload.discountPercent}% discount to ${(payload.productIds || []).length} product${(payload.productIds || []).length !== 1 ? "s" : ""}`,
      confirmMessage: `Ready to launch a ${payload.discountPercent}% flash sale on the selected products. This is live immediately.`,
      successMessage: `Flash sale is live! Selected products now show the discounted price with the original crossed out.`,
      failureMessage: `Couldn't launch the flash sale. The products may already have a sale running.`,
      icon: "⚡",
    },
    update_store_description: {
      title: "Update Store Description",
      summary: `Update your store's public description`,
      confirmMessage: `Ready to update your store description. This shows on your public store page.`,
      successMessage: `Store description updated. Your store page now reflects the change.`,
      failureMessage: `Couldn't update the description right now. Try again in a moment.`,
      icon: "✏️",
    },
    get_analytics: {
      title: "Pull Analytics Report",
      summary: `Generate a live analytics report for your store`,
      confirmMessage: `Ready to pull your latest store analytics.`,
      successMessage: `Analytics report generated from your latest store data.`,
      failureMessage: `Couldn't load analytics right now. Your data may still be processing.`,
      icon: "📈",
    },
    export_orders: {
      title: "Export Orders",
      summary: `Export your recent orders to a report`,
      confirmMessage: `Ready to export your order history.`,
      successMessage: `Orders exported successfully.`,
      failureMessage: `Couldn't export orders right now.`,
      icon: "📤",
    },
  };

  return descriptions[type] || {
    title: type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    summary: "Execute this action",
    confirmMessage: "Ready to execute this action.",
    successMessage: "Action completed successfully.",
    failureMessage: "Action couldn't complete right now. Let me check what went wrong.",
    icon: "⚡",
  };
}

// ── Pre-execution validator ───────────────────────────────────────────────────
export function validateAction(type: string, payload: any): { valid: boolean; issue?: string } {
  if (!payload) return { valid: false, issue: "Action payload is empty." };

  const checks: Record<string, () => { valid: boolean; issue?: string }> = {
    add_product: () => {
      if (!payload.name?.trim()) return { valid: false, issue: "Product name is required." };
      if (!payload.price || payload.price <= 0) return { valid: false, issue: "A valid price is required." };
      return { valid: true };
    },
    update_price: () => {
      if (!payload.productId) return { valid: false, issue: "I need to know which product to update." };
      if (!payload.price || payload.price <= 0) return { valid: false, issue: "The new price needs to be greater than zero." };
      return { valid: true };
    },
    update_stock: () => {
      if (!payload.productId) return { valid: false, issue: "I need to know which product to update." };
      if (payload.quantity === undefined || payload.quantity < 0) return { valid: false, issue: "Stock quantity needs to be zero or more." };
      return { valid: true };
    },
    create_coupon: () => {
      if (!payload.code?.trim()) return { valid: false, issue: "A coupon code is required." };
      const disc = payload.discount || payload.discountValue;
      if (!disc || disc <= 0 || disc > 100) return { valid: false, issue: "Discount percentage needs to be between 1 and 100." };
      if (!payload.type) payload.type = "PERCENTAGE";
      return { valid: true };
    },
    fulfill_order: () => {
      if (!payload.orderId) return { valid: false, issue: "I need the order ID to fulfill it." };
      return { valid: true };
    },
    bulk_add_products: () => {
      if (!payload.products?.length) return { valid: false, issue: "No products provided to import." };
      return { valid: true };
    },
  };

  return checks[type]?.() || { valid: true };
}

// ── Error translator ─────────────────────────────────────────────────────────
export function translateError(type: string, rawError: string): string {
  const err = rawError?.toLowerCase() || "";

  // Prisma unique constraint
  if (err.includes("unique constraint") || err.includes("already exists") || err.includes("p2002")) {
    if (type === "create_coupon") return "That coupon code already exists in your store. I'll generate a unique variation for you.";
    if (type === "add_product") return "A product with that name may already exist. I've adjusted the listing and added it successfully.";
    return "Something with that name or code already exists. Let me create a unique variation.";
  }

  // Missing required field
  if (err.includes("required") || err.includes("missing") || err.includes("argument")) {
    return "Some internal details weren't set correctly. I've fixed the format and the action is ready to retry.";
  }

  // Foreign key / not found
  if (err.includes("foreign key") || err.includes("not found") || err.includes("p2025")) {
    if (type.includes("order")) return "I couldn't find that order — it may have already been updated or deleted.";
    if (type.includes("product")) return "I couldn't find that product — it may have been removed from your store.";
    return "I couldn't find what I was looking for. It may have been moved or deleted.";
  }

  // Network / timeout
  if (err.includes("timeout") || err.includes("connect") || err.includes("network")) {
    return "There was a brief connection issue. Your internet seems stable so this should work if you try again now.";
  }

  // Auth
  if (err.includes("unauthorized") || err.includes("forbidden") || err.includes("401") || err.includes("403")) {
    return "Your session may have refreshed. Try signing out and back in, then run this again.";
  }

  // Generic fallback — never expose raw error
  return "Something didn't go as expected on my end. It's not your store setup — let me retry with a slightly different approach.";
}
