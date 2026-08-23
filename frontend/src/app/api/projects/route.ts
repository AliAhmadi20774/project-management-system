import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

async function requestProjects(request: NextRequest, init?: RequestInit) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return null;

  return fetch(`${apiBaseUrl}/api/v1/projects/`, {
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
  const response = await requestProjects(request);
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: NextRequest) {
  const response = await requestProjects(request, {
    method: "POST",
    body: JSON.stringify(await request.json()),
  });
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}
