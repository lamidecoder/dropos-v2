import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const path     = req.nextUrl.pathname;
  const search   = req.nextUrl.search;

  // Skip system domains
  if (
    hostname.includes("vercel.app") ||
    hostname.includes("localhost")
  ) {
    return NextResponse.next();
  }

  // Root domain
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) {
    return NextResponse.next();
  }

  // Subdomain e.g. midelymah320.droposhq.com
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const slug = hostname.replace(`.${ROOT_DOMAIN}`, "");

    // Rewrite to root domain so Vercel serves the /store/[slug] route
    const url = req.nextUrl.clone();
    url.hostname = ROOT_DOMAIN;
    url.pathname = `/store/${slug}${path === "/" ? "" : path}`;

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
