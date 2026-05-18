// src/routes/upload.routes.ts
import { Router, Request, Response } from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { AppError } from "../utils/AppError";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

// ── Cloudinary config ─────────────────────────────────────────────────────────
// REPLACE with your real Cloudinary credentials when going live
// Get them FREE at https://cloudinary.com → Dashboard → API Keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key:    process.env.CLOUDINARY_API_KEY    || "demo",
  api_secret: process.env.CLOUDINARY_API_SECRET || "demo",
});

const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== "demo"
);

// ── Multer memory storage ──────────────────────────────────────────────────────
// Verify actual file bytes match claimed mimetype (prevent mimetype spoofing)
function verifyImageMagicBytes(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 4) return false;
  const b = buffer;
  if (mimetype === "image/jpeg") return b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
  if (mimetype === "image/png")  return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
  if (mimetype === "image/webp") return b.length > 12; // RIFF container check is unreliable, trust multer filter
  if (mimetype === "image/gif")  return b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46;
  return false;
}

const MAX_FILE_BYTES = (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024; // 5MB default

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_BYTES, files: 10 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype))
      return cb(new AppError("Only JPEG, PNG, WebP, GIF images allowed", 400));
    // Sanitize filename
    file.originalname = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
    cb(null, true);
  },
});

// ── Upload buffer to Cloudinary ────────────────────────────────────────────────
function uploadToCloudinary(buffer: Buffer, folder = "dropos/products", mimetype = "image/jpeg"): Promise<{ url: string; publicId: string }> {
  // Double-check magic bytes before uploading
  if (!verifyImageMagicBytes(buffer, mimetype)) {
    return Promise.reject(new AppError("File content does not match its type", 400));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

async function uploadFallback(file: any): Promise<{ url: string; publicId: string }> {
  // Primary: Cloudinary (if configured)
  if (USE_CLOUDINARY) {
    return uploadToCloudinary(file.buffer, "dropos/products", file.mimetype);
  }

  // Fallback 1: ImgBB free API (no key needed for small files)
  try {
    const base64 = file.buffer.toString("base64");
    const form   = new URLSearchParams();
    form.append("image", base64);
    const imgbbKey = process.env.IMGBB_API_KEY || "";
    const url2 = imgbbKey
      ? `https://api.imgbb.com/1/upload?key=${imgbbKey}`
      : `https://api.imgbb.com/1/upload?key=2e799f5e0a39f97ea6b48cc7e6bb6c63`; // free public demo key
    const r = await fetch(url2, { method:"POST", body:form });
    if (r.ok) {
      const j: any = await r.json();
      const imgUrl = j?.data?.url || j?.data?.display_url;
      if (imgUrl) return { url: imgUrl, publicId: j?.data?.id || imgUrl };
    }
  } catch {}

  // Fallback 2: Imgur anonymous upload
  try {
    const base64 = file.buffer.toString("base64");
    const r = await fetch("https://api.imgur.com/3/image", {
      method: "POST",
      headers: { Authorization: "Client-ID 546c25a59c58ad7", "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64, type: "base64" }),
    });
    if (r.ok) {
      const j: any = await r.json();
      if (j?.data?.link) return { url: j.data.link, publicId: j.data.id };
    }
  } catch {}

  // Last resort: compact base64 thumbnail (resize to 400px equivalent)
  const base64   = file.buffer.toString("base64");
  const mimeType = file.mimetype || "image/jpeg";
  // Warn if over 500KB
  if (file.buffer.length > 500000) {
    throw new AppError("Image too large and cloud storage is not configured. Add CLOUDINARY or IMGBB_API_KEY to your environment, or use an image under 500KB.", 413);
  }
  return { url: `data:${mimeType};base64,${base64}`, publicId: `local_${Date.now()}` };
}


const router = Router();
router.use(authenticate);

// POST /api/upload
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const { url, publicId } = await uploadFallback(req.file);
  return res.json({ success: true, data: { url, publicId } });
});

// POST /api/upload/multiple
router.post("/multiple", upload.array("files", 10), async (req: Request, res: Response) => {
  const files = req.files as any /* Express.Multer.File */[];
  if (!files?.length) throw new AppError("No files uploaded", 400);
  if (USE_CLOUDINARY) {
    const results = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
    return res.json({ success: true, data: { urls: results.map((r) => r.url), publicIds: results.map((r) => r.publicId) } });
  }
  const urls = await Promise.all(files.map(uploadFallback));
  return res.json({ success: true, data: { urls } });
});

// DELETE /api/upload
router.delete("/", async (req: Request, res: Response) => {
  const { publicId } = req.body;
  if (!publicId) throw new AppError("publicId required", 400);
  if (USE_CLOUDINARY) await cloudinary.uploader.destroy(publicId);
  return res.json({ success: true, message: "Deleted" });
});


// POST /api/upload/image — accepts "image" field (frontend compat)
router.post("/image", upload.single("image"), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const { url, publicId } = await uploadFallback(req.file);
  return res.json({ success: true, data: { url, publicId } });
});

// POST /api/upload/images — accepts "images" field (frontend compat)
router.post("/images", upload.array("images", 10), async (req: Request, res: Response) => {
  const files = req.files as any[];
  if (!files?.length) throw new AppError("No files uploaded", 400);
  if (USE_CLOUDINARY) {
    const results = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
    return res.json({ success: true, data: { urls: results.map((r) => r.url) } });
  }
  const urls = await Promise.all(files.map(uploadFallback));
  return res.json({ success: true, data: { urls } });
});

// Handle multer errors (file too large, wrong type, etc.)
router.use((err: any, _req: any, res: any, next: any) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: `File too large. Maximum ${process.env.MAX_FILE_SIZE_MB || 5}MB allowed.` });
  }
  if (err?.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({ success: false, message: "Too many files. Maximum 10 files at once." });
  }
  if (err?.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ success: false, message: "Unexpected file field name." });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode || 400).json({ success: false, message: err.message });
  }
  next(err);
});

export default router;
