import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/project-memberships/${id}/`, {
      method: "DELETE",
    })
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/project-memberships/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    })
  );
}
