// ============================================================
// AI Image Studio Service
// Path: backend/src/services/image.studio.service.ts
// Uses: Replicate API (image generation + background removal)
//       Cloudinary (storage + transformations)
// ============================================================

// ── Remove background from product image ─────────────────────
export async function removeBackground(imageUrl: string, replicateKey: string): Promise<string> {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${replicateKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      input: { image: imageUrl },
    }),
  });

  const prediction: any = await response.json();
  return await pollReplicate(prediction.id, replicateKey);
}

// ── Generate product lifestyle image ─────────────────────────
export async function generateLifestyleImage(params: {
  productImageUrl: string;
  backgroundStyle: string; // "bedroom" | "kitchen" | "outdoor" | "studio" | "luxury"
  productName: string;
  replicateKey: string;
}): Promise<string> {

  const stylePrompts: Record<string, string> = {
    bedroom:  "modern Nigerian bedroom, warm lighting, cozy aesthetic, wood furniture",
    kitchen:  "modern Nigerian kitchen, bright, clean, marble countertop",
    outdoor:  "Lagos street art background, vibrant colors, urban Nigeria",
    studio:   "professional white studio, clean product photography, gradient background",
    luxury:   "luxury Lagos penthouse, gold accents, marble, aspirational",
    fashion:  "Lekki fashion district aesthetic, editorial photography style",
    flat_lay: "flat lay on white marble, minimalist, aesthetic arrangement",
  };

  const bgPrompt = stylePrompts[params.backgroundStyle] || stylePrompts.studio;

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.replicateKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      input: {
        prompt: `professional product photography of ${params.productName}, ${bgPrompt}, high quality, commercial photography, 4k`,
        negative_prompt: "blurry, low quality, watermark, text, logo",
        width: 1024,
        height: 1024,
        num_inference_steps: 30,
      },
    }),
  });

  const prediction: any = await response.json();
  return await pollReplicate(prediction.id, params.replicateKey);
}

// ── Generate ad creative ──────────────────────────────────────
export async function generateAdCreative(params: {
  productName: string;
  hook: string;
  backgroundColor: string;
  replicateKey: string;
}): Promise<string> {

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.replicateKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      input: {
        prompt: `social media ad creative for ${params.productName}, ${params.backgroundColor} background, bold typography, Nigerian market, high converting advertisement design, professional marketing graphic`,
        negative_prompt: "blurry, amateurish, clipart",
        width: 1080,
        height: 1080,
        num_inference_steps: 25,
      },
    }),
  });

  const prediction: any = await response.json();
  return await pollReplicate(prediction.id, params.replicateKey);
}

// ── Poll Replicate until done ─────────────────────────────────
async function pollReplicate(id: string, apiKey: string, maxAttempts = 30): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000));

    const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data: any = await res.json();

    if (data.status === "succeeded") {
      return Array.isArray(data.output) ? data.output[0] : data.output;
    }
    if (data.status === "failed") {
      throw new Error(data.error || "Image generation failed");
    }
  }
  throw new Error("Image generation timed out");
}

// ── Cloudinary background removal (if Cloudinary configured) ─
export async function cloudinaryRemoveBg(imageUrl: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary not configured");

  const FormData = require("form-data");
  const form = new FormData();
  form.append("file", imageUrl);
  form.append("upload_preset", "dropos_products");
  form.append("background_removal", "cloudinary_ai");

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });

  const data: any = await res.json();
  return data.secure_url;
}

// ── Setup instructions ────────────────────────────────────────
export function getImageStudioSetup(): string {
  return `
AI Image Studio Setup:

REPLICATE API (for full AI image generation):
  Sign up: https://replicate.com
  Get API key from dashboard
  Add to Render:
    REPLICATE_API_TOKEN=r8_xxxxxxxxx
  
  Cost:
    Background removal: ~$0.001 per image
    Lifestyle image gen: ~$0.05 per image
    Ad creative gen: ~$0.05 per image
  
  Without Replicate: Image Studio shows
  "AI generation unavailable" but background
  removal via Cloudinary still works.

CLOUDINARY (already in your project):
  Background removal uses Cloudinary AI
  Works as soon as CLOUDINARY credentials set
  Cost: Included in Cloudinary plan
  `;
}
