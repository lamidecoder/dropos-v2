// ============================================================
// Root Layout — Add These
// Path: frontend/src/app/layout.tsx (additions only)
//
// This shows how to add:
// 1. SessionProvider (restores login on every page load)
// 2. KAIWidget (floating KAI button on every page)
// ============================================================

/*
UPDATE frontend/src/app/layout.tsx to include these:

import { SessionProvider }  from "@/hooks/useSessionRestore";
import { KAIWidget }        from "@/components/kai/KAIWidget";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>             // your existing providers
          <SessionProvider>     // ADD THIS — restores session on load
            {children}
            <KAIWidget />       // ADD THIS — floating KAI on every page
          </SessionProvider>
        </Providers>
      </body>
    </html>
  );
}
*/

// ============================================================
// Public routes where KAI widget should appear (all of these):
// / (landing page)
// /pricing
// /features  
// /templates
// /register
// /login
// /store/[slug] (customer-facing stores)
// /dashboard/** (owner dashboard — full KAI page)
//
// KAI Widget behaviour by page:
// Landing/pricing/features: "Sign up to chat with KAI" gating
// Register/login: "Create account to use KAI" prompt
// Dashboard: Full KAI experience (already has /dashboard/kai)
// Store pages: Customer-facing (no business KAI — different widget)
// ============================================================

export const LAYOUT_ADDITIONS = true;
