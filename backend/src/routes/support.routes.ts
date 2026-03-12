// src/routes/support.routes.ts
import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth";
import { prisma } from "../config/database";
import { z } from "zod";
import { paginate } from "../utils/helpers";

const router = Router();
router.use(authenticate);

// Create ticket (store owner)
router.post("/", async (req: any, res) => {
  const { subject, message, priority } = z.object({
    subject:  z.string().min(5),
    message:  z.string().min(10),
    priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).default("MEDIUM"),
  }).parse(req.body);

  const ticket = await prisma.supportTicket.create({
    data: { userId: req.user!.userId, subject, message, priority },
  });
  return res.status(201).json({ success: true, data: ticket });
});

// Get my tickets
router.get("/", async (req: any, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where = req.user!.role === "SUPER_ADMIN" ? {} : { userId: req.user!.userId };
  const [tickets, total] = await Promise.all([
    await prisma.supportTicket.findMany({
      where, take, skip,
      include: { user: { select: { name: true, email: true } }, replies: true },
      orderBy: { createdAt: "desc" },
    }),
    await prisma.supportTicket.count({ where }),
  ]);

  return res.json({
    success: true,
    data: tickets,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
});

// Reply / resolve (admin)
router.patch("/:ticketId", async (req: any, res) => {
  const { message, status } = z.object({
    message: z.string().optional(),
    status:  z.enum(["OPEN","IN_PROGRESS","RESOLVED","CLOSED"]).optional(),
  }).parse(req.body);

  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.ticketId },
    data: {
      status,
      ...(message && { adminReply: message }),
      ...(status === "RESOLVED" && { resolvedAt: new Date() }),
    },
  });

  if (message) {
    await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user!.userId,
        isAdmin:  req.user!.role === "SUPER_ADMIN",
        message,
      },
    });
  }

  return res.json({ success: true, data: ticket });
});

export default router;
