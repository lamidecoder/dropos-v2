import { Request, Response } from "express";
import { prisma } from "../config/database";
import { verifyBankAccount, getNigerianBanks, createSubaccount } from "../services/paystack.service";
import { AppError } from "../utils/AppError";

// GET /api/banks — list all Nigerian banks
export const listBanks = async (_req: Request, res: Response) => {
  const banks = await getNigerianBanks();
  return res.json({ success: true, data: banks });
};

// POST /api/stores/:storeId/bank/verify — verify account name before saving
export const verifyAccount = async (req: Request, res: Response) => {
  const { accountNumber, bankCode } = req.body;
  if (!accountNumber || !bankCode)
    throw new AppError("accountNumber and bankCode required", 400);

  const result = await verifyBankAccount(accountNumber, bankCode);
  return res.json({ success: true, data: result });
};

// POST /api/stores/:storeId/bank/connect — save bank + create Paystack subaccount
export const connectBankAccount = async (req: Request, res: Response) => {
  const { storeId }  = req.params;
  const { bankCode, bankName, accountNumber, accountName } = req.body;

  if (!bankCode || !accountNumber || !accountName)
    throw new AppError("bankCode, accountNumber, accountName required", 400);

  const store = await prisma.store.findUnique({
    where:  { id: storeId },
    select: { name: true, ownerId: true },
  });
  if (!store) throw new AppError("Store not found", 404);

  // Create or update the Paystack subaccount
  let subCode: string;
  try {
    subCode = await createSubaccount({
      storeId,
      businessName:  store.name,
      bankCode,
      accountNumber,
    });
  } catch (e: any) {
    // If Paystack key not set, save bank details anyway for future use
    console.error("Paystack subaccount creation failed:", e.message);
    subCode = "";
  }

  // Save bank details to store
  await prisma.store.update({
    where: { id: storeId },
    data: {
      bankName,
      bankCode,
      accountNumber,
      accountName,
      paystackSubCode:   subCode || undefined,
      paystackConnected: !!subCode,
    } as any,
  });

  return res.json({
    success: true,
    message: subCode
      ? "Bank account connected. You will receive 98% of every sale directly to this account."
      : "Bank details saved. Payment routing will activate once configured.",
    data: { accountName, accountNumber, bankName, connected: !!subCode },
  });
};

// GET /api/stores/:storeId/bank — get current bank info
export const getBankInfo = async (req: Request, res: Response) => {
  const store = await prisma.store.findUnique({
    where:  { id: req.params.storeId },
    select: {
      bankName:          true,
      accountNumber:     true,
      accountName:       true,
      paystackConnected: true,
      paystackSubCode:   true,
    } as any,
  });
  if (!store) throw new AppError("Store not found", 404);

  return res.json({
    success: true,
    data: {
      bankName:      (store as any).bankName || null,
      // Mask account number — show only last 4 digits
      accountNumber: (store as any).accountNumber
        ? `****${(store as any).accountNumber.slice(-4)}`
        : null,
      accountName:      (store as any).accountName || null,
      paystackConnected:(store as any).paystackConnected || false,
    },
  });
};
