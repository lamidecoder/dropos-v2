// src/routes/ai.routes.ts
import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth";
import { AppError } from "../utils/AppError";

// AI endpoints get tighter rate limiting — they're expensive
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 1000,          // 10 AI calls per minute per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many AI requests, please wait a moment." },
});

// Sanitize user input before interpolating into prompts (prevent injection)
function sanitizeForPrompt(input: string, maxLen = 200): string {
  return String(input)
    .replace(/[<>{}|\\]/g, "")  // strip chars that can alter prompt structure
    .slice(0, maxLen)
    .trim();
}

const router = Router();

// POST /api/ai/product-description
// Generates SEO-optimised product description from keywords/image URL
router.post("/product-description", authenticate, aiRateLimiter, async (req: Request, res: Response) => {
  const { productName, keywords, tone, imageUrl, category, targetAudience } = req.body;
  if (!productName) throw new AppError("productName required", 400);

  // Sanitize all user inputs before injecting into prompts
  const safeProductName    = sanitizeForPrompt(productName, 150);
  const safeCategory       = category       ? sanitizeForPrompt(category, 80)       : "";
  const safeTargetAudience = targetAudience ? sanitizeForPrompt(targetAudience, 100) : "";
  const safeKeywords       = Array.isArray(keywords)
    ? keywords.slice(0, 10).map((k: string) => sanitizeForPrompt(k, 40)).join(", ")
    : "";
  // imageUrl — only allow https URLs, no data: or file: URIs
  let safeImageUrl = "";
  if (imageUrl) {
    try {
      const u = new URL(imageUrl);
      if (u.protocol === "https:") safeImageUrl = u.href.slice(0, 500);
    } catch {}
  }

  const toneMap: Record<string, string> = {
    professional: "professional, polished, and authoritative",
    casual:       "friendly, conversational, and approachable",
    luxury:       "elegant, premium, and aspirational",
    energetic:    "bold, exciting, and action-oriented",
    minimalist:   "clean, simple, and concise",
  };

  const toneDesc = toneMap[tone] || toneMap.professional;

  const systemPrompt = `You are an expert ecommerce copywriter specializing in high-converting product descriptions. 
You write in a ${toneDesc} tone.
Output ONLY a JSON object with no markdown, no preamble, no backticks — just raw JSON.`;

  const userPrompt = `Write a compelling product description for:
Product: ${safeProductName}
${safeCategory ? `Category: ${safeCategory}` : ""}
${safeKeywords ? `Keywords: ${safeKeywords}` : ""}
${safeTargetAudience ? `Target audience: ${safeTargetAudience}` : ""}
${safeImageUrl ? `The product image URL is: ${safeImageUrl} (use visual cues if the product is identifiable)` : ""}

Return ONLY this JSON:
{
  "headline": "Catchy 6-10 word headline",
  "shortDescription": "1-2 sentence hook (under 120 chars)",
  "fullDescription": "Rich 3-4 paragraph description with benefits and features",
  "bulletPoints": ["benefit 1", "benefit 2", "benefit 3", "benefit 4", "benefit 5"],
  "seoTitle": "SEO optimised page title (under 60 chars)",
  "seoDescription": "Meta description (under 155 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  // Call Anthropic API — use env var key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AppError("AI service not configured", 503);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new AppError("AI generation failed: " + err, 500);
  }

  const data: any = await response.json();
  const text = data.content?.[0]?.text || "{}";

  let parsed: any;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    throw new AppError("AI returned invalid response", 500);
  }

  res.json({ success: true, data: parsed });
});

// POST /api/ai/product-tags
router.post("/product-tags", authenticate, aiRateLimiter, async (req: Request, res: Response) => {
  const { productName, description, category } = req.body;
  if (!productName) throw new AppError("productName required", 400);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AppError("AI service not configured", 503);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Generate 8-12 ecommerce search tags for: "${productName}". ${description ? "Description: " + description : ""} ${category ? "Category: " + category : ""}. Return ONLY a JSON array of lowercase strings. No explanation.`,
      }],
    }),
  });

  const data: any = await response.json();
  const text = data.content?.[0]?.text || "[]";
  let tags: string[] = [];
  try { tags = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch {}

  res.json({ success: true, data: { tags } });
});

// POST /api/ai/store-name
router.post("/store-name", authenticate, aiRateLimiter, async (req: Request, res: Response) => {
  const { niche, keywords, style } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new AppError("AI service not configured", 503);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `Generate 6 creative store name ideas for a ${niche || "dropshipping"} store. ${keywords ? "Keywords: " + keywords : ""} ${style ? "Style: " + style : ""}. Return ONLY a JSON array of objects: [{"name":"StoreName","tagline":"Short tagline","domain":"storename.com"}]. No explanation.`,
      }],
    }),
  });

  const data: any = await response.json();
  const text = data.content?.[0]?.text || "[]";
  let names: any[] = [];
  try { names = JSON.parse(text.replace(/```json|```/g, "").trim()); } catch {}

  res.json({ success: true, data: { names } });
});

export default router;
