// src/routes/review.routes.ts
import { Router, Request, Response } from "express";
import { prisma } from "../config/database";
import { authenticate } from "../middleware/auth";
import { emailService } from "../services/email.service";
import { AppError } from "../utils/AppError";
import { globalRateLimiter } from "../middleware/rateLimiter";
import { AppError } from "../utils/AppError";
import { globalRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// GET /api/reviews/:storeId/all — dashboard (all reviews including unapproved)
router.get("/:storeId/all", authenticate, async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where:   { storeId: req.params.storeId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: reviews });
});

// GET /api/reviews/:storeId/:productId — public (approved only)
router.get("/:storeId/:productId", async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where:   { productId: req.params.productId, storeId: req.params.storeId, approved: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: reviews });
});

// POST /api/reviews/:storeId/:productId — public (customer submits)
router.post("/:storeId/:productId", globalRateLimiter, async (req: Request, res: Response) => {
  const { name, email, rating, title, body } = req.body;
  if (!name || !email || !rating || !body) throw new AppError("name, email, rating, body required", 400);
  if (Number(rating) < 1 || Number(rating) > 5) throw new AppError("Rating must be 1–5", 400);

  const dupe = await prisma.review.findFirst({ where: { productId: req.params.productId, email } });
  if (dupe) throw new AppError("You have already reviewed this product", 400);

  const review = await prisma.review.create({
    data: {
      storeId:   req.params.storeId,
      productId: req.params.productId,
      name, email,
      rating:  Number(rating),
      title:   title || null,
      body,
      approved: false,
      helpful:  0,
    },
  });

  // Notify store owner
  try {
    const store = await prisma.store.findUnique({
      where:   { id: req.params.storeId },
      include: { owner: { select: { email: true, name: true } } },
    });
    const product = await prisma.product.findUnique({
      where:  { id: req.params.productId },
      select: { name: true },
    });
    if (store && product) {
      emailService.sendNewReviewAlert(
        store.owner.email,
        store.owner.name,
        product.name,
        name,
        Number(rating),
        store.name
      );
    }
  } catch {}

  res.status(201).json({ success: true, data: review, message: "Review submitted — pending approval" });
});

// POST helpful
router.post("/:storeId/:productId/:id/helpful", globalRateLimiter, async (req: Request, res: Response) => {
  await prisma.review.update({ where: { id: req.params.id }, data: { helpful: { increment: 1 } } });
  res.json({ success: true });
});

// PATCH approve
router.patch("/:storeId/:id/approve", authenticate, async (req: Request, res: Response) => {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { approved: true } });
  res.json({ success: true, data: review });
});

// PATCH feature toggle
router.patch("/:storeId/:id/feature", authenticate, async (req: Request, res: Response) => {
  const r = await prisma.review.findFirst({ where: { id: req.params.id, storeId: req.params.storeId } });
  if (!r) throw new AppError("Review not found", 404);
  const updated = await prisma.review.update({ where: { id: req.params.id }, data: { featured: !r.featured } });
  res.json({ success: true, data: updated });
});

// PATCH reply
router.patch("/:storeId/:id/reply", authenticate, async (req: Request, res: Response) => {
  const { replyBody } = req.body;
  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data:  { replyBody: replyBody || null, repliedAt: replyBody ? new Date() : null },
  });
  res.json({ success: true, data: updated });
});

// POST approve-all pending
router.post("/:storeId/approve-all", authenticate, async (req: Request, res: Response) => {
  const result = await prisma.review.updateMany({
    where: { storeId: req.params.storeId, approved: false },
    data:  { approved: true },
  });
  res.json({ success: true, data: { count: result.count } });
});

// DELETE
router.delete("/:storeId/:id", authenticate, async (req: Request, res: Response) => {
  await prisma.review.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;
