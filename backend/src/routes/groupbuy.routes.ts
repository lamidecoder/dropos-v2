import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import prisma from "../lib/prisma";

const router = Router();

// Public: GET /api/group-buy/public/:id
router.get("/public/:id", async (req: Request, res: Response) => {
  try {
    const gb = await prisma.groupBuy.findUnique({
      where: { id: req.params.id },
      include: {
        store:   { select: { name: true, slug: true, logo: true, primaryColor: true, currency: true } },
        product: { select: { name: true, images: true, price: true } },
        members: { select: { name: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!gb) return res.status(404).json({ success: false, message: "Group buy not found" });
    res.json({ success: true, data: { ...gb, memberCount: gb.members.length } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public: POST /api/group-buy/:id/join
router.post("/:id/join", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ success: false, message: "Name and email required" });

    const gb = await prisma.groupBuy.findUnique({ where: { id: req.params.id } });
    if (!gb || !gb.active) return res.status(404).json({ success: false, message: "Group buy not found or ended" });
    if (new Date(gb.endsAt) < new Date()) return res.status(400).json({ success: false, message: "Group buy has ended" });

    // Check if already joined
    const existing = await prisma.groupBuyMember.findFirst({ where: { groupBuyId: req.params.id, email } });
    if (existing) return res.status(400).json({ success: false, message: "You have already joined this group buy" });

    await prisma.groupBuyMember.create({ data: { groupBuyId: req.params.id, name, email } });
    res.json({ success: true, message: "Joined! We will email you when the group fills up." });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Authenticated: POST /api/group-buy (create)
router.post("/", authenticate as any, async (req: any, res: Response) => {
  try {
    const { storeId, productId, title, description, groupPrice, originalPrice, minMembers, endsAt } = req.body;
    const gb = await prisma.groupBuy.create({
      data: { storeId, productId, title, description, groupPrice, originalPrice, minMembers: minMembers || 10, endsAt: new Date(endsAt) },
    });
    res.status(201).json({ success: true, data: gb });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/group-buy/store/:storeId (list)
router.get("/store/:storeId", authenticate as any, async (req: any, res: Response) => {
  try {
    const gbs = await prisma.groupBuy.findMany({
      where: { storeId: req.params.storeId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: gbs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
