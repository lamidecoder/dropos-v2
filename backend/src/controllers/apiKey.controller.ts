// src/controllers/apiKey.controller.ts
import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../middleware/auth";
import crypto from "crypto";

const PERMISSIONS = ["orders:read","orders:write","products:read","products:write","customers:read","analytics:read","webhooks:write"];

const createSchema = z.object({
  name: z.string().min(1).max(60),
  permissions: z.array(z.enum(PERMISSIONS as [string,...string[]])).min(1),
  expiresAt: z.string().datetime().optional(),
});

function hashKey(key: string) { return crypto.createHash("sha256").update(key).digest("hex"); }

// POST /api-keys/:storeId
export const createApiKey = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const data = createSchema.parse(req.body);

  // Check existing key count
  const count = await prisma.apiKey.count({ where: { storeId, isActive: true } });
  if (count >= 10) throw new AppError("Maximum 10 active API keys per store", 400);

  const rawKey = `dropos_${storeId.slice(0,8)}_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, 16);

  const apiKey = await prisma.apiKey.create({
    data: {
      storeId, name: data.name, keyHash, keyPrefix,
      permissions: data.permissions,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    },
    select: { id: true, name: true, keyPrefix: true, permissions: true, isActive: true, expiresAt: true, createdAt: true },
  });

  // Return raw key ONLY on creation — never stored
  res.status(201).json({ success: true, data: { ...apiKey, key: rawKey, warning: "Store this key securely — it will not be shown again." } });
};

// GET /api-keys/:storeId
export const getApiKeys = async (req: AuthRequest, res: Response) => {
  const { storeId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const keys = await prisma.apiKey.findMany({
    where: { storeId },
    select: { id: true, name: true, keyPrefix: true, permissions: true, isActive: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: keys });
};

// DELETE /api-keys/:storeId/:keyId
export const revokeApiKey = async (req: AuthRequest, res: Response) => {
  const { storeId, keyId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const key = await prisma.apiKey.findFirst({ where: { id: keyId, storeId } });
  if (!key) throw new AppError("API key not found", 404);

  await prisma.apiKey.update({ where: { id: keyId }, data: { isActive: false } });
  res.json({ success: true, message: "API key revoked" });
};

// PATCH /api-keys/:storeId/:keyId
export const updateApiKey = async (req: AuthRequest, res: Response) => {
  const { storeId, keyId } = req.params;
  await verifyOwner(storeId, req.user!.userId);

  const { name, permissions } = req.body;
  const updated = await prisma.apiKey.update({
    where: { id: keyId },
    data: { name, permissions },
    select: { id: true, name: true, keyPrefix: true, permissions: true, isActive: true, expiresAt: true },
  });

  res.json({ success: true, data: updated });
};

// GET /api-keys/permissions  — list available permissions
export const listPermissions = async (_req: AuthRequest, res: Response) => {
  res.json({ success: true, data: PERMISSIONS });
};

async function verifyOwner(storeId: string, userId: string) {
  const store = await prisma.store.findFirst({ where: { id: storeId, ownerId: userId } });
  if (!store) throw new AppError("Unauthorized", 403);
}
