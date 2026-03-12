// src/routes/auth.routes.ts
import { Router } from "express";
import { authRateLimiter } from "../middleware/rateLimiter";
import { authenticate } from "../middleware/auth";
import {
  register, login, logout, refreshToken,
  verifyEmail, forgotPassword, resetPassword,
  getMe, updateProfile, changePassword,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register",               authRateLimiter, register);
router.post("/login",                  authRateLimiter, login);
router.post("/logout",                 authenticate, logout);
router.post("/refresh",                authRateLimiter, refreshToken);
router.get ("/verify-email/:token",    verifyEmail);
router.post("/forgot-password",        authRateLimiter, forgotPassword);
router.post("/reset-password",         authRateLimiter, resetPassword);
router.get ("/me",                     authenticate, getMe);
router.patch("/me",                    authenticate, updateProfile);
router.patch("/me/password",           authenticate, changePassword);

export default router;
