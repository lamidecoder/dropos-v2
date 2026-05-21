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

  // ── NEW TEMPLATES (Batch 2025)
  { id:"velvet", name:"Velvet", tier:"advanced", preview:"⚫", accentStyle:"dark", niche:"Luxury Fashion", mood:"Cinematic, opulent", description:"Full-bleed editorial luxury with parallax hero and gold accents. Perfect for high-end fashion." },
  { id:"street", name:"Street", tier:"pro", preview:"🔥", accentStyle:"bold", niche:"Streetwear, Hype", mood:"Raw, energetic", description:"Neo-brutalist hype culture design with marquee ticker and aggressive typography." },
  { id:"glow", name:"Glow", tier:"pro", preview:"✨", accentStyle:"light", niche:"Beauty, Cosmetics", mood:"Soft, premium", description:"Glassmorphic beauty design with floating product mosaic and social proof hero." },
  { id:"terra", name:"Terra", tier:"pro", preview:"🌍", accentStyle:"warm", niche:"African Fashion", mood:"Bold, cultural", description:"Rich African fashion template celebrating culture with earthy tones and editorial photography." },
  { id:"ionic", name:"Ionic", tier:"pro", preview:"⚡", accentStyle:"dark", niche:"Tech, Gadgets", mood:"Futuristic, sleek", description:"Dark tech template with animated scanlines, grid overlay, and cyan/blue neon accents." },
  { id:"artisan", name:"Artisan", tier:"free", preview:"🍞", accentStyle:"warm", niche:"Food, Bakery", mood:"Warm, organic", description:"Warm artisan food template with organic shapes and hand-crafted visual identity." },
  { id:"apex", name:"Apex", tier:"pro", preview:"💪", accentStyle:"dark", niche:"Fitness, Supplements", mood:"Intense, bold", description:"High-intensity fitness template with neon green accents and aggressive typography." },
  { id:"sage", name:"Sage", tier:"pro", preview:"🌿", accentStyle:"light", niche:"Home, Interior", mood:"Minimal, organic", description:"Swiss-minimal home decor template with architectural grid and botanical aesthetics." },
  { id:"diamond", name:"Diamond", tier:"advanced", preview:"💎", accentStyle:"dark", niche:"Jewelry, Luxury", mood:"Ultra-premium, dark", description:"Dark velvet jewelry template with animated sparkles and editorial product display." },
  { id:"kodiak", name:"Kodiak", tier:"pro", preview:"👟", accentStyle:"bold", niche:"Sneakers, Footwear", mood:"Urban, editorial", description:"Bold sneaker culture template with split hero and brutalist product grid." },
  { id:"nova", name:"Nova", tier:"advanced", preview:"🌌", accentStyle:"dark", niche:"Digital, Gaming", mood:"Cyberpunk, neon", description:"Cyberpunk-inspired template with glitch effects, scanlines, and immersive neon aesthetics." },
  { id:"dusk", name:"Dusk", tier:"advanced", preview:"🏨", accentStyle:"warm", niche:"Hotel, Travel", mood:"Luxury, warm", description:"Warm hospitality template with full-bleed hero carousel and booking-focused layout." },
  { id:"kids", name:"Kids", tier:"free", preview:"🎈", accentStyle:"light", niche:"Kids, Toys", mood:"Playful, colorful", description:"Joyful children's store with bouncing emojis, rounded cards, and rainbow color system." },

  // ── ADVANCED ─────────────────────────────────────────────────────────────────
  { id:"prism",       name:"Prism",       tier:"advanced", preview:"💎", accentStyle:"dark",   niche:"Luxury, Beauty", mood:"Glass, gradient",    description:"Glassmorphic cards on a gradient background. Immersive and ultra-premium." },
];

export const FREE_TEMPLATES     = TEMPLATES.filter(t => t.tier === "free");
export const PRO_TEMPLATES      = TEMPLATES.filter(t => t.tier === "pro");
export const ADVANCED_TEMPLATES = TEMPLATES.filter(t => t.tier === "advanced");

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find(t => t.id === id) || TEMPLATES[0];
}
