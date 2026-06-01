// Virtual Bank Account Service
// Uses Paystack Dedicated Virtual Accounts API
// Merchants get their own branded account number — customers pay directly
// Money reconciles automatically to orders

import axios from "axios";
import { prisma } from "../config/database";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const ps = axios.create({
  baseURL: "https://api.paystack.co",
  headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
});

// Create or retrieve a dedicated virtual account for a store
export async function getOrCreateVirtualAccount(storeId: string, ownerName: string, ownerEmail: string) {
  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found");

  // Check if already has virtual account
  if ((store as any).virtualAccountNumber) {
    return {
      accountNumber: (store as any).virtualAccountNumber,
      bankName: (store as any).virtualAccountBank,
      accountName: (store as any).virtualAccountName,
      exists: true,
    };
  }

  // Create Paystack customer first
  const customerRes = await ps.post("/customer", {
    email: ownerEmail,
    first_name: ownerName.split(" ")[0],
    last_name: ownerName.split(" ")[1] || "",
  });
  const customerCode = customerRes.data.data.customer_code;

  // Create dedicated virtual account
  const vaRes = await ps.post("/dedicated_account", {
    customer: customerCode,
    preferred_bank: "titan-paystack", // or "wema-bank"
    subaccount: (store as any).paystackSubaccountCode || undefined,
  });

  const va = vaRes.data.data;
  const accountNumber = va.account_number;
  const bankName      = va.bank?.name || "Titan Bank";
  const accountName   = va.account_name;

  // Save to store
  await prisma.store.update({
    where: { id: storeId },
    data: {
      virtualAccountNumber: accountNumber,
      virtualAccountBank:   bankName,
      virtualAccountName:   accountName,
    } as any,
  });

  return { accountNumber, bankName, accountName, exists: false };
}

// Verify a payment to a virtual account (called from webhook)
export async function verifyVirtualAccountPayment(reference: string) {
  const res = await ps.get(`/transaction/verify/${reference}`);
  const txn = res.data.data;
  
  if (txn.status !== "success") return null;
  
  // Match to an order by amount and store virtual account
  return {
    amount: txn.amount / 100, // kobo to naira
    reference: txn.reference,
    customerEmail: txn.customer?.email,
    paidAt: txn.paid_at,
  };
}
