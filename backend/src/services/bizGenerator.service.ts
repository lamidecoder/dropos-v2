// DropOS Zero-to-Business Generator
// For people starting from scratch — KIRO picks niche, finds products,
// sets up the entire store, and enables auto-fulfillment.
// User just tells us what they're interested in or their budget.

import { prisma } from "../config/database";

interface BizGenRequest {
  userId:      string;
  interest?:   string;   // "I like fashion" / "technology" / "home decor"
  budget?:     number;   // Starting budget in NGN
  experience?: "none" | "some" | "experienced";
  location?:   string;   // "Lagos" / "Abuja" etc
}

interface GeneratedBusiness {
  niche:         string;
  storeName:     string;
  storeSlug:     string;
  tagline:       string;
  description:   string;
  heroHeadline:  string;
  templateId:    string;
  primaryColor:  string;
  categories:    string[];
  targetMarket:  string;
  whyThisNiche:  string;
  estimatedProfit: string;
  suggestedProducts: SuggestedProduct[];
}

interface SuggestedProduct {
  name:          string;
  searchQuery:   string;  // What to search on AliExpress
  targetPrice:   number;  // Sell at this price in NGN
  costEstimate:  number;  // Buy from supplier at this price
  margin:        number;  // Profit margin %
  why:           string;  // Why this product
}

export async function generateBusiness(req: BizGenRequest): Promise<GeneratedBusiness> {
  const prompt = buildBizGenPrompt(req);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":    "application/json",
      "x-api-key":       process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-opus-4-6",
      max_tokens: 2000,
      messages:   [{ role:"user", content:prompt }],
    }),
  });

  const data  = await res.json() as any;
  const text  = data.content?.[0]?.text || "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as GeneratedBusiness;
  } catch {
    return getDefaultBusiness(req);
  }
}

function buildBizGenPrompt(req: BizGenRequest): string {
  const budgetNote = req.budget
    ? `Starting budget: ₦${req.budget.toLocaleString()}. Pick products priced so they can start with 5-10 units.`
    : "Assume modest starting budget of ₦50,000-₦100,000.";

  return `You are KIRO, an AI business strategist. A person wants to start a dropshipping business in Nigeria but doesn't know what to sell.

Their input: "${req.interest || "I want to start a business and make money online"}"
Experience: ${req.experience || "none"}
Location: ${req.location || "Nigeria"}
${budgetNote}

Research the Nigerian e-commerce market and generate a complete, realistic, profitable business for them to start TODAY using dropshipping from AliExpress/CJDropshipping.

Consider what's actually selling well in Nigeria right now:
- Mobile phone accessories (huge demand, low competition)
- Affordable fashion (always sells)
- Kitchen gadgets and home appliances
- Beauty and skincare
- Baby products
- Fitness equipment
- Electronics accessories
- Household items

Return ONLY valid JSON:
{
  "niche": "specific niche name (e.g. 'Phone Accessories & Gadgets')",
  "storeName": "catchy store name (2-3 words, brandable)",
  "storeSlug": "lowercase-hyphenated version of store name",
  "tagline": "punchy tagline under 8 words",
  "description": "2-sentence store description for customers",
  "heroHeadline": "bold 5-word homepage headline",
  "templateId": "one of: aurora, voltage, prism, glow, terra, ionic, nova, kids, chrome, kodiak",
  "primaryColor": "#hexcolor matching the brand",
  "categories": ["4 product category names"],
  "targetMarket": "describe the target customer in 1 sentence",
  "whyThisNiche": "1-2 sentences on why this niche is profitable in Nigeria right now",
  "estimatedProfit": "realistic monthly profit estimate for first 3 months",
  "suggestedProducts": [
    {
      "name": "product name",
      "searchQuery": "exact AliExpress search query to find this product",
      "targetPrice": 8500,
      "costEstimate": 2500,
      "margin": 70,
      "why": "one sentence why this product sells well"
    }
  ]
}

Suggest exactly 12 products. Make sure margins are realistic (40-80% after shipping). Prices in Nigerian Naira.`;
}

// Apply the generated business to an actual store
export async function applyGeneratedBusiness(storeId: string, biz: GeneratedBusiness): Promise<void> {
  await prisma.store.update({
    where: { id:storeId },
    data: {
      name:        biz.storeName,
      slug:        biz.storeSlug,
      tagline:     biz.tagline,
      description: biz.description,
      templateId:  biz.templateId,
      theme:       biz.templateId,
      primaryColor:biz.primaryColor,
    } as any,
  });
}

// Import the suggested products into the store
export async function importGeneratedProducts(
  storeId: string,
  products: SuggestedProduct[],
  userId: string
): Promise<{ created: number; failed: number }> {
  let created = 0, failed = 0;

  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          storeId,
          name:           p.name,
          price:          p.targetPrice,
          compareAtPrice: Math.round(p.targetPrice * 1.3),
          description:    p.why,
          status:         "ACTIVE" as any,
          images:         [],
          inventory:      0,
          trackInventory: false,
          costPrice:      p.costEstimate,
          tags:           [p.searchQuery],
        } as any,
      });
      created++;
    } catch { failed++; }
  }
  return { created, failed };
}

function getDefaultBusiness(req: BizGenRequest): GeneratedBusiness {
  return {
    niche:          "Phone Accessories & Gadgets",
    storeName:      "TechVault",
    storeSlug:      "techvault",
    tagline:        "Every gadget you need.",
    description:    "Premium phone accessories and gadgets at unbeatable prices, delivered across Nigeria.",
    heroHeadline:   "Upgrade your tech game.",
    templateId:     "voltage",
    primaryColor:   "#EF4444",
    categories:     ["Phone Cases", "Chargers & Cables", "Earphones", "Smart Gadgets"],
    targetMarket:   "Nigerian tech enthusiasts aged 18-35 looking for affordable quality accessories",
    whyThisNiche:   "Nigeria has 109 million smartphone users. Phone accessories have high demand, small package sizes (cheap shipping), and 60-80% margins.",
    estimatedProfit:"₦40,000-₦120,000/month in months 1-3 with consistent marketing",
    suggestedProducts: [
      { name:"Magsafe Wireless Charger 15W",        searchQuery:"magsafe wireless charger 15w fast",         targetPrice:6500,  costEstimate:1800, margin:72, why:"Every iPhone user wants one, ships in small box" },
      { name:"Transparent Phone Case iPhone 15",    searchQuery:"clear transparent iphone 15 case shockproof", targetPrice:3500, costEstimate:800,  margin:77, why:"High volume, multiple variants, repeat purchases" },
      { name:"Bluetooth Earbuds TWS 2024",          searchQuery:"tws bluetooth 5.3 earbuds noise cancelling",  targetPrice:8500, costEstimate:2500, margin:71, why:"Every Nigerian in 18-35 range owns or wants these" },
      { name:"Fast Charging Cable 3-in-1",          searchQuery:"3 in 1 fast charging cable usb c lightning",  targetPrice:4500, costEstimate:1200, margin:73, why:"Everyone needs cables. Repeat purchase item" },
      { name:"Phone Stand Adjustable",              searchQuery:"adjustable phone stand holder desktop",        targetPrice:3200, costEstimate:900,  margin:72, why:"WFH culture drives demand. Impulse buy" },
      { name:"Screen Protector Tempered Glass",     searchQuery:"tempered glass screen protector samsung",     targetPrice:2500, costEstimate:500,  margin:80, why:"Highest margin item. Pack of 2" },
      { name:"Portable Power Bank 20000mAh",        searchQuery:"20000mah power bank fast charge lightweight", targetPrice:14500, costEstimate:4500, margin:69, why:"Unstable NEPA power = every Nigerian needs one" },
      { name:"Car Phone Mount Magnetic",            searchQuery:"magnetic car phone holder dashboard",         targetPrice:4200, costEstimate:1100, margin:74, why:"Lagos traffic = huge demand for car accessories" },
      { name:"Mini Bluetooth Speaker",              searchQuery:"mini portable bluetooth speaker waterproof",  targetPrice:7500, costEstimate:2200, margin:71, why:"Gift item. High repeat purchases" },
      { name:"USB-C Hub 7-in-1",                   searchQuery:"usb c hub 7 in 1 hdmi laptop hub",            targetPrice:12000, costEstimate:3500, margin:71, why:"MacBook and laptop users spend on peripherals" },
      { name:"Ring Light 10 inch Selfie",           searchQuery:"10 inch ring light selfie tiktok portable",   targetPrice:8500, costEstimate:2500, margin:71, why:"TikTok creators are everywhere. Fast growing" },
      { name:"Smartwatch Fitness Tracker",          searchQuery:"smart watch fitness tracker blood oxygen 2024", targetPrice:16500, costEstimate:5000, margin:70, why:"Huge demand from gym/fitness crowd" },
    ],
  };
}
