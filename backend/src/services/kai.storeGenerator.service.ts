// KIRO Store Generator
// Merchant describes their business → KIRO generates complete store identity

interface StoreIdentity {
  templateId:   string;
  primaryColor: string;
  accentColor:  string;
  fontFamily:   string;
  tagline:      string;
  description:  string;
  heroHeadline: string;
  heroSubtext:  string;
  announcement: string;
  categories:   string[];
  reasoning:    string;
}

const TEMPLATE_DESCRIPTIONS = `
Templates (id → niche, color tone, dark/light):
aurora→fashion,purple,light | obsidian→luxury,dark,dark | verdant→beauty,green,light
atelier→art/crafts,warm-brown,light | voltage→electronics,red,dark | prism→general,purple,dark
ember→streetwear,dark-red,dark | nexus→tech,blue,dark | glow→skincare,pink,light
terra→organic,sage,light | ionic→sports,blue,dark | artisan→handmade,brown,light
apex→gym,dark,dark | sage→wellness,green,light | diamond→jewelry,blue,light
nova→cosmetics,pink-dark,dark | dusk→lifestyle,purple,dark | kids→children,orange,light
luxe→premium,dark-brown,dark | muse→accessories,deep-red,light | pearl→bridal,grey,light
chrome→gadgets,dark-grey,dark | bound→books,navy,light | onyx→watches,black,dark
blaze→shoes,dark-red,dark | flora→plants,green,light | street→urban,black,dark | kodiak→outdoors,brown,light
`.trim();

export async function generateStoreIdentity(
  businessDescription: string,
  storeName?: string
): Promise<StoreIdentity> {
  const prompt = `You are KIRO, an AI commerce designer. A merchant described their business. Generate a complete store identity.

Business: "${businessDescription}"
${storeName ? `Store name: ${storeName}` : ""}

${TEMPLATE_DESCRIPTIONS}

Return ONLY valid JSON (no markdown, no explanation):
{
  "templateId": "one template id from list above",
  "primaryColor": "#hexcolor matching brand personality",
  "accentColor": "#hexcolor complementary accent",
  "fontFamily": "one of: DM Sans, Plus Jakarta Sans, Fraunces, Syne, Space Grotesk",
  "tagline": "punchy tagline under 8 words",
  "description": "2 sentences for customers describing what is sold",
  "heroHeadline": "bold homepage hero headline under 6 words",
  "heroSubtext": "one sentence expanding hero, mention delivery or quality",
  "announcement": "optional announcement bar text or empty string",
  "categories": ["3-5 product category names"],
  "reasoning": "one sentence on template and color choice"
}

Be specific to their niche. Children's store = bright colors. Luxury = dark/muted. Skincare = soft pastels.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json() as any;
    const text = data.content?.find((b: any) => b.type === "text")?.text || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as StoreIdentity;
  } catch {
    // Fallback
    return {
      templateId:   "prism",
      primaryColor: "#6B35E8",
      accentColor:  "#8B5CF6",
      fontFamily:   "Plus Jakarta Sans",
      tagline:      "Quality products, fast delivery.",
      description:  "Discover our curated selection of products, delivered to your door.",
      heroHeadline: "Shop what you love.",
      heroSubtext:  "Fast delivery across Nigeria and beyond.",
      announcement: "",
      categories:   ["New Arrivals", "Best Sellers", "Sale"],
      reasoning:    "Using versatile prism template as default.",
    };
  }
}
