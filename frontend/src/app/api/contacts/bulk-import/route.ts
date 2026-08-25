import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, "/api/v1/contacts/bulk-import/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
  }));
}
