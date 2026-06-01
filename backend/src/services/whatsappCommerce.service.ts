// WhatsApp Commerce Service
// Generates payment links merchants can share on WhatsApp
// Turns any product into a WhatsApp-ready sales message

import { prisma } from "../config/database";

interface WhatsAppPayload {
  storeSlug: string;
  productId?: string;
  customMessage?: string;
  discount?: number;
}

export async function generateWhatsAppLink(storeId: string, payload: WhatsAppPayload) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found");

  const baseUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://droposhq.com/store/${store.slug}`;

  if (payload.productId) {
    // Single product link
    const product = await prisma.product.findUnique({ where: { id: payload.productId } });
    if (!product) throw new Error("Product not found");

    const price = payload.discount
      ? Math.round(Number(product.price) * (1 - payload.discount / 100))
      : Number(product.price);

    const productUrl = `${baseUrl}/product/${product.id}`;
    const message = payload.customMessage || generateProductMessage(
      store.name,
      product.name,
      price,
      (product as any).currency || "NGN",
      productUrl,
      payload.discount
    );

    return {
      url: productUrl,
      waLink: `https://wa.me/?text=${encodeURIComponent(message)}`,
      message,
      product: { name: product.name, price, image: (product.images as any)?.[0] },
    };
  }

  // Store-wide link
  const message = payload.customMessage || generateStoreMessage(store.name, baseUrl);
  return {
    url: baseUrl,
    waLink: `https://wa.me/?text=${encodeURIComponent(message)}`,
    message,
  };
}

function generateProductMessage(
  storeName: string, productName: string,
  price: number, currency: string,
  url: string, discount?: number
): string {
  const sym = currency === "NGN" ? "₦" : currency === "GBP" ? "£" : "$";
  const priceStr = `${sym}${price.toLocaleString()}`;
  
  const lines = [
    `🔥 *${productName}*`,
    ``,
    discount ? `~~${priceStr}~~ Now *${priceStr}* (${discount}% OFF!)` : `💰 *${priceStr}*`,
    ``,
    `✅ Secure checkout`,
    `✅ Fast delivery`,
    `✅ Pay on delivery available`,
    ``,
    `👇 Order here:`,
    url,
    ``,
    `📦 From ${storeName}`,
  ];
  return lines.join("\n");
}

function generateStoreMessage(storeName: string, url: string): string {
  return [
    `🛍️ *Shop at ${storeName}*`,
    ``,
    `Browse all our products and checkout securely online.`,
    ``,
    `👇 Visit our store:`,
    url,
    ``,
    `✅ Paystack payments accepted`,
    `✅ Bank transfer available`,
    `✅ Fast delivery`,
  ].join("\n");
}

// Generate a bulk broadcast message for all customers
export async function generateBroadcastMessage(storeId: string, type: "sale" | "restock" | "winback", options: any) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found");

  const baseUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://droposhq.com/store/${store.slug}`;

  const templates = {
    sale: [
      `🔥 *SALE ALERT - ${store.name}!*`,
      ``,
      `We just dropped prices on our best products.`,
      `Up to ${options.discount || 30}% OFF for the next ${options.hours || 24} hours only!`,
      ``,
      `⏰ Sale ends soon — don't miss out!`,
      ``,
      `👇 Shop now:`,
      `${baseUrl}`,
      ``,
      `_Reply STOP to unsubscribe_`,
    ].join("\n"),

    restock: [
      `📦 *BACK IN STOCK - ${store.name}*`,
      ``,
      `${options.productName || "Popular item"} is back!`,
      `You asked, we delivered. 😊`,
      ``,
      `Stock is limited — order now before it sells out again.`,
      ``,
      `👇 Order here:`,
      `${baseUrl}`,
    ].join("\n"),

    winback: [
      `Hey! We miss you 💜`,
      ``,
      `It's been a while since you shopped at *${store.name}*.`,
      ``,
      `We have new arrivals and a special comeback offer just for you:`,
      `Use code *COMEBACK* for 15% off your next order!`,
      ``,
      `👇 Shop now:`,
      `${baseUrl}`,
    ].join("\n"),
  };

  return {
    message: templates[type],
    waLink: `https://wa.me/?text=${encodeURIComponent(templates[type])}`,
    type,
  };
}
