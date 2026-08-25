import { NextRequest } from "next/server";
import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const query = new URL(request.url).search;
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/time-entries/${query}`));
}

export async function POST(request: NextRequest) {
  return proxyAuthenticatedResponse(await authenticatedApiFetch(request, "/api/v1/time-entries/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }));
}
