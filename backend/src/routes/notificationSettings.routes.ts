// src/routes/notificationSettings.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getNotificationSettings,
  updateNotificationSettings,
  sendTestNotification,
  getNotificationLogs,
} from "../controllers/notificationSettings.controller";

const router = Router();

router.get ("/logs/:storeId",   authenticate, getNotificationLogs);
router.post("/test/:storeId",   authenticate, sendTestNotification);
router.get ("/:storeId",        authenticate, getNotificationSettings);
router.put ("/:storeId",        authenticate, updateNotificationSettings);

export default router;
