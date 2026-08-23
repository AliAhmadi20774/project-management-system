import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(ACCESS_COOKIE) || request.cookies.has(REFRESH_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/team/:path*",
    "/roles/:path*",
    "/contacts/:path*",
    "/activity/:path*",
    "/reports/:path*",
    "/apps/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/search/:path*",
  ],
};
