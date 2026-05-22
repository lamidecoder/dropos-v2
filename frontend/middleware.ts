// Middleware kept minimal - rewrites handled by next.config.js
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  // All subdomain routing is handled by next.config.js rewrites
  // This middleware is intentionally a passthrough
  return NextResponse.next();
}
