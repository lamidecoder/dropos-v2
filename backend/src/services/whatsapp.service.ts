// ============================================================
// KAI — WhatsApp Service
// Path: backend/src/services/whatsapp.service.ts
// Supports: Twilio WhatsApp API + 360dialog
// Owner must add ONE of these to .env to activate
// ============================================================

type WhatsAppProvider = "twilio" | "360dialog" | "none";

function getProvider(): WhatsAppProvider {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) return "twilio";
  if (process.env.DIALOG360_API_KEY) return "360dialog";
  return "none";
}

// ── Send a WhatsApp message ───────────────────────────────────
export async function sendWhatsApp(params: {
  to: string;        // phone with country code e.g. +2348012345678
  message: string;
  from?: string;     // your WhatsApp business number
}): Promise<{ success: boolean; messageId?: string; error?: string }> {

  const provider = getProvider();

  if (provider === "none") {
    console.warn("[WhatsApp] No provider configured. Message not sent.");
    console.warn("[WhatsApp] Add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN or DIALOG360_API_KEY");
    return { success: false, error: "WhatsApp not configured" };
  }

  try {
    if (provider === "twilio") return await sendViaTwilio(params);
    if (provider === "360dialog") return await sendVia360Dialog(params);
    return { success: false, error: "Unknown provider" };
  } catch (err: any) {
    console.error("[WhatsApp] Send failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ── Twilio implementation ─────────────────────────────────────
async function sendViaTwilio(params: { to: string; message: string; from?: string }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken  = process.env.TWILIO_AUTH_TOKEN!;
  const fromNumber = params.from || process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

  const toNumber = `whatsapp:${params.to.startsWith("+") ? params.to : "+" + params.to}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: fromNumber,
        To: toNumber,
        Body: params.message,
      }),
    }
  );

  const data: any = await response.json();
  if (!response.ok) throw new Error(data.message || "Twilio error");
  return { success: true, messageId: data.sid };
}

// ── 360dialog implementation ──────────────────────────────────
async function sendVia360Dialog(params: { to: string; message: string }) {
  const apiKey = process.env.DIALOG360_API_KEY!;
  const phone  = params.to.replace(/\D/g, "");

  const response = await fetch("https://waba.360dialog.io/v1/messages", {
    method: "POST",
    headers: {
      "D360-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: phone,
      type: "text",
      text: { body: params.message },
    }),
  });

  const data: any = await response.json();
  if (!response.ok) throw new Error(data.meta?.developer_message || "360dialog error");
  return { success: true, messageId: data.messages?.[0]?.id };
}

// ── Broadcast to multiple numbers ─────────────────────────────
export async function sendBroadcast(params: {
  numbers: string[];
  message: string;
  storeId: string;
  broadcastId?: string;
}): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const number of params.numbers) {
    if (!number) continue;
    const result = await sendWhatsApp({ to: number, message: params.message });
    if (result.success) sent++;
    else failed++;
    // Rate limit: 1 message per 100ms
    await new Promise(r => setTimeout(r, 100));
  }

  return { sent, failed };
}

// ── Send morning brief ────────────────────────────────────────
export async function sendMorningBrief(params: {
  ownerPhone: string;
  storeName: string;
  message: string;
}): Promise<void> {
  await sendWhatsApp({
    to: params.ownerPhone,
    message: `*${params.storeName} Morning Brief* ☀️\n\n${params.message}`,
  });
}

// ── Env setup instructions ────────────────────────────────────
export function getWhatsAppSetupInstructions(): string {
  return `
WhatsApp Setup — Choose ONE provider:

OPTION 1: Twilio (Recommended for Nigeria)
  Sign up: https://twilio.com
  Get: Account SID, Auth Token, WhatsApp number
  Add to Render:
    TWILIO_ACCOUNT_SID=ACxxxxxxxxx
    TWILIO_AUTH_TOKEN=xxxxxxxxx  
    TWILIO_WHATSAPP_NUMBER=whatsapp:+1415xxxxxxx
  Cost: ~$0.005 per message ($5 per 1000 messages)

OPTION 2: 360dialog (Official WhatsApp Business API)
  Sign up: https://www.360dialog.com
  Get: API key + WhatsApp Business number
  Add to Render:
    DIALOG360_API_KEY=xxxxxxxxx
  Cost: ~$0.006 per message, requires Meta business verification

Without either: WhatsApp features show "not configured" in logs
but app still works — emails sent instead where possible.
  `;
}
