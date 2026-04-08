# KAI Agent — Dashboard In Chat
Unzip into `dropos-v2/`. Every dashboard action, done through conversation.

---

## What This Does

Before: KAI could TALK about your dashboard
After:  KAI IS your dashboard. Type anything. It does it.

---

## Every Action Available Through Chat

### Products
- "Add a product called Brazilian Hair at ₦35,000 with 50 in stock"
- "Change the price of iPhone Case to ₦8,500"
- "Increase all prices by 15%"
- "Restock Waist Trainer to 100 units"
- "Delete the LED Lights product"
- "Show me all my products"
- "Hide the Smart Watch from my store"

### Orders
- "Show me pending orders"
- "Mark order #ABC123 as shipped"
- "Show me today's orders"
- "Refund order #XYZ456"

### Inventory
- "Check my inventory"
- "What's low on stock?"
- "What's out of stock?"

### Coupons & Marketing
- "Create a 20% off coupon called WELCOME20"
- "Show me my active coupons"
- "Start a flash sale with 30% off"

### Analytics
- "How are my sales this week?"
- "Show me my top selling products"
- "How much have I made this month?"

### Customers
- "Show me my customers"
- "How many customers do I have?"

### Store Settings
- "Rename my store to Glamour Collections"
- "Switch to the Lagos Noir template"
- "Close my store for today"
- "Open my store"

---

## Multi-Store Intelligence

Owner has 1 store:  → KAI auto-selects it, no interruption
Owner has 2+ stores: → KAI shows store picker before proceeding
Owner says "switch stores": → KAI shows all stores with stats

---

## How Approval Works

1. Owner: "Add a product called Hair Bundle at ₦45,000"
2. KAI: Shows approval card with editable fields
3. Owner: Reviews, edits if needed, clicks "Confirm"
4. KAI: Executes → "✅ Done — Product created"

KAI NEVER acts without approval. Consent framework enforced.

---

## 2 Steps After Unzipping

### Step 1 — Add route to app.ts
```typescript
import kaiAgentRoutes from "./routes/kai.agent.routes";
app.use("/api/kai/agent", kaiAgentRoutes);
```

### Step 2 — Files that REPLACE existing
```
frontend/src/app/dashboard/kai/page.tsx  → replaces existing KAI page
frontend/src/components/kai/KAIAgentChat.tsx → NEW component
```

---

## Files
```
backend/src/
  services/kai.agent.service.ts     ← Action detection + execution
  controllers/kai.agent.controller.ts ← Orchestration
  routes/kai.agent.routes.ts        ← Endpoints

frontend/src/
  components/kai/KAIAgentChat.tsx   ← Complete dashboard-in-chat UI
  app/dashboard/kai/page.tsx        ← Updated page
```
