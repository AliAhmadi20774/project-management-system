import { NextRequest, NextResponse } from "next/server";

import { apiBaseUrl, getCurrentUser, setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const tokenResponse = await fetch(`${apiBaseUrl}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ detail: "Invalid personnel number or password." }, { status: 401 });
  }

  const { access, refresh } = await tokenResponse.json();
  const userResponse = await getCurrentUser(access);
  if (!userResponse.ok) {
    return NextResponse.json({ detail: "Unable to load user profile." }, { status: 502 });
  }

  const response = NextResponse.json({ user: await userResponse.json() });
  setAuthCookies(response, access, refresh);
  return response;
}
