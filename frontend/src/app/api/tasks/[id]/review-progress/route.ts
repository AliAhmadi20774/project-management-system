import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  const { id } = await params;
  const response = await fetch(`${apiBaseUrl}/api/v1/tasks/${id}/review-progress/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
