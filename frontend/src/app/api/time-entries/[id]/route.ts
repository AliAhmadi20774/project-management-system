import { NextRequest } from "next/server";
import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/time-entries/${id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }));
}
export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/time-entries/${id}/`, { method: "DELETE" }));
}
