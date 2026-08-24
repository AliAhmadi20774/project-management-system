import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, "/api/v1/organizations/departments/")
  );
}
