// KIRO Store Generator
// Merchant describes their business → KIRO generates complete store identity
// Returns: template, colors, headline, tagline, description, categories, announcement

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

interface StoreIdentity {
  templateId:     string;
  primaryColor:   string;
  accentColor:    string;
  fontFamily:     string;
  name?:          string;
  tagline:        string;
  description:    string;
  heroHeadline:   string;
  heroSubtext:    string;
  announcement:   string;
  categories:     string[];
  reasoning:      string;
}

const TEMPLATE_DESCRIPTIONS = `
Templates available:
- aurora (fashion, purple/violet, light) 
- obsidian (luxury goods, dark, high-end)
- verdant (beauty/wellness, green, fresh)
- atelier (art/handmade, warm brown, earthy)
- voltage (electronics/gadgets, red, energetic)
- prism (general/multi, purple, versatile)
- ember (streetwear/urban, dark red, edgy)
- nexus (tech/software, blue, professional)
- glow (skincare/beauty, pink, feminine)
- terra (organic/natural, sage green, earthy)
- ionic (sports/fitness, blue, athletic)
- artisan (crafts/handmade, brown, rustic)
- apex (gym/fitness, dark, intense)
- sage (wellness/yoga, green, calm)
- diamond (jewelry, blue-white, elegant)
- nova (cosmetics, dark pink, glamorous)
- dusk (lifestyle, dark purple, moody)
- kids (children, orange, playful)
- luxe (premium/luxury, dark brown, opulent)
- muse (accessories, deep red, feminine)
- pearl (bridal/wedding, grey, minimal)
- chrome (gadgets/tech, dark grey, sleek)
- bound (books/stationery, navy, intellectual)
- onyx (watches/timepieces, black, minimal luxury)
- blaze (shoes/footwear, dark red, bold)
- flora (plants/garden, dark green, natural)
- street (urban/streetwear, black, raw)
- kodiak (outdoors/adventure, brown, rugged)
`.trim();

export async function generateStoreIdentity(
  businessDescription: string,
  storeName?: string
): Promise<StoreIdentity> {
  const prompt = `You are KIRO, an AI commerce designer. A merchant has described their business and you must generate a complete store identity for them.

Business description: "${businessDescription}"
${storeName ? `Store name: ${storeName}` : ""}

${TEMPLATE_DESCRIPTIONS}

Generate a complete store identity. Return ONLY valid JSON, no markdown, no explanation:

{
  "templateId": "one of the template ids above",
  "primaryColor": "#hexcolor (choose carefully based on the brand personality)",
  "accentColor": "#hexcolor (complementary accent)",
  "fontFamily": "one of: DM Sans, Plus Jakarta Sans, Fraunces, Syne, Space Grotesk",
  "tagline": "short punchy tagline under 8 words",
  "description": "2 sentences describing what the store sells, written for customers",
  "heroHeadline": "bold compelling headline for the homepage hero, under 6 words",
  "heroSubtext": "one sentence expanding the hero, mentioning delivery or quality",
  "announcement": "optional announcement bar text (can be empty string) — e.g. free shipping promo",
  "categories": ["3-5 product category names relevant to this business"],
  "reasoning": "one sentence explaining your template and color choice"
}

Pick colors that genuinely match the brand. A children's toy store should not have dark colors. A luxury watch brand should not have bright pink. Think carefully.`;

  const response = await client.messages.create({
    model:      "claude-opus-4-6",
    max_tokens: 800,
    messages:   [{ role:"user", content:prompt }],
  });

  const text = response.content.find(b => b.type === "text")?.text || "";
  
  // Clean and parse
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as StoreIdentity;
  } catch {
    // Fallback identity
    return {
      templateId:   "prism",
      primaryColor: "#6B35E8",
      accentColor:  "#8B5CF6",
      fontFamily:   "Plus Jakarta Sans",
      tagline:      "Quality products, fast delivery.",
      description:  "Discover our curated selection of products, delivered straight to your door.",
      heroHeadline: "Shop what you love.",
      heroSubtext:  "Fast delivery across Nigeria and beyond.",
      announcement: "",
      categories:   ["New Arrivals", "Best Sellers", "Sale"],
      reasoning:    "Using versatile prism template as fallback.",
    };
  }
}
