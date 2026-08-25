import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

async function requestContact(request: NextRequest, params: Context["params"], init: RequestInit) {
  const { id } = await params;
  return authenticatedApiFetch(request, `/api/v1/contacts/${id}/`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  return proxyAuthenticatedResponse(await requestContact(request, params, {
    method: "PATCH",
    body: JSON.stringify(await request.json()),
  }));
}

export async function DELETE(request: NextRequest, { params }: Context) {
  return proxyAuthenticatedResponse(await requestContact(request, params, { method: "DELETE" }));
}
