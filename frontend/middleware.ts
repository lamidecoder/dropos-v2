import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "droposhq.com";

export const config = {
  matcher: ["/((?!_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export async function middleware(req: NextRequest) {
  const url    = req.nextUrl;
  const host   = req.headers.get("host") || "";

  // Get hostname without port
  const hostname = host
    .replace(":3000", "")
    .replace(":443", "")
    .replace(":80", "");

  // Skip Vercel preview/system domains
  if (
    hostname === "localhost" ||
    hostname.endsWith(".vercel.app") ||
    hostname === ROOT_DOMAIN ||
    hostname === `www.${ROOT_DOMAIN}`
  ) {
    return NextResponse.next();
  }

  // It's a subdomain like midelymah320.droposhq.com
  if (hostname.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${ROOT_DOMAIN}`, "");

    // Build new URL — rewrite internally to /store/[subdomain]
    const newUrl = new URL(
      `/store/${subdomain}${url.pathname === "/" ? "" : url.pathname}${url.search}`,
      req.url
    );

    // CRITICAL: set the host back to root domain so Vercel routes it correctly
    newUrl.host = ROOT_DOMAIN;

    return NextResponse.rewrite(newUrl);
  }

  return NextResponse.next();
}
