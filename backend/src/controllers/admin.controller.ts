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
  const settings = await (prisma.platformSettings as any).findUnique({ where: { id: "singleton" } });
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

  const settings = await (prisma.platformSettings as any).update({
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

// ── Impersonation — login as any merchant ─────────────────────────────────────
export const impersonateUser = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const admin = req.user!;
  if (admin.role !== "SUPER_ADMIN") return res.status(403).json({ success:false, error:"Forbidden" });

  const user = await prisma.user.findUnique({ where:{ id:userId }, include:{ stores:{ select:{ id:true, slug:true } } } });
  if (!user) return res.status(404).json({ success:false, error:"User not found" });

  // Log the impersonation
  await prisma.auditLog.create({
    data: { userId:admin.userId, action:"IMPERSONATE", resource:"user", resourceId:userId, details:{ targetEmail:user.email } } as any,
  });

  const { signAccessToken, setRefreshCookie } = await import("../config/jwt");
  const accessToken = signAccessToken({ userId:user.id, email:user.email, role:user.role as any });
  setRefreshCookie(res, signAccessToken({ userId:user.id, email:user.email, role:user.role as any }));

  return res.json({ success:true, message:`Now logged in as ${user.email}`, data:{ accessToken, user:{ id:user.id, email:user.email, name:user.name, role:user.role, stores:user.stores } } });
};

// ── Platform Coupons — create codes that work on any store ────────────────────
export const getPlatformCoupons = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=20 } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  // Platform coupons are stored in settings
  const setting = await (prisma.platformSettings as any).findUnique({ where:{ key:"platform_coupons" } });
  const coupons = setting ? JSON.parse(setting.value) : [];
  const paged   = coupons.slice(skip, skip+take);
  return res.json({ success:true, data:paged, pagination:{ total:coupons.length, page:Number(page), limit:take, pages:Math.ceil(coupons.length/take) } });
};



// ── Email Templates ────────────────────────────────────────────────────────────


// ── Churn Analysis ─────────────────────────────────────────────────────────────
export const getChurnAnalysis = async (_req: AuthRequest, res: Response) => {
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate()-30);
  const sixtyDaysAgo  = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate()-60);

  const [
    churned,         // Paid plan → suspended/no activity
    atRisk,          // No orders in 14 days
    recentCancels,   // Downgraded to free in last 30 days
    avgLifetime,
  ] = await Promise.all([
    prisma.user.count({ where:{ role:"STORE_OWNER", status:"SUSPENDED", updatedAt:{ gte:thirtyDaysAgo } } }),
    prisma.store.count({ where:{ status:"ACTIVE", orders:{ none:{ createdAt:{ gte:thirtyDaysAgo } } } } }),
    prisma.user.count({ where:{ role:"STORE_OWNER", plan:"FREE", updatedAt:{ gte:thirtyDaysAgo } } as any }),
    prisma.user.count({ where:{ role:"STORE_OWNER" } }),
  ]);

  // Monthly churn for last 6 months
  const months = Array.from({ length:6 }, (_,i) => {
    const d = new Date(); d.setMonth(d.getMonth()-(5-i)); return new Date(d.getFullYear(),d.getMonth(),1);
  });

  const monthlyChurn = await Promise.all(months.map(async (start) => {
    const end = new Date(start.getFullYear(), start.getMonth()+1, 0);
    const count = await prisma.user.count({ where:{ role:"STORE_OWNER", status:"SUSPENDED", updatedAt:{ gte:start, lte:end } } });
    return { month:start.toLocaleString("default",{ month:"short" }), churned:count };
  }));

  return res.json({ success:true, data:{ churned, atRisk, recentCancels, monthlyChurn, churnRate:Math.round((churned/Math.max(await prisma.user.count({ where:{ role:"STORE_OWNER" } }),1))*100) } });
};

// ── Growth Metrics — MRR, ARR, LTV ────────────────────────────────────────────
export const getGrowthMetrics = async (_req: AuthRequest, res: Response) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalUsers, paidUsers, monthRevenue, allRevenue] = await Promise.all([
    prisma.user.count({ where:{ role:"STORE_OWNER" } }),
    prisma.user.count({ where:{ role:"STORE_OWNER" } as any }),
    prisma.payment.aggregate({ where:{ status:"SUCCESS", createdAt:{ gte:monthStart } }, _sum:{ platformFee:true } }),
    prisma.payment.aggregate({ where:{ status:"SUCCESS" }, _sum:{ platformFee:true } }),
  ]);

  const MRR = monthRevenue._sum.platformFee || 0;
  const ARR = MRR * 12;
  const LTV = totalUsers > 0 ? (allRevenue._sum.platformFee||0) / totalUsers : 0;
  const ARPU = paidUsers > 0 ? MRR / paidUsers : 0;
  const convRate = totalUsers > 0 ? Math.round((paidUsers/totalUsers)*100) : 0;

  // Weekly growth (last 8 weeks)
  const weeklyGrowth = await Promise.all(Array.from({length:8},(_,i)=>{
    const end = new Date(); end.setDate(end.getDate()-(7*(7-i)));
    const start = new Date(end); start.setDate(start.getDate()-7);
    return prisma.user.count({ where:{ role:"STORE_OWNER", createdAt:{ gte:start, lte:end } } })
      .then(count => ({ week:`W${i+1}`, newUsers:count }));
  }));

  return res.json({ success:true, data:{ MRR, ARR, LTV, ARPU, convRate, totalUsers, paidUsers, weeklyGrowth } });
};

// ── Paystack Subaccounts ───────────────────────────────────────────────────────
export const getPaystackSubaccounts = async (_req: AuthRequest, res: Response) => {
  const stores = await prisma.store.findMany({
    where:{ paystackSubCode:{ not:null } },
    select:{ id:true, name:true, slug:true, paystackSubCode:true, owner:{ select:{ name:true, email:true } }, _count:{ select:{ orders:true } } },
    take:50,
  });
  return res.json({ success:true, data:stores });
};

// ── Store Management ──────────────────────────────────────────────────────────
export const getAllStores = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=20, search="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (search) where.OR = [
    { name:{ contains:String(search), mode:"insensitive" } },
    { slug:{ contains:String(search), mode:"insensitive" } },
  ];
  if (status) where.status = String(status);
  const [stores, total] = await Promise.all([
    (prisma.store as any).findMany({ where, take, skip, orderBy:{ createdAt:"desc" }, include:{ owner:{ select:{ id:true, name:true, email:true, plan:true } }, _count:{ select:{ products:true, orders:true } } } }),
    prisma.store.count({ where }),
  ]);
  return res.json({ success:true, data:stores, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

export const updateStore = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  const { status, templateId, primaryColor } = req.body;
  const data: any = {};
  if (status)      data.status      = status;
  if (templateId)  data.templateId  = templateId;
  if (primaryColor)data.primaryColor = primaryColor;
  const store = await prisma.store.update({ where:{ id:storeId }, data });
  return res.json({ success:true, data:store });
};

// ── Platform Orders ────────────────────────────────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=25, search="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (status) where.status = String(status);
  if (search) where.OR = [
    { orderNumber:{ contains:String(search) } },
    { customerEmail:{ contains:String(search) } },
  ];
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, take, skip, orderBy:{ createdAt:"desc" }, include:{ store:{ select:{ name:true, slug:true } } } }),
    prisma.order.count({ where }),
  ]);
  return res.json({ success:true, data:orders, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

// ── Platform Payments ──────────────────────────────────────────────────────────
export const getAllPayments = async (req: AuthRequest, res: Response) => {
  const { page=1, limit=25, gateway="", status="" } = req.query;
  const { take, skip } = paginate(Number(page), Number(limit));
  const where: any = {};
  if (gateway) where.gateway = String(gateway);
  if (status)  where.status  = String(status);
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ where, take, skip, orderBy:{ createdAt:"desc" }, include:{ order:{ select:{ orderNumber:true, store:{ select:{ name:true } } } } } }),
    prisma.payment.count({ where }),
  ]);
  return res.json({ success:true, data:payments, pagination:{ page:Number(page), limit:take, total, pages:Math.ceil(total/take) } });
};

// ── Broadcast ─────────────────────────────────────────────────────────────────
export const broadcastMessage = async (req: AuthRequest, res: Response) => {
  const { title, message, type="info", targetPlan="" } = req.body;
  if (!title || !message) return res.status(400).json({ success:false, error:"title and message required" });
  const where: any = { role:"STORE_OWNER" };
  if (targetPlan) (where as any).plan = String(targetPlan);
  const users = await prisma.user.findMany({ where, select:{ id:true } });
  await prisma.notification.createMany({
    data: users.map((u:any) => ({ userId:u.id, title, message, body:message, type:type as any, channel:"IN_APP" })),
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
  await (prisma.user as any).update({ where:{ id:userId }, data:{ plan } as any });
  await prisma.auditLog.create({
    data:{ userId:(req as any).user.userId, action:"PLAN_CHANGE", resource:"user", resourceId:userId, details:{ plan, reason } } as any,
  });
  return res.json({ success:true, message:`Plan changed to ${plan}` });
};

// ── Feature Flags ──────────────────────────────────────────────────────────────
export const getFeatureFlags = async (_req: AuthRequest, res: Response) => {
  const settings = await (prisma.platformSettings as any).findMany({ where:{ key:{ startsWith:"feature_" } } });
  const flags: Record<string,boolean> = {};
  settings.forEach((s:any) => { flags[s.key.replace("feature_","")] = s.value === "true"; });
  return res.json({ success:true, data:flags });
};

export const updateFeatureFlag = async (req: AuthRequest, res: Response) => {
  const { flag, enabled } = req.body;
  await (prisma.platformSettings as any).upsert({
    where:  { key:`feature_${flag}` },
    update: { value:String(enabled) },
    create: { key:`feature_${flag}`, value:String(enabled) },
  });
  return res.json({ success:true, message:"Feature flag updated" });
};



export const createPlatformCoupon = async (req: AuthRequest, res: Response) => {
  const { code, type, value, maxUses, expiresAt, description, targetPlan } = req.body;
  if (!code || !type || !value) return res.status(400).json({ success:false, error:"code, type, value required" });
  const setting = await (prisma.platformSettings as any).findUnique({ where:{ key:"platform_coupons" } });
  const coupons = setting ? JSON.parse(setting.value) : [];
  if (coupons.find((c:any) => c.code === code.toUpperCase())) return res.status(400).json({ success:false, error:"Code already exists" });
  const newCoupon = { id:`pc_${Date.now()}`, code:code.toUpperCase(), type, value:Number(value), maxUses:maxUses?Number(maxUses):null, expiresAt:expiresAt||null, description:description||"", targetPlan:targetPlan||null, usedCount:0, isActive:true, createdAt:new Date().toISOString() };
  coupons.unshift(newCoupon);
  await (prisma.platformSettings as any).upsert({ where:{ key:"platform_coupons" }, update:{ value:JSON.stringify(coupons) }, create:{ key:"platform_coupons", value:JSON.stringify(coupons) } });
  return res.json({ success:true, data:newCoupon });
};

export const deletePlatformCoupon = async (req: AuthRequest, res: Response) => {
  const { couponId } = req.params;
  const setting = await (prisma.platformSettings as any).findUnique({ where:{ key:"platform_coupons" } });
  const coupons = setting ? JSON.parse(setting.value).filter((c:any) => c.id !== couponId) : [];
  await (prisma.platformSettings as any).update({ where:{ key:"platform_coupons" }, data:{ value:JSON.stringify(coupons) } });
  return res.json({ success:true });
};

// ── Email Templates ────────────────────────────────────────────────────────────
const EMAIL_DEFAULTS = {
  welcome:       { subject:"Welcome to DropOS! 🚀", body:"Hi {{name}},\n\nWelcome to DropOS! Your store is ready.\n\nThe DropOS Team" },
  orderConfirm:  { subject:"Order #{{orderNumber}} confirmed ✅", body:"Hi {{customerName}},\n\nYour order from {{storeName}} has been confirmed.\nTotal: {{total}}" },
  orderShipped:  { subject:"Your order is on its way! 📦", body:"Hi {{customerName}},\n\nYour order #{{orderNumber}} has shipped!\nTrack: {{trackingUrl}}" },
  passwordReset: { subject:"Reset your DropOS password", body:"Hi {{name}},\n\nReset your password: {{resetUrl}}\n\nExpires in 1 hour." },
  planUpgraded:  { subject:"You're now on {{plan}} 🎉", body:"Hi {{name}},\n\nYour plan is now {{plan}}. KIRO is fully unlocked.\n\n{{dashboardUrl}}" },
};

export const getEmailTemplates = async (_req: AuthRequest, res: Response) => {
  const setting = await (prisma.platformSettings as any).findUnique({ where:{ key:"email_templates" } });
  const custom   = setting ? JSON.parse(setting.value) : {};
  return res.json({ success:true, data:{ ...EMAIL_DEFAULTS, ...custom } });
};

export const updateEmailTemplate = async (req: AuthRequest, res: Response) => {
  const { key, subject, body } = req.body;
  if (!key || !subject || !body) return res.status(400).json({ success:false, error:"key, subject, body required" });
  const setting   = await (prisma.platformSettings as any).findUnique({ where:{ key:"email_templates" } });
  const templates = setting ? JSON.parse(setting.value) : {};
  templates[key]  = { subject, body };
  await (prisma.platformSettings as any).upsert({ where:{ key:"email_templates" }, update:{ value:JSON.stringify(templates) }, create:{ key:"email_templates", value:JSON.stringify(templates) } });
  return res.json({ success:true });
};


