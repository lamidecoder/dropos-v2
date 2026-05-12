// src/components/store/templates/registry.ts
export type TemplateTier = "free" | "pro" | "advanced";

export interface TemplateConfig {
  id:          string;
  name:        string;
  description: string;
  tier:        TemplateTier;
  preview:     string;
  accentStyle: string;
}

export const TEMPLATES: TemplateConfig[] = [
  // ── FREE ────────────────────────────────────────────────────────────────
  { id:"classic",     name:"Classic",       description:"Clean, bright, timeless. Works for any product.", tier:"free",     preview:"⬜", accentStyle:"light" },
  { id:"dark-luxe",   name:"Dark Luxe",     description:"Dark background, glow accents. Premium feel.",    tier:"free",     preview:"⬛", accentStyle:"dark"  },

  // ── PRO ─────────────────────────────────────────────────────────────────
  { id:"minimal",     name:"Minimal",       description:"Ultra-clean, Helvetica precision. Product first.", tier:"pro",    preview:"◻️", accentStyle:"light" },
  { id:"minimal-pro", name:"Minimal Pro",   description:"Same as Minimal with advanced search.",           tier:"pro",    preview:"◾", accentStyle:"light" },
  { id:"boutique",    name:"Boutique",      description:"Playfair Display serif, warm tones. Fashion.",    tier:"pro",    preview:"🌸", accentStyle:"light" },
  { id:"bold",        name:"Bold",          description:"Impact font, brand-coloured hero. Demand attention.", tier:"pro", preview:"🔴", accentStyle:"light" },
  { id:"editorial",   name:"Editorial",     description:"Magazine feel with bold typography.",              tier:"pro",    preview:"📰", accentStyle:"light" },
  { id:"neon",        name:"Neon",          description:"Black background, glowing neon brand colour.",    tier:"pro",    preview:"💚", accentStyle:"dark"  },
  { id:"grid",        name:"Grid",          description:"Dense product grid, shop more at once.",          tier:"pro",    preview:"▦",  accentStyle:"light" },
  { id:"magazine",    name:"Magazine",      description:"Hero + editorial grid layout.",                   tier:"pro",    preview:"🗞️", accentStyle:"light" },

  // ── ADVANCED ─────────────────────────────────────────────────────────────
  { id:"glassmorphic",name:"Glassmorphic",  description:"Frosted glass cards on gradient background.",    tier:"advanced",preview:"🔷", accentStyle:"dark"  },
  { id:"vintage",     name:"Vintage",       description:"Warm tones, serif type, retro charm.",           tier:"advanced",preview:"🟤", accentStyle:"warm"  },
  { id:"ultra-dark",  name:"Ultra Dark",    description:"Near-black surfaces, sharp contrast, minimal.",  tier:"advanced",preview:"⚫", accentStyle:"dark"  },
  { id:"runway",      name:"Runway",        description:"Full-bleed editorial luxury fashion.",            tier:"advanced",preview:"🖤", accentStyle:"dark"  },
];

export const FREE_TEMPLATES     = TEMPLATES.filter(t => t.tier === "free");
export const PRO_TEMPLATES      = TEMPLATES.filter(t => t.tier === "pro");
export const ADVANCED_TEMPLATES = TEMPLATES.filter(t => t.tier === "advanced");

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}

export function getAvailableTemplates(plan: string): TemplateConfig[] {
  const p = plan?.toUpperCase();
  if (p === "ADVANCED" || p === "PRO" || p === "GROWTH") return [...FREE_TEMPLATES, ...PRO_TEMPLATES];
  if (p === "PREMIUM")  return TEMPLATES;
  return FREE_TEMPLATES;
}

export function canUseTemplate(templateId: string, plan: string): boolean {
  const available = getAvailableTemplates(plan);
  return available.some(t => t.id === templateId);
}
