import { NextRequest } from "next/server";
import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/chat/conversations/${id}/`, { method: "DELETE" }));
}
