import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/projects/${id}/`)
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/projects/${id}/`, { method: "DELETE" })
  );
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/projects/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    })
  );
}
