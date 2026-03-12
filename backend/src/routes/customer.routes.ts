// src/routes/customer.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/database";
import { paginate } from "../utils/helpers";

const router = Router();

router.get("/:storeId", authenticate, async (req: any, res) => {
  const { storeId } = req.params;
  const { page = 1, limit = 20, search } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where: any = { storeId };
  if (search) where.OR = [
    { name:  { contains: search as string, mode: "insensitive" } },
    { email: { contains: search as string, mode: "insensitive" } },
  ];

  const [customers, total] = await Promise.all([
    await prisma.storeCustomer.findMany({
      where, take, skip,
      orderBy: { createdAt: "desc" },
    }),
    await prisma.storeCustomer.count({ where }),
  ]);

  return res.json({
    success: true,
    data: customers,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
});

router.get("/:storeId/:customerId", authenticate, async (req: any, res) => {
  const { storeId, customerId } = req.params;
  const customer = await prisma.storeCustomer.findFirst({
    where: { id: customerId, storeId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { payment: { select: { status: true, gateway: true } } },
      },
    },
  });
  if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
  return res.json({ success: true, data: customer });
});

export default router;
