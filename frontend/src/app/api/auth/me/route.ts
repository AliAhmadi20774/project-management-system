import { NextRequest, NextResponse } from "next/server";

import {
  applyAuthResult,
  authenticatedApiFetch,
  proxyAuthenticatedResponse,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const result = await authenticatedApiFetch(
    request,
    "/api/v1/accounts/users/me/"
  );
  if (!result.response.ok) return proxyAuthenticatedResponse(result);

  const user = await result.response.json();
  return applyAuthResult(NextResponse.json({ user }), result);
}

export async function PATCH(request: NextRequest) {
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, "/api/v1/accounts/users/me/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    })
  );
}
