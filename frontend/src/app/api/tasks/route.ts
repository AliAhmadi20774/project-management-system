import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

async function requestTasks(request: NextRequest, init?: RequestInit) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  const query = request.nextUrl.searchParams.toString();
  return fetch(`${apiBaseUrl}/api/v1/tasks/${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  const response = await requestTasks(request);
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await requestTasks(request, {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
