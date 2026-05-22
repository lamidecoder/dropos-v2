// Path: frontend/src/middleware.ts
// Multi-tenant subdomain routing for DropOS
// midelymah.droposhq.com → /store/midelymah
// Also handles custom domains: midelymah.com → /store/midelymah (via DB lookup)

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL     || "https://droposhq.com";

export const config = {
  matcher: [
    // Match all paths except static assets and Next internals
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const url  = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // Strip port for local dev
  const hostname = host.split(":")[0];

  // ── 1. Localhost dev — skip subdomain logic ──────────────────────────────
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  // ── 2. Root domain — pass through normally ───────────────────────────────
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  // ── 3. Subdomain of droposhq.com — e.g. midelymah.droposhq.com ──────────
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.replace(`.${ROOT_DOMAIN}`, "");
    
    // Skip Vercel preview deployments (*.vercel.app)
    if (slug.includes("vercel")) return NextResponse.next();
    
    // Rewrite to /store/[slug] preserving path
    url.pathname = `/store/${slug}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ── 4. Custom domain — e.g. midelymah.com ───────────────────────────────
  // Look up which store owns this domain
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dropos-v2.onrender.com/api";
    const res = await fetch(`${apiUrl}/stores/domain/${encodeURIComponent(hostname)}`, {
      headers: { "Content-Type": "application/json" },
      // Short timeout so we don't slow down every request
      signal: AbortSignal.timeout(2000),
    });

    if (res.ok) {
      const data = await res.json();
      const slug = data?.data?.slug;
      if (slug) {
        url.pathname = `/store/${slug}${url.pathname === "/" ? "" : url.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  } catch {
    // Custom domain lookup failed — fall through
  }

  // ── 5. Unknown host — redirect to root ──────────────────────────────────
  return NextResponse.redirect(new URL("/", APP_URL));
}
