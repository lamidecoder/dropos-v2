# KAI Autopilot — Full Supplier Automation
Seller connects CJ once. KAI runs everything.

---

## The Full Automation Loop

```
Customer pays
      ↓
KAI sends order to CJDropshipping automatically (every 15 min)
      ↓
CJ ships the product
      ↓
KAI gets tracking number automatically (every 2 hours)
      ↓
Customer gets WhatsApp + email with tracking (automatic)
      ↓
5 days after delivery → customer gets review request (automatic)
      ↓
Supplier stock drops → store auto-updated (every 6 hours)
      ↓
Supplier price changes → margins auto-protected (every 6 hours)
      ↓
Every morning → seller gets full business brief on WhatsApp

Seller does: get customers + add products
KAI does: everything else
```

---

## What Runs Automatically

| Task | Frequency | What happens |
|------|-----------|-------------|
| Order fulfillment | Every 15 min | New paid orders → sent to CJ automatically |
| Tracking sync | Every 2 hours | CJ tracking → customer WhatsApp + email |
| KAI Pulse | Every 2 hours | Store health monitoring |
| Supplier stock sync | Every 6 hours | Out of stock → hidden; price changes → margins protected |
| Profit rules | Every 6 hours | Auto-reprice, auto-hide per seller's rules |
| Review requests | Every hour | Email sent 5 days after delivery |
| Market intel | Daily | Trending products refreshed per country |
| Morning brief | 7am daily | Full business summary on WhatsApp |

---

## 5 Integration Steps

### Step 1 — Add schema
```prisma
// Add StoreIntegration model (in database/schema-additions.prisma)
// Add cjOrderId, fulfillmentStatus, trackingNumber, etc to Order
// Add integrations relation to Store
```

### Step 2 — Migrate
```bash
npx prisma migrate dev --name add_integrations_autopilot
npx prisma generate
```

### Step 3 — Add route
```typescript
import fulfillmentRoutes from "./controllers/fulfillment.controller";
app.use("/api/fulfillment", fulfillmentRoutes);
```

### Step 4 — Replace kai.jobs.ts
This ZIP contains the complete kai.jobs.ts that replaces all previous versions.
Includes all 9 scheduled jobs.

### Step 5 — Wire order events
In your order payment webhook/controller:
```typescript
import { handleOrderPaid } from "../services/order.events";

// After Paystack confirms payment:
handleOrderPaid(order.id); // fire and forget
```

In your order status update (when status = DELIVERED):
```typescript
import { handleOrderDelivered } from "../services/order.events";
handleOrderDelivered(orderId);
```

### Step 6 — Add nav link
```typescript
{ href: "/dashboard/autopilot", icon: Zap, label: "Autopilot" }
```

---

## CJDropshipping Setup (Free)

1. Seller creates free account at cjdropshipping.com
2. Goes to /dashboard/autopilot in DropOS
3. Enters CJ email + password → clicks Connect
4. Done — autopilot activates immediately

No monthly fee for CJ.
Seller only pays for products when orders are placed.

---

## What Seller Focuses On

Once autopilot is active:
- Get customers (TikTok, Instagram, WhatsApp)
- Add winning products (KAI finds them daily)
- Set prices (profit rules protect margins)

Everything else runs without them.
