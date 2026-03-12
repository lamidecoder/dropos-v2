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
  if (mimetype === "image/webp") return b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
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

async function saveLocally(file: Express.Multer.File): Promise<string> {
  const fs   = await import("fs");
  const path = await import("path");
  const { v4: uuid } = await import("uuid");
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const ext      = path.extname(file.originalname);
  const filename = `${uuid()}${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), file.buffer);
  return `${process.env.BACKEND_URL || "http://localhost:5000"}/uploads/${filename}`;
}

const router = Router();
router.use(authenticate);

// POST /api/upload
router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  if (USE_CLOUDINARY) {
    const { url, publicId } = await uploadToCloudinary(req.file.buffer);
    return res.json({ success: true, data: { url, publicId } });
  }
  const url = await saveLocally(req.file);
  return res.json({ success: true, data: { url, publicId: url } });
});

// POST /api/upload/multiple
router.post("/multiple", upload.array("files", 10), async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw new AppError("No files uploaded", 400);
  if (USE_CLOUDINARY) {
    const results = await Promise.all(files.map((f) => uploadToCloudinary(f.buffer)));
    return res.json({ success: true, data: { urls: results.map((r) => r.url), publicIds: results.map((r) => r.publicId) } });
  }
  const urls = await Promise.all(files.map(saveLocally));
  return res.json({ success: true, data: { urls } });
});

// DELETE /api/upload
router.delete("/", async (req: Request, res: Response) => {
  const { publicId } = req.body;
  if (!publicId) throw new AppError("publicId required", 400);
  if (USE_CLOUDINARY) await cloudinary.uploader.destroy(publicId);
  return res.json({ success: true, message: "Deleted" });
});

export default router;
