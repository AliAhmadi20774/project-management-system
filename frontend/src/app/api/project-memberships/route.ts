import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(
      request,
      `/api/v1/project-memberships/${query ? `?${query}` : ""}`
    )
  );
}

export async function POST(request: NextRequest) {
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, "/api/v1/project-memberships/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await request.json()),
    })
  );
}
