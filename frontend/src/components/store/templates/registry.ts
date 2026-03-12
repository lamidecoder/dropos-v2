// src/components/store/templates/registry.ts

export type TemplateTier = "free" | "pro" | "advanced";

export interface TemplateConfig {
  id:          string;
  name:        string;
  description: string;
  tier:        TemplateTier;
  preview:     string;  // emoji or color
  accentStyle: string;
}

export const TEMPLATES: TemplateConfig[] = [
  // ── FREE (2) ────────────────────────────────────────────────────────────
  {
    id:          "classic",
    name:        "Classic",
    description: "Clean, bright, timeless. Works for any product.",
    tier:        "free",
    preview:     "⬜",
    accentStyle: "light",
  },
  {
    id:          "dark-luxe",
    name:        "Dark Luxe",
    description: "Dark background, gold accents. Premium feel.",
    tier:        "free",
    preview:     "⬛",
    accentStyle: "dark",
  },

  // ── PRO (8) ─────────────────────────────────────────────────────────────
  {
    id:          "bold",
    name:        "Bold",
    description: "Big typography, strong colors. Demand attention.",
    tier:        "pro",
    preview:     "🔴",
    accentStyle: "light",
  },
  {
    id:          "editorial",
    name:        "Editorial",
    description: "Magazine layout. Products as art.",
    tier:        "pro",
    preview:     "📰",
    accentStyle: "light",
  },
  {
    id:          "neon",
    name:        "Neon",
    description: "Dark with neon glow. Electric energy.",
    tier:        "pro",
    preview:     "💜",
    accentStyle: "dark",
  },
  {
    id:          "boutique",
    name:        "Boutique",
    description: "Soft, elegant, feminine. Fashion-forward.",
    tier:        "pro",
    preview:     "🌸",
    accentStyle: "light",
  },
  {
    id:          "minimal-pro",
    name:        "Minimal Pro",
    description: "Ultra-clean, lots of whitespace. Product first.",
    tier:        "pro",
    preview:     "◻️",
    accentStyle: "light",
  },
  {
    id:          "grid",
    name:        "Grid",
    description: "Masonry-inspired dense grid. Show more products.",
    tier:        "pro",
    preview:     "▦",
    accentStyle: "light",
  },
  {
    id:          "magazine",
    name:        "Magazine",
    description: "Hero product + editorial grid layout.",
    tier:        "pro",
    preview:     "🗞️",
    accentStyle: "light",
  },
  {
    id:          "split",
    name:        "Split",
    description: "Two-column hero. Bold left, product right.",
    tier:        "pro",
    preview:     "⬛⬜",
    accentStyle: "mixed",
  },

  // ── ADVANCED (adds 4 more) ───────────────────────────────────────────────
  {
    id:          "glassmorphic",
    name:        "Glassmorphic",
    description: "Frosted glass cards on gradient background.",
    tier:        "advanced",
    preview:     "🔷",
    accentStyle: "dark",
  },
  {
    id:          "vintage",
    name:        "Vintage",
    description: "Warm tones, serif type, retro charm.",
    tier:        "advanced",
    preview:     "🟤",
    accentStyle: "warm",
  },
  {
    id:          "ultra-dark",
    name:        "Ultra Dark",
    description: "Near-black surfaces, sharp contrast, minimal.",
    tier:        "advanced",
    preview:     "⚫",
    accentStyle: "dark",
  },
  {
    id:          "runway",
    name:        "Runway",
    description: "Full-bleed images, editorial luxury fashion.",
    tier:        "advanced",
    preview:     "🖤",
    accentStyle: "dark",
  },
];

export const FREE_TEMPLATES     = TEMPLATES.filter(t => t.tier === "free");
export const PRO_TEMPLATES      = TEMPLATES.filter(t => t.tier === "pro");
export const ADVANCED_TEMPLATES = TEMPLATES.filter(t => t.tier === "advanced");

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

// Which templates are available per plan
export function getAvailableTemplates(plan: string): TemplateConfig[] {
  const p = plan?.toUpperCase();
  if (p === "ADVANCED") return TEMPLATES;
  if (p === "PRO")      return [...FREE_TEMPLATES, ...PRO_TEMPLATES];
  return FREE_TEMPLATES;
}

export function canUseTemplate(templateId: string, plan: string): boolean {
  const template = getTemplate(templateId);
  const available = getAvailableTemplates(plan);
  return available.some(t => t.id === templateId);
}
