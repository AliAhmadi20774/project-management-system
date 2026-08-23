import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  apiBaseUrl,
  clearAuthCookies,
  getCurrentUser,
  setAuthCookies,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!access) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  let userResponse = await getCurrentUser(access);
  if (userResponse.status === 401 && refresh) {
    const refreshResponse = await fetch(`${apiBaseUrl}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      const refreshed = (await refreshResponse.json()) as { access: string };
      access = refreshed.access;
      userResponse = await getCurrentUser(access);
      if (userResponse.ok) {
        const response = NextResponse.json({ user: await userResponse.json() });
        setAuthCookies(response, access, refresh);
        return response;
      }
    }
  }

  if (!userResponse.ok) {
    const response = NextResponse.json({ detail: "Authentication required." }, { status: 401 });
    clearAuthCookies(response);
    return response;
  }

  return NextResponse.json({ user: await userResponse.json() });
}
