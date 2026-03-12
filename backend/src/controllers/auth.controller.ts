// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/database";
import {
  signAccessToken, signRefreshToken, verifyRefreshToken,
  setRefreshCookie, clearRefreshCookie
} from "../config/jwt";
import { AppError } from "../utils/AppError";
import { generateToken, sanitizeUser } from "../utils/helpers";
import { emailService } from "../services/email.service";
import { AuthRequest } from "../middleware/auth";

// ── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and number",
  }),
  phone:    z.string().optional(),
  country:  z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── Register ─────────────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);

  // Check platform allows registration
  const settings = await prisma.platformSettings.findUnique({ where: { id: "singleton" } });
  if (settings && !settings.allowRegistration) {
    throw new AppError("Registration is currently disabled", 403);
  }

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) throw new AppError("Email already registered", 409);

  // Hash password
  const password = await bcrypt.hash(body.password, 12);
  const verifyToken = generateToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email:            body.email,
      password,
      name:             body.name,
      phone:            body.phone,
      country:          body.country,
      role:             "STORE_OWNER",
      status:           "PENDING_VERIFICATION",
      emailVerifyToken: verifyToken,
    },
  });

  // Create default Starter subscription
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial
  await prisma.subscription.create({
    data: {
      userId:             user.id,
      plan:               "STARTER",
      status:             "ACTIVE",
      price:              9,
      currentPeriodStart: now,
      currentPeriodEnd:   trialEnd,
    },
  });

  // Send verification email
  await emailService.sendVerificationEmail(user.email, user.name, verifyToken);

  return res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
    data: { id: user.id, email: user.email, name: user.name },
  });
};

// ── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw new AppError("Invalid or expired verification link", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, status: "ACTIVE", emailVerifyToken: null },
  });

  // Send welcome email now that they're verified
  emailService.sendWelcomeEmail(user.email, user.name);

  return res.json({ success: true, message: "Email verified. You can now log in." });
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  // Check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(`Account locked until ${user.lockedUntil.toISOString()}`, 423);
  }

  // Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const attempts = user.loginAttempts + 1;
    const lockData = attempts >= 5
      ? { loginAttempts: 0, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
      : { loginAttempts: attempts };
    await prisma.user.update({ where: { id: user.id }, data: lockData });
    throw new AppError("Invalid email or password", 401);
  }

  // Check status
  if (user.status === "PENDING_VERIFICATION") {
    throw new AppError("Please verify your email before logging in", 403);
  }
  if (user.status === "SUSPENDED") throw new AppError("Account suspended", 403);
  if (user.status === "BANNED")    throw new AppError("Account banned", 403);

  // Issue tokens
  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Save refresh token & update login
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken, loginAttempts: 0, lockedUntil: null, lastLogin: new Date() },
  });

  setRefreshCookie(res, refreshToken);

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      user: sanitizeUser(user),
    },
  });
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token || req.body?.refreshToken;
  if (!token) throw new AppError("No refresh token", 401);

  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== token) throw new AppError("Invalid refresh token", 401);

  const newPayload      = { userId: user.id, email: user.email, role: user.role };
  const newAccessToken  = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
  setRefreshCookie(res, newRefreshToken);

  return res.json({
    success: true,
    data: { accessToken: newAccessToken },
  });
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (req: AuthRequest, res: Response) => {
  if (req.user?.userId) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data:  { refreshToken: null },
    });
  }
  clearRefreshCookie(res);
  return res.json({ success: true, message: "Logged out successfully" });
};

// ── Get Me ────────────────────────────────────────────────────────────────────
export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      subscription: true,
      stores: { select: { id: true, name: true, slug: true, status: true } },
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return res.json({ success: true, data: sanitizeUser(user) });
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 to prevent email enumeration
  if (!user) return res.json({ success: true, message: "If that email exists, a reset link was sent." });

  const resetToken  = generateToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordResetToken: resetToken, passwordResetExpiry: resetExpiry },
  });

  await emailService.sendPasswordReset(user.email, user.name, resetToken);
  return res.json({ success: true, message: "If that email exists, a reset link was sent." });
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const resetPassword = async (req: Request, res: Response) => {
  const schema = z.object({
    token:    z.string(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  });
  const { token, password } = schema.parse(req.body);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken:  token,
      passwordResetExpiry: { gt: new Date() },
    },
  });
  if (!user) throw new AppError("Invalid or expired reset token", 400);

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data:  { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
  });

  return res.json({ success: true, message: "Password reset successfully" });
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    name:     z.string().min(2).max(100).optional(),
    phone:    z.string().optional(),
    country:  z.string().optional(),
    city:     z.string().optional(),
    timezone: z.string().optional(),
  });
  const data = schema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data,
  });
  return res.json({ success: true, message: "Profile updated", data: sanitizeUser(user) });
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    currentPassword: z.string(),
    newPassword:     z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  });
  const { currentPassword, newPassword } = schema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError("User not found", 404);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new AppError("Current password is incorrect", 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  return res.json({ success: true, message: "Password changed successfully" });
};
