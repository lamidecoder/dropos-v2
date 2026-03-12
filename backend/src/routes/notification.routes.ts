// src/routes/notification.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";

const router = Router();
router.use(authenticate);

router.get("/", async (req: any, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return res.json({ success: true, data: notifications });
});

router.patch("/:id/read", async (req: any, res) => {
  await prisma.notification.update({
    where: { id: req.params.id, userId: req.user!.userId },
    data:  { read: true },
  });
  return res.json({ success: true });
});

router.patch("/mark-all-read", async (req: any, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, read: false },
    data:  { read: true },
  });
  return res.json({ success: true });
});

router.get("/unread-count", async (req: any, res) => {
  const count = await prisma.notification.count({
    where: { userId: req.user!.userId, read: false },
  });
  return res.json({ success: true, data: { count } });
});

export default router;
