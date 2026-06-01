import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getDashboardStats, getAllUsers, getUserDetail,
  updateUser, updateUserSubscription, deleteUser,
  getSettings, updateSettings,
  getErrorLogs, resolveErrorLog,
  getAuditLogs, getPlatformAnalytics,
  getAllStores, updateStore,
  getAllOrders, getAllPayments,
  broadcastMessage, changeUserPlan,
  getFeatureFlags, updateFeatureFlag,
} from "../controllers/admin.controller";

const router = Router();
router.use(authenticate);

router.get ("/dashboard",                   getDashboardStats);
router.get ("/stats",                       getDashboardStats);
router.get ("/analytics",                   getPlatformAnalytics);

// Users
router.get ("/users",                       getAllUsers);
router.get ("/users/:userId",               getUserDetail);
router.patch("/users/:userId",              updateUser);
router.patch("/users/:userId/subscription", updateUserSubscription);
router.patch("/users/:userId/plan",         changeUserPlan);
router.delete("/users/:userId",             deleteUser);

// Stores
router.get ("/stores",                      getAllStores);
router.patch("/stores/:storeId",            updateStore);

// Orders & Payments
router.get ("/orders",                      getAllOrders);
router.get ("/payments",                    getAllPayments);

// Platform tools
router.post("/broadcast",                   broadcastMessage);
router.get ("/feature-flags",               getFeatureFlags);
router.patch("/feature-flags",              updateFeatureFlag);

// Settings & Logs
router.get ("/settings",                    getSettings);
router.patch("/settings",                   updateSettings);
router.get ("/error-logs",                  getErrorLogs);
router.patch("/error-logs/:logId/resolve",  resolveErrorLog);
router.get ("/audit-logs",                  getAuditLogs);

export default router;
