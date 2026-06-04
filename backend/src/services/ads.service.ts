// DropOS Ads Service
// Powers the Ad Studio — KIRO-generated ad content + TikTok/Meta integration
// Phase 1: AI generates hooks, scripts, captions, targeting suggestions
// Phase 2 (after platform approval): Direct campaign creation via API

import { prisma } from "../config/database";

type AdPlatform = "tiktok" | "instagram" | "facebook" | "twitter" | "whatsapp";
type AdFormat   = "video_script" | "image_ad" | "carousel" | "story" | "reel";

interface AdBriefRequest {
  storeId:    string;
  productId?: string;
  platform:   AdPlatform;
  format:     AdFormat;
  goal:       "sales" | "traffic" | "awareness" | "engagement";
  budget?:    number;
  targetAudience?: string;
}

// Generate ad content using KIRO (Claude)
export async function generateAdContent(req: AdBriefRequest): Promise<any> {
  const store   = await prisma.store.findUnique({ where:{ id:req.storeId } });
  const product = req.productId
    ? await prisma.product.findUnique({ where:{ id:req.productId } })
    : null;

  const context = product
    ? `Product: ${product.name}, Price: ₦${product.price}, Description: ${(product as any).description?.slice(0,200)}`
    : `Store: ${store?.name}, Tagline: ${(store as any).tagline || ""}`;

  const prompt = buildAdPrompt(req, context, store?.name || "");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-6",
      max_tokens: 1500,
      messages: [{ role:"user", content:prompt }],
    }),
  });

  const data = await res.json() as any;
  const text = data.content?.[0]?.text || "";

  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed  = JSON.parse(cleaned);

    // Save the ad to history
    await (prisma as any).adCampaign?.create({
      data: {
        storeId:   req.storeId,
        platform:  req.platform,
        format:    req.format,
        goal:      req.goal,
        content:   JSON.stringify(parsed),
        productId: req.productId,
      },
    }).catch(() => {}); // gracefully skip if model doesn't exist yet

    return parsed;
  } catch {
    return { raw: text };
  }
}

function buildAdPrompt(req: AdBriefRequest, context: string, storeName: string): string {
  const platformGuides: Record<string, string> = {
    tiktok:    "TikTok: hook in first 3 seconds, trending sounds, Gen Z/Millennial tone, emojis, call-to-action at end",
    instagram: "Instagram: aspirational, visual-first, lifestyle tone, hashtags, story format or carousel",
    facebook:  "Facebook: social proof heavy, benefit-led, slightly longer copy acceptable, local market feel",
    twitter:   "X/Twitter: punchy, 280 chars, meme-friendly, no hashtag spam",
    whatsapp:  "WhatsApp: conversational, informal, urgency, direct purchase link",
  };

  const formatGuides: Record<string, string> = {
    video_script: "Write a complete video script with: HOOK (0-3s), PROBLEM (3-8s), SOLUTION (8-20s), PROOF (20-25s), CTA (25-30s). Include on-screen text suggestions.",
    image_ad:     "Write: headline (max 6 words), body copy (max 30 words), CTA button text. Describe the ideal image composition.",
    carousel:     "Write 5 carousel slides: each with headline + 2-line body. First slide must be scroll-stopping.",
    story:        "Write a 15-second story script: swipe-up text, emoji sequence, background description.",
    reel:         "Write a 30-second reel script with trending audio suggestion, text overlays, and hook.",
  };

  return `You are KIRO, an AI ad expert for African e-commerce brands. Create high-converting ad content.

Context: ${context}
Store: ${storeName}
Platform: ${req.platform.toUpperCase()} — ${platformGuides[req.platform]}
Format: ${formatGuides[req.format]}
Goal: ${req.goal.toUpperCase()}
${req.targetAudience ? `Target audience: ${req.targetAudience}` : "Target: Nigerian online shoppers aged 18-35"}
${req.budget ? `Budget: ₦${req.budget.toLocaleString()}/day` : ""}

Return ONLY valid JSON:
{
  "hook": "the opening hook/headline",
  "script": "full ad copy or script",
  "caption": "social media caption with hashtags",
  "cta": "call-to-action text",
  "targetingTips": ["3 audience targeting recommendations"],
  "bestPostTime": "optimal posting time for Nigerian audience",
  "estimatedReach": "estimated reach range for ₦5000 budget",
  "aiBudgetTip": "one specific budget recommendation",
  "variations": ["2 alternative hooks to A/B test"]
}`;
}

// Get ad campaign history for a store
export async function getAdHistory(storeId: string) {
  try {
    const ads = await (prisma as any).adCampaign?.findMany({
      where:   { storeId },
      orderBy: { createdAt:"desc" },
      take:    50,
    });
    return ads || [];
  } catch { return []; }
}

// Connect TikTok account (OAuth flow)
export function getTikTokAuthUrl(storeId: string): string {
  const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
  if (!clientKey) return "";
  const params = new URLSearchParams({
    client_key:    clientKey,
    response_type: "code",
    scope:         "user.info.basic,video.list,video.upload,ads.create",
    redirect_uri:  `${process.env.FRONTEND_URL || "https://droposhq.com"}/api/ads/tiktok/callback`,
    state:         storeId,
  });
  return `https://www.tiktok.com/auth/authorize/?${params}`;
}

// Connect Meta (Facebook/Instagram) account
export function getMetaAuthUrl(storeId: string): string {
  const appId = process.env.META_APP_ID || "";
  if (!appId) return "";
  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  `${process.env.FRONTEND_URL || "https://droposhq.com"}/api/ads/meta/callback`,
    scope:         "ads_management,pages_manage_ads,instagram_basic,instagram_content_publish",
    response_type: "code",
    state:         storeId,
  });
  return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
}
