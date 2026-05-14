// src/components/store/templates/registry.ts
export type TemplateTier = "free" | "pro" | "advanced";
export interface TemplateConfig {
  id: string; name: string; description: string;
  tier: TemplateTier; preview: string; accentStyle: string;
  niche?: string; mood?: string;
}

export const TEMPLATES: TemplateConfig[] = [
  // ── FREE ───────────────────────────────────────────────────────────────────
  { id:"aurora",      name:"Aurora",      tier:"free",     preview:"🌅", accentStyle:"light",  niche:"Any",           mood:"Modern, vibrant",    description:"Premium classic with animated hero, product grid, and trust badges. Works for any niche." },
  { id:"obsidian",    name:"Obsidian",    tier:"free",     preview:"🌑", accentStyle:"dark",   niche:"Luxury, Fashion",mood:"Dark, cinematic",    description:"Dark luxury with glowing accents and cinematic hero. Elegant and premium." },

  // ── PRO ─────────────────────────────────────────────────────────────────────
  { id:"verdant",     name:"Verdant",     tier:"pro",      preview:"◻️", accentStyle:"light",  niche:"Any",           mood:"Clean, Swiss",       description:"Ultra-minimal Swiss editorial precision. Product-first with dense grid layout." },
  { id:"atelier",     name:"Atelier",     tier:"pro",      preview:"🌸", accentStyle:"warm",   niche:"Fashion, Beauty",mood:"Boutique, editorial",description:"Serif typography, warm tones, editorial feel. Perfect for fashion and beauty brands." },
  { id:"voltage",     name:"Voltage",     tier:"pro",      preview:"⚡", accentStyle:"bold",   niche:"Streetwear, Sports",mood:"Bold, energetic",  description:"Full-bleed bold hero, uppercase energy. Perfect for streetwear and hype brands." },
  { id:"ember",       name:"Ember",       tier:"pro",      preview:"🍂", accentStyle:"warm",   niche:"Handmade, Food", mood:"Warm, organic",      description:"Warm organic design for artisan, handmade, and food & beverage brands." },
  { id:"nexus",       name:"Nexus",       tier:"pro",      preview:"🔷", accentStyle:"dark",   niche:"Tech, Electronics",mood:"Futuristic, sleek", description:"Grid lines, cyan accents, and futuristic UI for tech and electronics stores." },

  // ── ADVANCED ─────────────────────────────────────────────────────────────────
  { id:"prism",       name:"Prism",       tier:"advanced", preview:"💎", accentStyle:"dark",   niche:"Luxury, Beauty", mood:"Glass, gradient",    description:"Glassmorphic cards on a gradient background. Immersive and ultra-premium." },
];

export const FREE_TEMPLATES     = TEMPLATES.filter(t => t.tier === "free");
export const PRO_TEMPLATES      = TEMPLATES.filter(t => t.tier === "pro");
export const ADVANCED_TEMPLATES = TEMPLATES.filter(t => t.tier === "advanced");

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
