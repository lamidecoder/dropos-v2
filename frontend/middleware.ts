// Path: frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";
const APP_URL     = `https://${ROOT_DOMAIN}`;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

export async function middleware(req: NextRequest) {
  const host     = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Skip localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return NextResponse.next();
  }

  // Skip Vercel preview/internal domains
  if (hostname.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Root domain — pass through
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  // Subdomain — e.g. midelymah320.droposhq.com → /store/midelymah320
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug      = hostname.replace(`.${ROOT_DOMAIN}`, "");
    const path      = req.nextUrl.pathname;
    const search    = req.nextUrl.search;
    // Rewrite to root domain /store/[slug] so Vercel serves it correctly
    const rewriteUrl = new URL(
      `/store/${slug}${path === "/" ? "" : path}${search}`,
      APP_URL
    );
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}
