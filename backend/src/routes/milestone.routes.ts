import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();
router.use(authenticate);

// GET /api/milestones/:storeId
router.get("/:storeId", async (req: any, res: Response) => {
  try {
    const milestones = await prisma.milestone.findMany({
      where: { storeId: req.params.storeId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, data: milestones });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/milestones/:id/seen
router.patch("/:id/seen", async (req: any, res: Response) => {
  try {
    await prisma.milestone.update({ where: { id: req.params.id }, data: { seen: true } });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Internal: create milestone (called from other services)
export async function createMilestone(storeId: string, type: string, title: string, message: string, cta?: any) {
  return prisma.milestone.create({ data: { storeId, type, title, message, cta } });
}

export default router;
