// ============================================================
// Universal Supplier Engine
// Path: frontend/src/lib/supplier.ts
//
// Every supplier type Nigerian sellers use - handled perfectly
// ============================================================

export type SupplierType =
  | "aliexpress" | "cjdropshipping" | "temu"
  | "jumia" | "konga" | "jiji"
  | "whatsapp" | "instagram"
  | "local" | "website" | "none";

export interface SupplierConfig {
  type:       SupplierType;
  name:       string;
  emoji:      string;
  color:      string;
  bgColor:    string;
  actionLabel:string;
  actionType: "url" | "whatsapp" | "instagram" | "call" | "manual";
}

// ── Detect supplier type from any input ───────────────────────
export function detectSupplier(sourceUrl?: string | null, metadata?: any): SupplierConfig {
  const url  = (sourceUrl  || "").toLowerCase();
  const name = ((metadata?.supplierName || metadata?.supplier) || "").toLowerCase();
  const phone= metadata?.supplierPhone || metadata?.phone || "";
  const handle=metadata?.supplierHandle|| metadata?.instagram || "";

  if (url.includes("aliexpress.com"))      return SUPPLIERS.aliexpress;
  if (url.includes("cjdropshipping.com"))  return SUPPLIERS.cjdropshipping;
  if (url.includes("temu.com"))            return SUPPLIERS.temu;
  if (url.includes("jumia.com"))           return SUPPLIERS.jumia;
  if (url.includes("konga.com"))           return SUPPLIERS.konga;
  if (url.includes("jiji.ng") || url.includes("jiji.com")) return SUPPLIERS.jiji;
  if (url.includes("wa.me") || url.includes("whatsapp.com") || phone) return SUPPLIERS.whatsapp;
  if (url.includes("instagram.com") || handle?.startsWith("@")) return SUPPLIERS.instagram;
  if (name.includes("alaba") || name.includes("balogun") || name.includes("computer village") ||
      name.includes("aba ") || name.includes("local") || name.includes("market")) return SUPPLIERS.local;
  if (url.startsWith("http")) return SUPPLIERS.website;
  return SUPPLIERS.none;
}

export const SUPPLIERS: Record<SupplierType, SupplierConfig> = {
  aliexpress:     { type:"aliexpress",     name:"AliExpress",      emoji:"🛒", color:"#e8441a", bgColor:"rgba(232,68,26,0.12)",   actionLabel:"Order on AliExpress",    actionType:"url"       },
  cjdropshipping: { type:"cjdropshipping", name:"CJDropshipping",  emoji:"📦", color:"#ff6b35", bgColor:"rgba(255,107,53,0.12)",  actionLabel:"Order on CJDropshipping",actionType:"url"       },
  temu:           { type:"temu",           name:"Temu",            emoji:"🎯", color:"#ff4547", bgColor:"rgba(255,69,71,0.12)",   actionLabel:"Order on Temu",          actionType:"url"       },
  jumia:          { type:"jumia",          name:"Jumia",           emoji:"🛍️", color:"#f68c1e", bgColor:"rgba(246,140,30,0.12)",  actionLabel:"Order on Jumia",         actionType:"url"       },
  konga:          { type:"konga",          name:"Konga",           emoji:"🏪", color:"#e94b1b", bgColor:"rgba(233,75,27,0.12)",   actionLabel:"Order on Konga",         actionType:"url"       },
  jiji:           { type:"jiji",           name:"Jiji",            emoji:"🔍", color:"#0cb15c", bgColor:"rgba(12,177,92,0.12)",   actionLabel:"View on Jiji",           actionType:"url"       },
  whatsapp:       { type:"whatsapp",       name:"WhatsApp Vendor", emoji:"💬", color:"#25d366", bgColor:"rgba(37,211,102,0.12)",  actionLabel:"Order via WhatsApp",     actionType:"whatsapp"  },
  instagram:      { type:"instagram",      name:"Instagram Seller",emoji:"📸", color:"#e1306c", bgColor:"rgba(225,48,108,0.12)",  actionLabel:"DM on Instagram",        actionType:"instagram" },
  local:          { type:"local",          name:"Local Supplier",  emoji:"🏬", color:"#fbbf24", bgColor:"rgba(251,191,36,0.12)",  actionLabel:"Mark as Ordered",        actionType:"call"      },
  website:        { type:"website",        name:"Online Supplier", emoji:"🌐", color:"#60a5fa", bgColor:"rgba(96,165,250,0.12)",  actionLabel:"Open Supplier",          actionType:"url"       },
  none:           { type:"none",           name:"No Supplier",     emoji:"⚠️", color:"#f87171", bgColor:"rgba(248,113,113,0.08)", actionLabel:"Add Supplier",           actionType:"manual"    },
};

// ── Build the action URL/message ──────────────────────────────
export function buildSupplierAction(params: {
  config:          SupplierConfig;
  sourceUrl?:      string | null;
  metadata?:       any;
  productName:     string;
  quantity:        number;
  orderId:         string;
  customerName:    string;
  customerAddress: string;
  customerCity:    string;
  customerPhone:   string;
}): { url?: string; instruction?: string } {
  const {
    config, sourceUrl, metadata,
    productName, quantity, orderId,
    customerName, customerAddress, customerCity, customerPhone,
  } = params;

  const ref     = `DropOS #${orderId.slice(-8).toUpperCase()}`;
  const address = `${customerAddress}, ${customerCity}`;

  switch (config.actionType) {
    case "url":
      return { url: sourceUrl || "" };

    case "whatsapp": {
      const raw   = metadata?.supplierPhone || metadata?.phone || "";
      const phone = raw.replace(/\D/g, "").replace(/^0/, "234");
      const waNum = sourceUrl?.match(/wa\.me\/(\d+)/)?.[1] || phone;
      const msg   = encodeURIComponent(
        `Hi! I need to place an order 🙏\n\n` +
        `*Order:* ${ref}\n` +
        `*Product:* ${productName}\n` +
        `*Quantity:* ${quantity}\n\n` +
        `*Ship to:*\n` +
        `Name: ${customerName}\n` +
        `Address: ${address}\n` +
        `Phone: ${customerPhone}\n\n` +
        `Please confirm price and availability. Thank you!`
      );
      return { url: `https://wa.me/${waNum}?text=${msg}` };
    }

    case "instagram": {
      const handle = (metadata?.supplierHandle || metadata?.instagram || "")
        .replace("@", "")
        .replace("https://www.instagram.com/", "")
        .replace("https://instagram.com/", "");
      return { url: handle ? `https://ig.me/m/${handle}` : "https://www.instagram.com/" };
    }

    case "call": {
      const phone = metadata?.supplierPhone || metadata?.phone || "";
      return {
        instruction: phone
          ? `Call ${phone} to order ${productName} × ${quantity}. Tell them to deliver to: ${customerName}, ${address}`
          : `Order ${productName} × ${quantity} from your local supplier. Deliver to: ${customerName}, ${address}`
      };
    }

    default:
      return {
        instruction: `Order ${productName} × ${quantity} from your supplier. Deliver to: ${customerName}, ${address}`
      };
  }
}

// ── Format supplier display name ──────────────────────────────
export function getSupplierDisplayName(config: SupplierConfig, metadata?: any): string {
  if (metadata?.supplierName) return metadata.supplierName;
  if (metadata?.supplierHandle) return metadata.supplierHandle;
  return config.name;
}

// ── All platforms for search ──────────────────────────────────
export function getSearchLinks(productName: string, country = "NG") {
  const q = encodeURIComponent(productName);
  const links = [
    { ...SUPPLIERS.aliexpress,     url: `https://www.aliexpress.com/w/wholesale-${q}.html`,     desc: "Global supplier · Ships worldwide" },
    { ...SUPPLIERS.cjdropshipping, url: `https://cjdropshipping.com/search.html?q=${q}`,         desc: "Free dropshipping · Good Africa shipping" },
    { ...SUPPLIERS.temu,           url: `https://www.temu.com/search_result.html?search_key=${q}`,desc: "Very cheap prices" },
  ];
  if (["NG","GH","KE","ZA"].includes(country)) {
    links.push(
      { ...SUPPLIERS.jumia,   url: `https://www.jumia.com.ng/catalog/?q=${q}`,  desc: "Fast Nigerian delivery" },
      { ...SUPPLIERS.konga,   url: `https://www.konga.com/search?search=${q}`,  desc: "Nigerian marketplace" },
      { ...SUPPLIERS.jiji,    url: `https://jiji.ng/search?query=${q}`,          desc: "Local Nigerian sellers" },
    );
  }
  return links;
}