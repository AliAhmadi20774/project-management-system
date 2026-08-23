import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });

  const query = request.nextUrl.searchParams.toString();
  const response = await fetch(`${apiBaseUrl}/api/v1/project-memberships/${query ? `?${query}` : ""}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
