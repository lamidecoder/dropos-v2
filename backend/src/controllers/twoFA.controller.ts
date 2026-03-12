// src/controllers/twoFA.controller.ts
import { Response } from "express";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

// POST /auth/2fa/setup  — generate secret & QR
export const setup2FA = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError("User not found", 404);
  if (user.twoFAEnabled) throw new AppError("2FA is already enabled", 400);

  const secret = speakeasy.generateSecret({ name: `DropOS (${user.email})`, issuer: "DropOS" });

  // Store temp secret (not enabled yet until verified)
  await prisma.user.update({ where: { id: user.id }, data: { twoFASecret: secret.base32 } });

  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url!);

  res.json({ success: true, data: { secret: secret.base32, qrCode: qrDataUrl } });
};

// POST /auth/2fa/verify  — verify TOTP and enable
export const verify2FA = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  if (!token) throw new AppError("Token required", 400);

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user?.twoFASecret) throw new AppError("2FA setup not initiated", 400);
  if (user.twoFAEnabled) throw new AppError("2FA already enabled", 400);

  const valid = speakeasy.totp.verify({
    secret: user.twoFASecret, encoding: "base32",
    token: token.replace(/\s/g, ""), window: 2,
  });

  if (!valid) throw new AppError("Invalid authentication code", 400);

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: true } });

  res.json({ success: true, message: "Two-factor authentication has been enabled." });
};

// POST /auth/2fa/disable
export const disable2FA = async (req: AuthRequest, res: Response) => {
  const { token, password } = req.body;
  if (!token) throw new AppError("Authentication code required", 400);

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user?.twoFAEnabled) throw new AppError("2FA is not enabled", 400);

  const valid = speakeasy.totp.verify({
    secret: user.twoFASecret!, encoding: "base32",
    token: token.replace(/\s/g, ""), window: 2,
  });

  if (!valid) throw new AppError("Invalid authentication code", 400);

  await prisma.user.update({ where: { id: user.id }, data: { twoFAEnabled: false, twoFASecret: null } });

  res.json({ success: true, message: "Two-factor authentication has been disabled." });
};

// POST /auth/2fa/validate  — used during login flow
export const validate2FALogin = async (req: AuthRequest, res: Response) => {
  const { userId, token } = req.body;
  if (!userId || !token) throw new AppError("userId and token required", 400);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFAEnabled || !user.twoFASecret) throw new AppError("2FA not set up for this user", 400);

  const valid = speakeasy.totp.verify({
    secret: user.twoFASecret, encoding: "base32",
    token: token.replace(/\s/g, ""), window: 2,
  });

  if (!valid) throw new AppError("Invalid authentication code", 401);

  res.json({ success: true, message: "2FA verified successfully" });
};
