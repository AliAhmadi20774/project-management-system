import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

async function requestEvent(request: NextRequest, params: RouteContext["params"], init: RequestInit) {
  const { id } = await params;
  return authenticatedApiFetch(request, `/api/v1/calendar-events/${id}/`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxyAuthenticatedResponse(await requestEvent(request, params, {
    method: "PATCH",
    body: JSON.stringify(await request.json()),
  }));
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxyAuthenticatedResponse(await requestEvent(request, params, { method: "DELETE" }));
}
