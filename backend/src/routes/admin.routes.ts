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
