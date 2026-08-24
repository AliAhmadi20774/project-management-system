import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/accounts/users/${id}/`));
}
