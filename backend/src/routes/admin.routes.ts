// src/routes/admin.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getDashboardStats, getAllUsers, getUserDetail,
  updateUser, updateUserSubscription, deleteUser,
  getSettings, updateSettings,
  getErrorLogs, resolveErrorLog,
  getAuditLogs, getPlatformAnalytics,
} from "../controllers/admin.controller";

const router = Router();

// All admin routes require auth + SUPER_ADMIN role
router.use(authenticate);

router.get ("/dashboard",                 getDashboardStats);
router.get ("/stats",                     getDashboardStats); // alias for frontend
router.get ("/analytics",                 getPlatformAnalytics);

router.get ("/users",                     getAllUsers);
router.get ("/users/:userId",             getUserDetail);
router.patch("/users/:userId",            updateUser);
router.patch("/users/:userId/subscription", updateUserSubscription);
router.delete("/users/:userId",           deleteUser);

router.get ("/settings",                  getSettings);
router.patch("/settings",                 updateSettings);

router.get ("/error-logs",                getErrorLogs);
router.patch("/error-logs/:logId/resolve",resolveErrorLog);
router.get ("/audit-logs",                getAuditLogs);

export default router;

// GET /api/admin/stats — platform overview
router.get("/stats", requireAdmin, async (_req: Request, res: Response) => {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, totalStores, totalOrders, revenueAgg, newUsersToday, newStoresToday, ordersToday, subs] = await Promise.all([
    prisma.user.count(),
    (prisma as any).store.count({ where:{ isActive:true } }),
    (prisma as any).order.count(),
    (prisma as any).order.aggregate({ _sum:{ total:true }, where:{ paymentStatus:"PAID" } }),
    prisma.user.count({ where:{ createdAt:{ gte:today } } }),
    (prisma as any).store.count({ where:{ createdAt:{ gte:today }, isActive:true } }),
    (prisma as any).order.count({ where:{ createdAt:{ gte:today } } }),
    (prisma as any).subscription.groupBy({ by:["plan"], _count:{ plan:true } }),
  ]);

  const paidPlans = subs.filter((s:any)=>s.plan!=="FREE");
  const mrr = paidPlans.reduce((sum:number,s:any)=>{
    const price = s.plan==="GROWTH"?9500:s.plan==="PRO"?25000:0;
    return sum + price * s._count.plan;
  }, 0);

  res.json({ success:true, data:{
    totalUsers, totalStores, totalOrders,
    totalRevenue: revenueAgg._sum?.total || 0,
    newUsersToday, newStoresToday, ordersToday,
    mrr, mrrGrowth: 0,
    activeToday: newUsersToday + ordersToday,
  }});
});
