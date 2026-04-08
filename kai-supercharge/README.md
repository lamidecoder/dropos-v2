# KAI Supercharge — WhatsApp + Image Studio + Forecast + Web Scraper
Unzip into `dropos-v2/` — files land in the right place.

---

## 4 New Features

### 1. WhatsApp Broadcast Scheduler (/dashboard/broadcasts)
- Compose with KAI or write yourself
- Target: All customers / Repeat buyers / VIP / Last 30 days
- Live phone preview as you type
- Send now OR schedule for later
- Full broadcast history with analytics
- KAI writes: Flash Sale, New Arrival, Payday Special, Win-Back

### 2. AI Image Studio (/dashboard/image-studio)
- Background removal (Cloudinary — works immediately)
- Lifestyle scene generation (Lagos bedroom, kitchen, street, luxury)
- Ad creative generation (social media ready)
- Needs: REPLICATE_API_TOKEN for lifestyle + ad generation
- Background removal works with just Cloudinary

### 3. Revenue Forecast + Product Scraper (/dashboard/forecast)
Two tabs:
- 📈 Forecast: 30-day projection, weekly breakdown, risks, opportunities
- 🔗 Import from Web: paste ANY URL → KAI extracts product → import

Scraper works with: AliExpress, Amazon, Temu, Jumia, Konga, any website

---

## 2 Steps After Unzipping

### Step 1 — Register route in app.ts
```typescript
import superchargeRoutes from "./routes/supercharge.routes";
app.use("/api/super", superchargeRoutes);
```

### Step 2 — Add to Dashboard Navigation
```typescript
// In OWNER_NAV, add to KAI Intelligence group:
{ href: "/dashboard/broadcasts",   icon: MessageSquare, label: "WhatsApp Broadcasts" },
{ href: "/dashboard/image-studio", icon: Image,         label: "AI Image Studio" },
{ href: "/dashboard/forecast",     icon: TrendingUp,    label: "Forecast & Import" },
```

---

## Environment Variables

### Required (already set):
```
ANTHROPIC_API_KEY     ← for KAI message generation, scraping, forecast
CLOUDINARY_CLOUD_NAME ← for image upload + background removal
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### For WhatsApp sending (choose ONE):
```
# Twilio (~$0.005/msg, easiest)
TWILIO_ACCOUNT_SID=ACxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OR 360dialog (official Meta API)
DIALOG360_API_KEY=xxxxxxxxx
```
Sign up: https://twilio.com → Messaging → WhatsApp

### For AI Image Generation:
```
REPLICATE_API_TOKEN=r8_xxxxxxxxx
```
Sign up: https://replicate.com (pay per use, ~$0.05 per image)
Without this: background removal still works via Cloudinary

---

## What Works Without Extra Setup
✅ KAI message generation (uses existing ANTHROPIC_API_KEY)
✅ Audience targeting + preview
✅ Broadcast scheduling + history
✅ Revenue forecasting
✅ Product web scraping from any URL
✅ Background removal (uses Cloudinary)
✅ Broadcast compose UI

## What Needs External API Keys
⚙️ Actually sending WhatsApp (needs Twilio or 360dialog)
⚙️ AI lifestyle image generation (needs Replicate)
⚙️ AI ad creative generation (needs Replicate)
