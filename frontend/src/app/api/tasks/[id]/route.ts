import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

async function requestTask(request: NextRequest, params: RouteContext["params"], init: RequestInit) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  const { id } = await params;
  return fetch(`${apiBaseUrl}/api/v1/tasks/${id}/`, {
    ...init,
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const response = await requestTask(request, params, { method: "PATCH", body: JSON.stringify(await request.json()) });
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const response = await requestTask(request, params, { method: "DELETE" });
  if (!response) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await response.json(), { status: response.status });
}
