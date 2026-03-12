// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { paginate, sanitizeUser } from "../utils/helpers";
import { AuthRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  const [
    totalUsers, activeUsers, suspendedUsers,
    totalStores, activeStores,
    totalOrders, totalRevenue, platformFees,
    failedPayments, openTickets,
    newUsersThisMonth, revenueThisMonth,
  ] = await Promise.all([
    await prisma.user.count({ where: { role: "STORE_OWNER" } }),
    await prisma.user.count({ where: { role: "STORE_OWNER", status: "ACTIVE" } }),
    await prisma.user.count({ where: { role: "STORE_OWNER", status: "SUSPENDED" } }),
    await prisma.store.count(),
    await prisma.store.count({ where: { status: "ACTIVE" } }),
    await prisma.order.count(),
    await prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    await prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { platformFee: true } }),
    await prisma.payment.count({ where: { status: "FAILED" } }),
    await prisma.supportTicket.count({ where: { status: { in: ["OPEN","IN_PROGRESS"] } } }),
    await prisma.user.count({
      where: {
        role: "STORE_OWNER",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    await prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amount: true },
    }),
  ]);

  // Monthly revenue for last 7 months
  const months = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (6 - i));
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const monthlyRevenue = await Promise.all(
    months.map(async (start) => {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      const agg = await prisma.payment.aggregate({
        where: { status: "SUCCESS", createdAt: { gte: start, lte: end } },
        _sum:  { amount: true, platformFee: true },
      });
      return {
        month:    start.toLocaleString("default", { month: "short" }),
        revenue:  agg._sum.amount || 0,
        fees:     agg._sum.platformFee || 0,
      };
    })
  );

  // Gateway distribution
  const gatewayStats = await prisma.payment.groupBy({
    by:    ["gateway"],
    where: { status: "SUCCESS" },
    _sum:  { amount: true },
    _count:{ id: true },
  });

  return res.json({
    success: true,
    data: {
      users:         { total: totalUsers, active: activeUsers, suspended: suspendedUsers, newThisMonth: newUsersThisMonth },
      stores:        { total: totalStores, active: activeStores },
      orders:        { total: totalOrders },
      revenue:       { total: totalRevenue._sum.amount || 0, thisMonth: revenueThisMonth._sum.amount || 0 },
      platformFees:  { total: platformFees._sum.platformFee || 0 },
      failedPayments,
      openTickets,
      monthlyRevenue,
      gatewayStats,
    },
  });
};

// ── Get All Users ─────────────────────────────────────────────────────────────
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, plan, search, role } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const where: any = {};
  if (role)   where.role   = role;
  if (status) where.status = status;
  if (search) where.OR = [
    { name:  { contains: search as string, mode: "insensitive" } },
    { email: { contains: search as string, mode: "insensitive" } },
  ];

  if (plan) where.subscription = { plan };

  const [users, total] = await Promise.all([
    await prisma.user.findMany({
      where, take, skip,
      include: {
        subscription: true,
        stores: {
          select: { id: true, name: true, status: true, _count: { select: { orders: true } } },
        },
        _count: { select: { stores: true, supportTickets: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    await prisma.user.count({ where }),
  ]);

  // Attach total revenue per user
  const usersWithRevenue = await Promise.all(
    users.map(async (user) => {
      const revenue = await prisma.payment.aggregate({
        where: { storeId: { in: user.stores.map((s) => s.id) }, status: "SUCCESS" },
        _sum:  { amount: true, platformFee: true, storeEarnings: true },
      });
      return {
        ...sanitizeUser(user),
        revenue: {
          total:         revenue._sum.amount || 0,
          platformFees:  revenue._sum.platformFee || 0,
          storeEarnings: revenue._sum.storeEarnings || 0,
        },
      };
    })
  );

  return res.json({
    success: true,
    data: usersWithRevenue,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// ── Get Single User (full detail) ─────────────────────────────────────────────
export const getUserDetail = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      stores: {
        include: {
          _count:  { select: { products: true, orders: true, customers: true } },
          payments:{ where: { status: "SUCCESS" }, select: { amount: true, platformFee: true, storeEarnings: true } },
        },
      },
      supportTickets: { orderBy: { createdAt: "desc" }, take: 5 },
      _count: { select: { stores: true, supportTickets: true } },
    },
  });
  if (!user) throw new AppError("User not found", 404);

  const totalRevenue = await prisma.payment.aggregate({
    where: { storeId: { in: user.stores.map((s) => s.id) }, status: "SUCCESS" },
    _sum:  { amount: true, platformFee: true, storeEarnings: true },
  });

  return res.json({
    success: true,
    data: {
      ...sanitizeUser(user),
      totalRevenue: totalRevenue._sum.amount     || 0,
      platformFees: totalRevenue._sum.platformFee|| 0,
      payouts:      totalRevenue._sum.storeEarnings || 0,
    },
  });
};

// ── Update User ───────────────────────────────────────────────────────────────
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const schema = z.object({
    name:          z.string().min(2).optional(),
    email:         z.string().email().optional(),
    phone:         z.string().optional(),
    status:        z.enum(["ACTIVE","SUSPENDED","BANNED"]).optional(),
    emailVerified: z.boolean().optional(),
    twoFAEnabled:  z.boolean().optional(),
    adminNotes:    z.string().optional(),
    flags:         z.array(z.string()).optional(),
    country:       z.string().optional(),
    city:          z.string().optional(),
    role:          z.enum(["STORE_OWNER","SUPER_ADMIN"]).optional(),
  });

  const data = schema.parse(req.body);
  const user = await prisma.user.update({ where: { id: userId }, data });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId:   req.user!.userId,
      action:   "UPDATE_USER",
      entity:   "User",
      entityId: userId,
      newValues: data as any,
    },
  });

  return res.json({ success: true, message: "User updated", data: sanitizeUser(user) });
};

// ── Update Subscription ───────────────────────────────────────────────────────
export const updateUserSubscription = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const schema = z.object({
    plan:            z.enum(["STARTER","PRO","ADVANCED"]),
    status:          z.enum(["ACTIVE","CANCELLED","EXPIRED","PAST_DUE"]).optional(),
    currentPeriodEnd:z.string().optional(),
  });
  const data = schema.parse(req.body);

  const sub = await prisma.subscription.update({
    where: { userId },
    data:  {
      plan:   data.plan,
      status: data.status,
      ...(data.currentPeriodEnd && { currentPeriodEnd: new Date(data.currentPeriodEnd) }),
    },
    include: { user: { select: { email: true, name: true } } },
  });

  await prisma.auditLog.create({
    data: {
      userId:   req.user!.userId,
      action:   "UPDATE_SUBSCRIPTION",
      entity:   "Subscription",
      entityId: userId,
      newValues: data as any,
    },
  });

  // Send subscription email
  try {
    const { emailService } = await import("../services/email.service");
    const u = (sub as any).user;
    const endDate = sub.currentPeriodEnd?.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) || "N/A";
    if (data.status === "ACTIVE" || (!data.status && sub.status === "ACTIVE")) {
      emailService.sendSubscriptionStarted(u.email, u.name, data.plan, endDate);
    } else if (data.status === "CANCELLED") {
      emailService.sendSubscriptionCancelled(u.email, u.name, data.plan, endDate);
    }
  } catch {}

  return res.json({ success: true, message: "Subscription updated", data: sub });
};

// ── Delete User ───────────────────────────────────────────────────────────────
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "SUPER_ADMIN") throw new AppError("Cannot delete super admin", 403);

  await prisma.user.delete({ where: { id: userId } });

  await prisma.auditLog.create({
    data: {
      userId:   req.user!.userId,
      action:   "DELETE_USER",
      entity:   "User",
      entityId: userId,
    },
  });

  return res.json({ success: true, message: "User deleted" });
};

// ── Platform Settings ─────────────────────────────────────────────────────────
export const getSettings = async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  return res.json({ success: true, data: settings });
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    platformFeePercent: z.number().min(0).max(50).optional(),
    starterPrice:       z.number().optional(),
    proPrice:           z.number().optional(),
    advancedPrice:      z.number().optional(),
    maintenanceMode:    z.boolean().optional(),
    allowRegistration:  z.boolean().optional(),
  });
  const data = schema.parse(req.body);

  const settings = await prisma.platformSettings.update({
    where: { id: "singleton" },
    data,
  });

  await prisma.auditLog.create({
    data: {
      userId:   req.user!.userId,
      action:   "UPDATE_PLATFORM_SETTINGS",
      entity:   "PlatformSettings",
      entityId: "singleton",
      newValues: data as any,
    },
  });

  return res.json({ success: true, message: "Settings updated", data: settings });
};

// ── Error Logs ────────────────────────────────────────────────────────────────
export const getErrorLogs = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, resolved } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (resolved !== undefined) where.resolved = resolved === "true";

  const [logs, total] = await Promise.all([
    await prisma.errorLog.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }),
    await prisma.errorLog.count({ where }),
  ]);

  return res.json({
    success: true,
    data: logs,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

export const resolveErrorLog = async (req: AuthRequest, res: Response) => {
  const { logId } = req.params;
  await prisma.errorLog.update({ where: { id: logId }, data: { resolved: true } });
  return res.json({ success: true, message: "Log resolved" });
};

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20 } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));

  const [logs, total] = await Promise.all([
    await prisma.auditLog.findMany({
      take, skip,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    await prisma.auditLog.count(),
  ]);

  return res.json({
    success: true,
    data: logs,
    pagination: { page: Number(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// ── Platform Analytics ────────────────────────────────────────────────────────
export const getPlatformAnalytics = async (req: AuthRequest, res: Response) => {
  const { period = "7d" } = req.query;
  const days = period === "30d" ? 30 : period === "90d" ? 90 : 7;
  const from = new Date();
  from.setDate(from.getDate() - days);

  const [revenueByDay, ordersByDay, newUsersByDay] = await Promise.all([
    prisma.payment.groupBy({
      by: ["createdAt"],
      where: { status: "SUCCESS", createdAt: { gte: from } },
      _sum: { amount: true, platformFee: true },
    }),
    prisma.order.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: from } },
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: from }, role: "STORE_OWNER" },
      _count: { id: true },
    }),
  ]);

  return res.json({
    success: true,
    data: { revenueByDay, ordersByDay, newUsersByDay },
  });
};
