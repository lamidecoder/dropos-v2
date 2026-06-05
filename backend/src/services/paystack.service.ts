/**
 * DropOS Paystack Service
 * 
 * HOW PAYMENTS WORK:
 * 1. Merchant enters their bank account details in Settings → Payments
 * 2. We call Paystack API to verify the account name and create a Subaccount
 * 3. We store the paystackSubCode on the store
 * 4. When a customer pays, Paystack automatically splits:
 *    - 98% goes to merchant's bank account (via their subaccount)
 *    - 2%  stays in DropOS's Paystack account (platform commission)
 * 5. Merchant never needs their own Paystack account
 */

import axios from "axios";
import { prisma } from "../config/database";

const BASE    = "https://api.paystack.co";
const HEADERS = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

const PLATFORM_FEE_PERCENT = 2; // DropOS takes 2% of every transaction

// ── Verify a Nigerian bank account ──────────────────────────────────────────
export async function verifyBankAccount(accountNumber: string, bankCode: string) {
  const { data } = await axios.get(
    `${BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: HEADERS }
  );
  return {
    accountName:   data.data.account_name,
    accountNumber: data.data.account_number,
  };
}

// ── Get all Nigerian banks ───────────────────────────────────────────────────
export async function getNigerianBanks(): Promise<{ name: string; code: string }[]> {
  try {
    const { data } = await axios.get(`${BASE}/bank?country=nigeria&perPage=100`, { headers: HEADERS });
    return data.data.map((b: any) => ({ name: b.name, code: b.code }));
  } catch {
    // Return common banks as fallback
    return [
      { name:"Access Bank",         code:"044" },
      { name:"Citibank",            code:"023" },
      { name:"Ecobank",             code:"050" },
      { name:"Fidelity Bank",       code:"070" },
      { name:"First Bank",          code:"011" },
      { name:"First City Monument Bank (FCMB)", code:"214" },
      { name:"GTBank",              code:"058" },
      { name:"Heritage Bank",       code:"030" },
      { name:"Keystone Bank",       code:"082" },
      { name:"Kuda Bank",           code:"090267" },
      { name:"Opay",                code:"999992" },
      { name:"Palmpay",             code:"999991" },
      { name:"Polaris Bank",        code:"076" },
      { name:"Providus Bank",       code:"101" },
      { name:"Stanbic IBTC",        code:"221" },
      { name:"Standard Chartered",  code:"068" },
      { name:"Sterling Bank",       code:"232" },
      { name:"Union Bank",          code:"032" },
      { name:"United Bank for Africa (UBA)", code:"033" },
      { name:"Unity Bank",          code:"215" },
      { name:"VFD Microfinance Bank", code:"566" },
      { name:"Wema Bank",           code:"035" },
      { name:"Zenith Bank",         code:"057" },
    ];
  }
}

// ── Create Paystack Subaccount for a merchant ────────────────────────────────
// This is called once when merchant saves their bank details
export async function createSubaccount(params: {
  storeId:       string;
  businessName:  string;
  bankCode:      string;
  accountNumber: string;
}): Promise<string> { // returns subaccount code
  const { data } = await axios.post(
    `${BASE}/subaccount`,
    {
      business_name:            params.businessName,
      bank_code:                params.bankCode,
      account_number:           params.accountNumber,
      percentage_charge:        PLATFORM_FEE_PERCENT, // DropOS takes 2%
      description:              `DropOS merchant: ${params.businessName}`,
      settlement_bank:          params.bankCode,
      settlement_schedule:      "auto", // Paystack settles merchant automatically
    },
    { headers: HEADERS }
  );

  const subCode = data.data.subaccount_code;

  // Save to store
  await prisma.store.update({
    where: { id: params.storeId },
    data:  {
      paystackSubCode:   subCode,
      paystackConnected: true,
    } as any,
  });

  return subCode;
}

// ── Initialize a split payment ────────────────────────────────────────────────
// 98% → merchant's bank, 2% → DropOS
export async function initializeSplitPayment(params: {
  amount:         number; // in NGN (not kobo)
  email:          string; // customer email
  orderId:        string;
  storeId:        string;
  callbackUrl:    string;
  subaccountCode: string; // merchant's Paystack subaccount
  currency?:      string;
}) {
  const amountKobo = Math.round(params.amount * 100);

  const body: any = {
    amount:       amountKobo,
    email:        params.email,
    currency:     params.currency || "NGN",
    callback_url: params.callbackUrl,
    metadata: {
      orderId: params.orderId,
      storeId: params.storeId,
    },
    subaccount:   params.subaccountCode,
    bearer:       "subaccount", // subaccount bears Paystack fees
    // DropOS keeps 2% — Paystack calculates this automatically
  };

  const { data } = await axios.post(`${BASE}/transaction/initialize`, body, { headers: HEADERS });
  return {
    authorizationUrl: data.data.authorization_url,
    reference:        data.data.reference,
    accessCode:       data.data.access_code,
  };
}

// ── Verify a transaction ──────────────────────────────────────────────────────
export async function verifyTransaction(reference: string) {
  const { data } = await axios.get(`${BASE}/transaction/verify/${reference}`, { headers: HEADERS });
  return {
    status:    data.data.status,          // "success" | "failed"
    amount:    data.data.amount / 100,    // back to NGN
    reference: data.data.reference,
    paidAt:    data.data.paid_at,
    channel:   data.data.channel,         // "card" | "bank" | "ussd"
    customer:  data.data.customer,
  };
}

// ── Verify Paystack webhook signature ─────────────────────────────────────────
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const crypto = require("crypto");
  const hash   = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
