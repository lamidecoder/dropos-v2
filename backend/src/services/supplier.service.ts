// src/services/supplier.service.ts
/**
 * SupplierService
 * ───────────────
 * Handles:
 *  - AliExpress product scraping (public page HTML + og: tags, no API key needed)
 *  - Generic URL product scraping via open-graph meta tags
 *  - Auto-fulfillment: email + webhook dispatch when orders go PROCESSING
 */

import axios from "axios";
import { logger } from "../utils/logger";

export interface ScrapedProduct {
  title:       string;
  description: string;
  images:      string[];
  price:       number;
  comparePrice?: number;
  currency:    string;
  category?:   string;
  sku?:        string;
  variants:    Array<{ name: string; value: string; price?: number }>;
  weight?:     number;
  shippingDays?: number;
  processingDays?: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  sourceUrl:   string;
  supplierName?: string;
}

export interface FulfillmentPayload {
  orderNumber:     string;
  orderId:         string;
  customerName:    string;
  customerEmail:   string;
  customerPhone?:  string | null;
  shippingAddress: any;
  items: Array<{
    name:          string;
    sku?:          string | null;
    quantity:      number;
    price:         number;
    supplierSku?:  string | null;
    supplierUrl?:  string | null;
  }>;
  notes?:    string | null;
  storeName: string;
  storeId:   string;
  total:     number;
  currency:  string;
}

// ── Browser-like headers to avoid 403s ───────────────────────────────────────
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Connection:        "keep-alive",
  "Cache-Control":   "no-cache",
};

export class SupplierService {

  // ── Detect URL type and route to the right scraper ───────────────────────
  async scrapeProductUrl(url: string): Promise<ScrapedProduct> {
    const lower = url.toLowerCase();

    if (lower.includes("aliexpress.com"))  return this.scrapeAliExpress(url);
    if (lower.includes("alibaba.com"))     return this.scrapeAlibaba(url);
    if (lower.includes("amazon.com"))      return this.scrapeGeneric(url, "Amazon");
    if (lower.includes("dhgate.com"))      return this.scrapeGeneric(url, "DHgate");
    if (lower.includes("shein.com"))       return this.scrapeGeneric(url, "SHEIN");
    if (lower.includes("temu.com"))        return this.scrapeGeneric(url, "Temu");
    return this.scrapeGeneric(url);
  }

  // ── AliExpress scraper ────────────────────────────────────────────────────
  private async scrapeAliExpress(url: string): Promise<ScrapedProduct> {
    try {
      const { data: html } = await axios.get(url, {
        headers: HEADERS,
        timeout: 12000,
        maxRedirects: 5,
      });

      const result: ScrapedProduct = {
        title:       "",
        description: "",
        images:      [],
        price:       0,
        currency:    "USD",
        variants:    [],
        stockStatus: "IN_STOCK",
        sourceUrl:   url,
        supplierName: "AliExpress",
      };

      // Title — og:title or window.runParams
      const titleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
        || html.match(/"subject"\s*:\s*"([^"]+)"/);
      if (titleMatch) result.title = this.decodeHtml(titleMatch[1]).replace(" - AliExpress", "").trim();

      // Images — og:image and data-src patterns
      const ogImages = [...html.matchAll(/<meta[^>]+property="og:image(?::\d+)?"[^>]+content="([^"]+)"/gi)]
        .map(m => m[1]).filter(u => u.startsWith("http") && !u.includes("placeholder"));
      const slideImages = [...html.matchAll(/https:\/\/ae\d*\.alicdn\.com\/kf\/[A-Za-z0-9_]+\.(jpg|jpeg|png|webp)/gi)]
        .map(m => m[0]);
      const allImages = [...new Set([...ogImages, ...slideImages])].slice(0, 8);
      if (allImages.length) result.images = allImages;

      // Price — look for price patterns in the page JSON
      const priceMatch =
        html.match(/"minActivityAmount"\s*:\s*\{\s*"value"\s*:\s*"([\d.]+)"/) ||
        html.match(/"salePrice"\s*:\s*\{[^}]*"minAmount"\s*:\s*\{[^}]*"value"\s*:\s*"([\d.]+)"/) ||
        html.match(/"price"\s*:\s*"US \$([\d.]+)"/) ||
        html.match(/US \$\s*([\d.]+)/);
      if (priceMatch) result.price = parseFloat(priceMatch[1]);

      const origMatch = html.match(/"originalPrice"\s*:\s*\{[^}]*"value"\s*:\s*"([\d.]+)"/);
      if (origMatch) result.comparePrice = parseFloat(origMatch[1]);

      // Currency
      const currMatch = html.match(/"currencyCode"\s*:\s*"([A-Z]{3})"/);
      if (currMatch) result.currency = currMatch[1];

      // Description
      const descMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
      if (descMatch) result.description = this.decodeHtml(descMatch[1]);

      // SKU / item ID
      const skuMatch = html.match(/item(\d{8,})/i) || url.match(/\/(\d{8,})\.html/);
      if (skuMatch) result.sku = `AE-${skuMatch[1]}`;

      // Shipping estimate
      const shippingMatch = html.match(/(\d+)-(\d+)\s*days?\s*delivery/i);
      if (shippingMatch) result.shippingDays = parseInt(shippingMatch[2]);

      // Stock
      if (html.includes('"skuStockStatus":"soldOut"') || html.includes('"quantity":0')) {
        result.stockStatus = "OUT_OF_STOCK";
      }

      // Fallback title from page <title>
      if (!result.title) {
        const t = html.match(/<title>([^<]+)<\/title>/i);
        if (t) result.title = t[1].replace(" - AliExpress", "").trim();
      }

      if (!result.title) throw new Error("Could not extract product title");
      return result;

    } catch (err: any) {
      logger.warn(`[Supplier] AliExpress scrape failed: ${err.message}`);
      // Try generic og: fallback
      return this.scrapeGeneric(url, "AliExpress");
    }
  }

  // ── Alibaba scraper ───────────────────────────────────────────────────────
  private async scrapeAlibaba(url: string): Promise<ScrapedProduct> {
    return this.scrapeGeneric(url, "Alibaba");
  }

  // ── Generic og:tags scraper (works for most e-commerce sites) ────────────
  async scrapeGeneric(url: string, supplierName?: string): Promise<ScrapedProduct> {
    const { data: html } = await axios.get(url, {
      headers: HEADERS,
      timeout: 12000,
      maxRedirects: 5,
    });

    const og = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]+)"`, "i"))
             || html.match(new RegExp(`<meta[^>]+content="([^"]+)"[^>]+property="${prop}"`, "i"));
      return m ? this.decodeHtml(m[1]) : "";
    };

    const title       = og("og:title") || this.extractTag(html, "title");
    const description = og("og:description");
    const imageUrl    = og("og:image");
    const priceStr    = og("product:price:amount") || og("og:price:amount");
    const currency    = og("product:price:currency") || og("og:price:currency") || "USD";

    // Try to find more images
    const extraImages = [...html.matchAll(/<img[^>]+(?:src|data-src)="(https[^"]+(?:jpg|jpeg|png|webp)[^"]*)"/gi)]
      .map(m => m[1])
      .filter(u => !u.includes("logo") && !u.includes("icon") && !u.includes("avatar"))
      .slice(0, 6);

    const images = [imageUrl, ...extraImages].filter(Boolean) as string[];

    if (!title) throw new Error(`Could not extract product info from ${url}`);

    return {
      title:       title.trim(),
      description: description || "",
      images:      [...new Set(images)].slice(0, 8),
      price:       priceStr ? parseFloat(priceStr) : 0,
      currency,
      variants:    [],
      stockStatus: "IN_STOCK",
      sourceUrl:   url,
      supplierName: supplierName || new URL(url).hostname.replace("www.", ""),
    };
  }

  // ── Auto-fulfillment: send order to supplier ──────────────────────────────
  async fulfillOrderByEmail(
    toEmail: string,
    supplierName: string,
    payload: FulfillmentPayload
  ): Promise<boolean> {
    try {
      // Import here to avoid circular dependency
      const { emailService } = await import("./email.service");

      const itemRows = payload.items.map(item =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
            ${item.name}${item.sku ? ` (SKU: ${item.sku})` : ""}
            ${item.supplierSku ? `<br><small style="color:#64748b;">Supplier SKU: ${item.supplierSku}</small>` : ""}
            ${item.supplierUrl ? `<br><a href="${item.supplierUrl}" style="color:#7c3aed;font-size:12px;">View on supplier site →</a>` : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;">$${item.price.toFixed(2)}</td>
        </tr>`
      ).join("");

      const addr = payload.shippingAddress || {};
      const addrStr = [addr.address, addr.city, addr.state, addr.country, addr.postalCode]
        .filter(Boolean).join(", ");

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 32px;">
      <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">📦 New Fulfillment Request</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">From ${payload.storeName} via DropOS</p>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;width:140px;">Order #</td><td style="padding:6px 0;font-weight:700;font-size:14px;">${payload.orderNumber}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Customer</td><td style="padding:6px 0;font-size:14px;">${payload.customerName}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:6px 0;font-size:14px;">${payload.customerEmail}</td></tr>
        ${payload.customerPhone ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Phone</td><td style="padding:6px 0;font-size:14px;">${payload.customerPhone}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Ship To</td><td style="padding:6px 0;font-size:14px;">${addrStr}</td></tr>
        ${payload.notes ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Notes</td><td style="padding:6px 0;font-size:14px;color:#f59e0b;">${payload.notes}</td></tr>` : ""}
      </table>

      <h3 style="font-size:15px;font-weight:700;margin:0 0 12px;color:#1e293b;">Items to Fulfil</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #f1f5f9;border-radius:10px;overflow:hidden;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">PRODUCT</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b;font-weight:600;">QTY</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b;font-weight:600;">UNIT PRICE</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#f8fafc;">
            <td colspan="2" style="padding:10px 12px;font-weight:700;font-size:14px;">Total</td>
            <td style="padding:10px 12px;font-weight:800;font-size:16px;text-align:right;color:#7c3aed;">$${payload.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size:13px;color:#94a3b8;margin:0;">
        Please process and ship to the address above. Reply to this email with your tracking number when shipped.
        Reference order # <strong>${payload.orderNumber}</strong> in all communications.
      </p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;">
      <p style="font-size:12px;color:#94a3b8;margin:0;">Powered by DropOS · Automated Fulfillment</p>
    </div>
  </div>
</body>
</html>`;

      await emailService.sendRaw({
        to:      toEmail,
        subject: `[FULFILLMENT] Order ${payload.orderNumber} — ${payload.storeName}`,
        html,
      });

      logger.info(`[Supplier] Fulfillment email sent to ${toEmail} for order ${payload.orderNumber}`);
      return true;
    } catch (err: any) {
      logger.error(`[Supplier] Fulfillment email failed: ${err.message}`);
      return false;
    }
  }

  async fulfillOrderByWebhook(webhookUrl: string, payload: FulfillmentPayload): Promise<boolean> {
    try {
      await axios.post(webhookUrl, payload, {
        headers: { "Content-Type": "application/json", "X-DropOS-Event": "order.fulfillment" },
        timeout: 10000,
      });
      logger.info(`[Supplier] Webhook sent to ${webhookUrl} for order ${payload.orderNumber}`);
      return true;
    } catch (err: any) {
      logger.error(`[Supplier] Webhook failed for ${webhookUrl}: ${err.message}`);
      return false;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private decodeHtml(str: string): string {
    return str
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  private extractTag(html: string, tag: string): string {
    const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, "i"));
    return m ? this.decodeHtml(m[1].trim()) : "";
  }
}

export const supplierService = new SupplierService();
