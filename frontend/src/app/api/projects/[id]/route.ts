import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE, apiBaseUrl } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const response = await fetch(`${apiBaseUrl}/api/v1/projects/${id}/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const access = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) return NextResponse.json({ detail: "Authentication required." }, { status: 401 });

  const { id } = await params;
  const response = await fetch(`${apiBaseUrl}/api/v1/projects/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await response.json(), { status: response.status });
}
