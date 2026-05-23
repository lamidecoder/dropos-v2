// DropOS Template Registry — organized by industry vertical
// Each template is designed for a specific business type, not just aesthetics

export interface TemplateConfig {
  id:          string;
  name:        string;
  tier:        "free" | "pro" | "advanced";
  preview:     string;   // emoji
  niche:       string;   // display category
  industry:    string;   // grouping key
  mood:        string;   // aesthetic description
  description: string;
  dark:        boolean;  // dark theme?
  previewImg?: string;   // Unsplash preview
}

export const INDUSTRY_GROUPS = [
  { key: "retail",      label: "🛍️ Retail & Fashion",      desc: "Clothing, accessories, general merchandise" },
  { key: "beauty",      label: "💄 Beauty & Wellness",      desc: "Cosmetics, skincare, spa, health" },
  { key: "food",        label: "🍽️ Food & Hospitality",     desc: "Restaurants, cafés, bakeries, catering" },
  { key: "luxury",      label: "💎 Luxury & Premium",       desc: "Jewelry, watches, high-end goods" },
  { key: "tech",        label: "⚡ Tech & Digital",         desc: "Gadgets, software, digital products" },
  { key: "fitness",     label: "🏋️ Fitness & Sports",      desc: "Gyms, supplements, sports gear" },
  { key: "home",        label: "🏠 Home & Living",          desc: "Furniture, decor, plants" },
  { key: "culture",     label: "🌍 Culture & Arts",         desc: "African fashion, books, music, creative" },
  { key: "services",    label: "🏢 Services & Business",    desc: "Real estate, agencies, automotive" },
  { key: "travel",      label: "✈️ Travel & Hospitality",   desc: "Hotels, travel, experiences" },
  { key: "kids",        label: "🎈 Kids & Family",          desc: "Toys, children's clothing, family" },
];

export const TEMPLATES: TemplateConfig[] = [
  // ── RETAIL & FASHION ───────────────────────────────────────────────────────
  { id:"aurora",   name:"Aurora",   tier:"free",     preview:"✨", industry:"retail",   niche:"Fashion",        mood:"Clean, modern",       dark:false, description:"The default DropOS template. Clean layout, great for any product type. Perfect starting point for new stores." },
  { id:"velvet",   name:"Velvet",   tier:"advanced", preview:"⚫", industry:"retail",   niche:"Luxury Fashion", mood:"Cinematic, opulent",  dark:true,  description:"Full-bleed cinematic hero with gold accents. Designed for high-end fashion and luxury goods." },
  { id:"street",   name:"Street",   tier:"pro",      preview:"🔥", industry:"retail",   niche:"Streetwear",     mood:"Raw, bold",           dark:false, description:"Neo-brutalist hype culture design. Built for streetwear drops, limited edition releases, and hype brands." },
  { id:"atelier",  name:"Atelier",  tier:"pro",      preview:"🎨", industry:"retail",   niche:"Boutique",       mood:"Elegant, editorial",  dark:false, description:"Editorial boutique layout with large photography and refined typography for curated fashion stores." },
  { id:"onyx",     name:"Onyx",     tier:"pro",      preview:"◼", industry:"retail",   niche:"Minimal",        mood:"Minimal, monochrome", dark:false, description:"Ultra-minimal monochrome grid. Every product front and center with zero distractions." },
  { id:"terra",    name:"Terra",    tier:"pro",      preview:"🌍", industry:"retail",   niche:"African Fashion", mood:"Bold, cultural",     dark:false, description:"Rich African fashion template celebrating culture with earthy tones and editorial photography." },
  { id:"kodiak",   name:"Kodiak",   tier:"pro",      preview:"👟", industry:"retail",   niche:"Sneakers",       mood:"Urban, editorial",    dark:false, description:"Split hero with bold typography built for sneaker and footwear brands." },

  // ── BEAUTY & WELLNESS ───────────────────────────────────────────────────────
  { id:"glow",     name:"Glow",     tier:"pro",      preview:"✨", industry:"beauty",   niche:"Cosmetics",      mood:"Soft, premium",       dark:false, description:"Glassmorphic beauty design with floating product mosaic. Built for cosmetics and makeup brands." },
  { id:"pearl",    name:"Pearl",    tier:"advanced", preview:"🤍", industry:"beauty",   niche:"Skincare",       mood:"Luxury, spa",         dark:false, description:"Premium skincare template with EB Garamond typography. Clean, clinical luxury that converts." },
  { id:"artisan",  name:"Artisan",  tier:"free",     preview:"🍞", industry:"beauty",   niche:"Natural Beauty", mood:"Warm, organic",       dark:false, description:"Warm organic design for natural beauty, wellness, and artisan products." },
  { id:"flora",    name:"Flora",    tier:"pro",      preview:"🌿", industry:"beauty",   niche:"Botanicals",     mood:"Nature, organic",     dark:false, description:"Plant and botanical store template with organic shapes and sustainable brand identity." },

  // ── FOOD & HOSPITALITY ──────────────────────────────────────────────────────
  { id:"ember",    name:"Ember",    tier:"free",     preview:"🍽️", industry:"food",     niche:"Restaurant",     mood:"Warm, inviting",      dark:false, description:"Warm restaurant template with menu layout, opening hours, and food photography focus." },
  { id:"artisan",  name:"Artisan",  tier:"free",     preview:"🥐", industry:"food",     niche:"Bakery/Café",    mood:"Cozy, artisan",       dark:false, description:"Handcrafted bakery aesthetic with organic shapes and warm typography for cafés and food businesses." },
  { id:"verdant",  name:"Verdant",  tier:"pro",      preview:"🌱", industry:"food",     niche:"Organic Food",   mood:"Fresh, healthy",      dark:false, description:"Clean organic food template with botanical accents. Great for health food, farm-to-table, organic stores." },

  // ── LUXURY & PREMIUM ────────────────────────────────────────────────────────
  { id:"diamond",  name:"Diamond",  tier:"advanced", preview:"💎", industry:"luxury",   niche:"Jewelry",        mood:"Ultra-premium, dark",  dark:true,  description:"Dark velvet jewelry template with animated sparkles. The gold standard for luxury goods." },
  { id:"obsidian", name:"Obsidian", tier:"advanced", preview:"🖤", industry:"luxury",   niche:"Dark Luxury",    mood:"Sleek, premium",       dark:true,  description:"Deep dark luxury template with violet accents. Premium product showcase with high contrast." },
  { id:"luxe",     name:"Luxe",     tier:"advanced", preview:"🏛️", industry:"luxury",   niche:"Premium/RE",     mood:"Sophisticated, dark",  dark:true,  description:"Cinematic dark template for premium goods, real estate, and exclusive services." },
  { id:"dusk",     name:"Dusk",     tier:"advanced", preview:"🏨", industry:"luxury",   niche:"Hotels",         mood:"Warm luxury",          dark:false, description:"Warm hospitality template with full-bleed carousel. Built for hotels, villas, and booking businesses." },

  // ── TECH & DIGITAL ──────────────────────────────────────────────────────────
  { id:"ionic",    name:"Ionic",    tier:"pro",      preview:"⚡", industry:"tech",     niche:"Gadgets",        mood:"Futuristic, sleek",    dark:true,  description:"Dark tech template with animated scanlines and cyan neon for electronics and gadget stores." },
  { id:"nova",     name:"Nova",     tier:"advanced", preview:"🌌", industry:"tech",     niche:"Digital/Gaming", mood:"Cyberpunk, neon",      dark:true,  description:"Cyberpunk-inspired with glitch effects and neon aesthetics for gaming and digital products." },
  { id:"blaze",    name:"Blaze",    tier:"pro",      preview:"🎮", industry:"tech",     niche:"Gaming",         mood:"Aggressive, red neon", dark:true,  description:"High-intensity gaming template with red neon and scanline effects for esports and gaming brands." },
  { id:"muse",     name:"Muse",     tier:"pro",      preview:"🎨", industry:"tech",     niche:"Creative Agency", mood:"Bold, editorial",     dark:false, description:"Editorial creative agency template with animated ticker and masonry grid for digital products." },
  { id:"nexus",    name:"Nexus",    tier:"free",     preview:"📱", industry:"tech",     niche:"Electronics",    mood:"Modern, minimal",     dark:false, description:"Clean electronics store template with feature-focused product layouts." },

  // ── FITNESS & SPORTS ────────────────────────────────────────────────────────
  { id:"apex",     name:"Apex",     tier:"pro",      preview:"💪", industry:"fitness",  niche:"Supplements",    mood:"Intense, bold",       dark:true,  description:"High-intensity fitness template with neon green and aggressive typography for gyms and supplements." },
  { id:"chrome",   name:"Chrome",   tier:"pro",      preview:"🚗", industry:"fitness",  niche:"Automotive",     mood:"Metallic, masculine",  dark:true,  description:"Bold automotive template for car dealerships, auto parts, and vehicle businesses." },
  { id:"voltage",  name:"Voltage",  tier:"pro",      preview:"⚡", industry:"fitness",  niche:"Sports",         mood:"High energy",         dark:true,  description:"Electric sports template with bold colors and dynamic layouts for sports and active brands." },

  // ── HOME & LIVING ───────────────────────────────────────────────────────────
  { id:"sage",     name:"Sage",     tier:"pro",      preview:"🌿", industry:"home",     niche:"Interior",       mood:"Minimal, organic",    dark:false, description:"Swiss-minimal home decor with architectural grid and botanical aesthetics." },
  { id:"haven",    name:"Haven",    tier:"pro",      preview:"🏠", industry:"home",     niche:"Furniture",      mood:"Warm, comfortable",   dark:false, description:"Warm home living template with editorial room photography and cozy aesthetic." },
  { id:"flora",    name:"Flora",    tier:"pro",      preview:"🌱", industry:"home",     niche:"Plants",         mood:"Nature, fresh",       dark:false, description:"Plant and botanical store with organic shapes and green palette." },

  // ── CULTURE & ARTS ──────────────────────────────────────────────────────────
  { id:"terra",    name:"Terra",    tier:"pro",      preview:"🌍", industry:"culture",  niche:"African Fashion", mood:"Bold, cultural",     dark:false, description:"Celebrates African culture with earthy rich tones, Fraunces serif, and editorial photography." },
  { id:"bound",    name:"Bound",    tier:"pro",      preview:"📚", industry:"culture",  niche:"Books",          mood:"Literary, warm",      dark:false, description:"Bookstore template with literary warmth, book spine grid, and intellectual aesthetic." },
  { id:"prism",    name:"Prism",    tier:"pro",      preview:"🎵", industry:"culture",  niche:"Music",          mood:"Vibrant, creative",   dark:true,  description:"Bold music and entertainment template with vibrant gradients and dynamic layouts." },

  // ── SERVICES & BUSINESS ─────────────────────────────────────────────────────
  { id:"luxe",     name:"Luxe",     tier:"advanced", preview:"🏢", industry:"services", niche:"Real Estate",    mood:"Premium, dark",       dark:true,  description:"Premium dark template for real estate, professional services, and high-end businesses." },
  { id:"muse",     name:"Muse",     tier:"pro",      preview:"💼", industry:"services", niche:"Agency",         mood:"Creative, editorial", dark:false, description:"Portfolio and agency template with editorial masonry grid for creative businesses." },
  { id:"chrome",   name:"Chrome",   tier:"pro",      preview:"🚗", industry:"services", niche:"Automotive",     mood:"Bold, industrial",    dark:true,  description:"Automotive dealership template with cinematic photography and bold CTAs." },

  // ── TRAVEL & HOSPITALITY ────────────────────────────────────────────────────
  { id:"dusk",     name:"Dusk",     tier:"advanced", preview:"🌅", industry:"travel",   niche:"Hotels",         mood:"Warm, cinematic",     dark:false, description:"Full-bleed hero carousel for hotels, resorts, and travel businesses." },
  { id:"aurora",   name:"Aurora",   tier:"free",     preview:"✈️", industry:"travel",   niche:"Travel",         mood:"Clean, open",         dark:false, description:"Clean versatile template adaptable for travel agencies and experience businesses." },

  // ── KIDS & FAMILY ───────────────────────────────────────────────────────────
  { id:"kids",     name:"Kids",     tier:"free",     preview:"🎈", industry:"kids",     niche:"Children's",     mood:"Playful, colorful",   dark:false, description:"Joyful children's store with bouncing animations, rainbow cards, and pure fun." },
];

// Get unique templates (deduplicated by id)
const seen = new Set<string>();
export const UNIQUE_TEMPLATES = TEMPLATES.filter(t => {
  if (seen.has(t.id)) return false;
  seen.add(t.id);
  return true;
});

export const getTemplatesByIndustry = (industry: string) =>
  TEMPLATES.filter(t => t.industry === industry);
