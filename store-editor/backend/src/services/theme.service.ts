// ============================================================
// Theme Settings Service
// Path: backend/src/services/theme.service.ts
// ============================================================
import prisma from "../lib/prisma";

export interface ThemeSettings {
  template:     string;
  colors: {
    primary:    string;
    accent:     string;
    background: string;
    surface:    string;
    text:       string;
    textMuted:  string;
  };
  fonts: {
    heading: string;
    body:    string;
  };
  layout: {
    headerStyle:   "minimal" | "centered" | "fullwidth";
    productGrid:   2 | 3 | 4;
    roundness:     "sharp" | "soft" | "round";
    heroStyle:     "fullscreen" | "split" | "contained";
    footerColumns: 2 | 3 | 4;
  };
  sections: SectionConfig[];
  custom: {
    announcementBar:  string;
    showReviews:      boolean;
    showTrustBadges:  boolean;
    showLiveSales:    boolean;
    showStockCounter: boolean;
    socialLinks: {
      instagram: string;
      tiktok:    string;
      whatsapp:  string;
      twitter:   string;
    };
  };
}

export interface SectionConfig {
  id:      string;
  type:    string;
  enabled: boolean;
  order:   number;
  settings: Record<string, any>;
}

export const DEFAULT_THEMES: Record<string, Partial<ThemeSettings>> = {
  "Classic": {
    colors: { primary: "#1a1a1a", accent: "#c9a84c", background: "#ffffff", surface: "#f8f8f8", text: "#1a1a1a", textMuted: "#666666" },
    fonts: { heading: "Playfair Display", body: "Lato" },
    layout: { headerStyle: "centered", productGrid: 3, roundness: "soft", heroStyle: "fullscreen", footerColumns: 4 },
  },
  "Lagos Noir": {
    colors: { primary: "#000000", accent: "#d4af37", background: "#0a0a0a", surface: "#141414", text: "#f5f5f5", textMuted: "#888888" },
    fonts: { heading: "Cormorant Garamond", body: "DM Sans" },
    layout: { headerStyle: "minimal", productGrid: 3, roundness: "sharp", heroStyle: "fullscreen", footerColumns: 4 },
  },
  "Glow": {
    colors: { primary: "#c2185b", accent: "#f06292", background: "#fafafa", surface: "#fff0f3", text: "#1a1a1a", textMuted: "#757575" },
    fonts: { heading: "Abril Fatface", body: "Nunito" },
    layout: { headerStyle: "centered", productGrid: 3, roundness: "round", heroStyle: "split", footerColumns: 3 },
  },
  "Bold": {
    colors: { primary: "#7c3aed", accent: "#f59e0b", background: "#ffffff", surface: "#f3f4f6", text: "#111827", textMuted: "#6b7280" },
    fonts: { heading: "Bebas Neue", body: "Inter" },
    layout: { headerStyle: "fullwidth", productGrid: 4, roundness: "soft", heroStyle: "contained", footerColumns: 4 },
  },
};

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: "hero",           type: "hero",           enabled: true,  order: 0, settings: { heading: "Your Store Headline", subheading: "Your tagline here", buttonText: "Shop Now", overlay: 0.4 } },
  { id: "featured",       type: "featured_products", enabled: true, order: 1, settings: { title: "Featured Products", count: 8 } },
  { id: "announcement",   type: "announcement",   enabled: false, order: 2, settings: { text: "Free delivery on orders above ₦25,000", style: "marquee" } },
  { id: "trust_badges",   type: "trust_badges",   enabled: true,  order: 3, settings: {} },
  { id: "new_arrivals",   type: "new_arrivals",   enabled: true,  order: 4, settings: { title: "New Arrivals", count: 4 } },
  { id: "testimonials",   type: "testimonials",   enabled: true,  order: 5, settings: { title: "What Customers Say" } },
  { id: "newsletter",     type: "newsletter",     enabled: true,  order: 6, settings: { title: "Stay in the loop", subtitle: "Get the latest deals" } },
];

// ── Get theme settings ────────────────────────────────────────
export async function getThemeSettings(storeId: string): Promise<ThemeSettings> {
  const store = await prisma.store.findUnique({
    where:  { id: storeId },
    select: { themeSettings: true, country: true },
  });

  const saved = store?.themeSettings as any;
  const template = saved?.template || "Bold";
  const defaults = DEFAULT_THEMES[template] || DEFAULT_THEMES["Bold"];

  return {
    template,
    colors:   { ...defaults.colors, ...saved?.colors },
    fonts:    { ...defaults.fonts,  ...saved?.fonts },
    layout:   { ...defaults.layout, ...saved?.layout },
    sections: saved?.sections || DEFAULT_SECTIONS,
    custom: {
      announcementBar:  saved?.custom?.announcementBar  || "",
      showReviews:      saved?.custom?.showReviews      ?? true,
      showTrustBadges:  saved?.custom?.showTrustBadges  ?? true,
      showLiveSales:    saved?.custom?.showLiveSales     ?? true,
      showStockCounter: saved?.custom?.showStockCounter  ?? true,
      socialLinks: {
        instagram: saved?.custom?.socialLinks?.instagram || "",
        tiktok:    saved?.custom?.socialLinks?.tiktok    || "",
        whatsapp:  saved?.custom?.socialLinks?.whatsapp  || "",
        twitter:   saved?.custom?.socialLinks?.twitter   || "",
      },
    },
  };
}

// ── Save theme settings ───────────────────────────────────────
export async function saveThemeSettings(storeId: string, settings: Partial<ThemeSettings>): Promise<void> {
  await prisma.store.update({
    where: { id: storeId },
    data:  { themeSettings: settings as any },
  });
}

// ── Apply KAI theme instruction ───────────────────────────────
export async function applyKAIThemeCommand(
  storeId: string,
  instruction: string,
  currentSettings: ThemeSettings,
  apiKey: string
): Promise<{ settings: Partial<ThemeSettings>; explanation: string }> {

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type":      "application/json",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{
        role:    "user",
        content: `You are a design assistant for an ecommerce store builder.

Current settings:
${JSON.stringify({ colors: currentSettings.colors, fonts: currentSettings.fonts, layout: currentSettings.layout }, null, 2)}

Owner instruction: "${instruction}"

Apply this instruction by updating ONLY the relevant settings.
Return ONLY JSON with explanation:
{
  "changes": {
    "colors": { "accent": "#new_value" },
    "fonts":  { "heading": "New Font Name" },
    "layout": { "roundness": "round" }
  },
  "explanation": "One sentence describing what changed in plain English. No asterisks."
}

Only include the fields that actually need to change. Leave others out.
Font options: Playfair Display, Cormorant Garamond, Bebas Neue, Abril Fatface, Libre Baskerville, Josefin Sans, Raleway, DM Sans, Nunito, Lato
Roundness options: sharp, soft, round
Header style: minimal, centered, fullwidth
Hero style: fullscreen, split, contained
Grid: 2, 3, or 4`,
      }],
    }),
  });

  if (!response.ok) throw new Error("Theme AI failed");
  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const newSettings: Partial<ThemeSettings> = {};
    if (parsed.changes?.colors)  newSettings.colors  = { ...currentSettings.colors,  ...parsed.changes.colors };
    if (parsed.changes?.fonts)   newSettings.fonts   = { ...currentSettings.fonts,   ...parsed.changes.fonts };
    if (parsed.changes?.layout)  newSettings.layout  = { ...currentSettings.layout,  ...parsed.changes.layout };
    return { settings: newSettings, explanation: parsed.explanation || "Theme updated" };
  } catch {
    return { settings: {}, explanation: "I couldn't apply that change. Try being more specific." };
  }
}
