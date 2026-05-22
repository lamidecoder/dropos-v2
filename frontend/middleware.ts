// Path: frontend/middleware.ts
// Multi-tenant subdomain routing for DropOS

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const url      = req.nextUrl.clone();
  const host     = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // 1. Skip localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  // 2. Skip Vercel internal/preview domains — never treat as store
  if (hostname.endsWith(".vercel.app") || hostname.includes("vercel.app")) {
    return NextResponse.next();
  }

  // 3. Root domain — pass through
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  // 4. Subdomain of droposhq.com — e.g. midelymah320.droposhq.com
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.replace(`.${ROOT_DOMAIN}`, "");
    // Rewrite to /store/[slug] preserving the path
    const newPath = `/store/${slug}${url.pathname === "/" ? "" : url.pathname}`;
    url.pathname = newPath;
    return NextResponse.rewrite(url);
  }

  // 5. Everything else — pass through (don't redirect, don't call backend)
  return NextResponse.next();
}
