// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
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
  await (prisma.auditLog as any).create({
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

  await (prisma.auditLog as any).create({
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

  await (prisma.auditLog as any).create({
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

  await (prisma.auditLog as any).create({
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

// ── Store Management ──────────────────────────────────────────────────────────
export const getAllStores = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=20, search="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (search) where.OR = [{ name:{contains:String(search),mode:"insensitive"} }, { slug:{contains:String(search),mode:"insensitive"} }];
  if (status) where.status = String(status);

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where, take, skip, orderBy:{ createdAt:"desc" },
      include: {
        owner: { select:{ id:true, name:true, email:true, plan:true } },
        _count: { select:{ products:true, orders:true } },
      },
    }),
    prisma.store.count({ where }),
  ]);

  return res.json({ success:true, data:stores, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

export const updateStore = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { status, templateId, primaryColor, plan } = req.body;
  
  const data: any = {};
  if (status) data.status = status;
  if (templateId) data.templateId = templateId;
  if (primaryColor) data.primaryColor = primaryColor;
  
  const store = await prisma.store.update({ where:{ id:storeId }, data });
  return res.json({ success:true, message:"Store updated", data:store });
};

// ── Platform Orders ────────────────────────────────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=20, search="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (status) where.status = String(status);
  if (search) where.OR = [{ orderNumber:{contains:String(search)} }, { customerEmail:{contains:String(search)} }];

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, take, skip, orderBy:{ createdAt:"desc" },
      include: { store:{ select:{ name:true, slug:true } } },
    }),
    prisma.order.count({ where }),
  ]);

  return res.json({ success:true, data:orders, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

// ── Platform Payments ──────────────────────────────────────────────────────────
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=20, gateway="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (gateway) where.gateway = String(gateway);
  if (status) where.status = String(status);

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where, take, skip, orderBy:{ createdAt:"desc" },
      include: { order:{ select:{ orderNumber:true, store:{ select:{ name:true } } } } },
    }),
    prisma.payment.count({ where }),
  ]);

  return res.json({ success:true, data:payments, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

// ── Broadcast Message to All Users ────────────────────────────────────────────
export const broadcastMessage = async (req: AuthRequest, res: Response) => {
  const { title, message, type="info", targetPlan="" } = req.body;
  if (!title || !message) return res.status(400).json({ success:false, error:"title and message required" });

  const where: any = { role:"STORE_OWNER" };
  if (targetPlan) where.plan = String(targetPlan);

  const users = await prisma.user.findMany({ where, select:{ id:true } });
  
  // Create notification for each user
  await prisma.notification.createMany({
    data: users.map((u:any) => ({
      userId:  u.id,
      title,
      body:    message,
      type:    type as any,
      channel: "IN_APP",
    })),
    skipDuplicates: true,
  });

  return res.json({ success:true, message:`Broadcast sent to ${users.length} users` });
};

// ── Manual Plan Change ─────────────────────────────────────────────────────────
export const changeUserPlan = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { plan, reason } = req.body;
  const valid = ["FREE","GROWTH","PRO","ENTERPRISE"];
  if (!valid.includes(plan)) return res.status(400).json({ success:false, error:"Invalid plan" });

  await prisma.user.update({ where:{ id:userId }, data:{ plan } });
  
  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: (req as any).user.userId,
      action: "PLAN_CHANGE",
      resource:"user",
      resourceId: userId,
      details: { plan, reason, changedBy:(req as any).user.userId },
    } as any,
  });

  return res.json({ success:true, message:`Plan changed to ${plan}` });
};

// ── Feature Flags ──────────────────────────────────────────────────────────────
export const getFeatureFlags = async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.platformSetting.findMany({ where:{ key:{ startsWith:"feature_" } } });
  const flags: Record<string,boolean> = {};
  settings.forEach((s:any) => { flags[s.key.replace("feature_","")] = s.value === "true"; });
  return res.json({ success:true, data:flags });
};

export const updateFeatureFlag = async (req: AuthRequest, res: Response) => {
  const { flag, enabled } = req.body;
  await prisma.platformSetting.upsert({
    where:  { key:`feature_${flag}` },
    update: { value:String(enabled) },
    create: { key:`feature_${flag}`, value:String(enabled) },
  });
  return res.json({ success:true, message:"Feature flag updated" });
};
