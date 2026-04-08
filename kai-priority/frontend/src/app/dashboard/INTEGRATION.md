// ============================================================
// DropOS — Dashboard Integration Instructions
// Path: frontend/src/app/dashboard/INTEGRATION.md
// ============================================================

/*
HOW TO ADD ALL PRIORITY 1-3 FEATURES TO YOUR DASHBOARD

1. LIVE TICKER + WIN CELEBRATIONS
   Add to: frontend/src/app/dashboard/layout.tsx (or page.tsx)
   
   import { LiveTicker } from "@/components/kai/LiveTicker";
   
   // Inside the layout JSX, before closing </div>:
   <LiveTicker storeId={storeId} />


2. STORE HEALTH SCORE
   Add to: frontend/src/app/dashboard/page.tsx
   
   import { StoreHealth } from "@/components/kai/StoreHealth";
   
   // Add as a card in the dashboard grid:
   <StoreHealth storeId={storeId} />


3. ACHIEVEMENTS BADGES
   Add to: frontend/src/app/dashboard/page.tsx
   
   import { Achievements } from "@/components/kai/Achievements";
   
   // Add below health score:
   <Achievements storeId={storeId} />


4. ADD NAV LINKS TO DashboardLayout.tsx
   Add these to OWNER_NAV under a new "Intelligence" group:
   
   { group: "Intelligence", items: [
     { href: "/dashboard/grader",          icon: BarChart2,    label: "Product Grader" },
     { href: "/dashboard/comeback",        icon: Users,        label: "Win-Back Customers" },
     { href: "/dashboard/replay",          icon: TrendingUp,   label: "Revenue Replay" },
     { href: "/dashboard/products-intel",  icon: Zap,          label: "Product Intel" },
     { href: "/dashboard/kai-power",       icon: Sparkles,     label: "KAI Power Tools" },
   ]},


5. REGISTER ROUTES IN app.ts
   import featuresRoutes from "./routes/features.routes";
   app.use("/api/features", featuresRoutes);


WHATSAPP BROADCAST SCHEDULER
→ Add to backend when WhatsApp Business API is connected
→ Endpoint: POST /api/features/schedule-broadcast
→ Frontend: /dashboard/broadcasts page (coming in next ZIP)

REVIEW REQUEST AUTOMATION
→ Add to existing order.service.ts
→ After order status changes to DELIVERED:
   setTimeout(() => sendReviewRequest(order.customerId), 5 * 24 * 60 * 60 * 1000);
→ This sends 5 days after delivery confirmation

PRICE DROP MONITORING
→ Add to kai.jobs.ts — runs daily
→ Monitors AliExpress prices for imported products
→ Alerts via KAI Pulse when price drops >10%
*/
