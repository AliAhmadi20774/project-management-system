import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

async function requestTasks(request: NextRequest, init?: RequestInit) {
  const query = request.nextUrl.searchParams.toString();
  return authenticatedApiFetch(request, `/api/v1/tasks/${query ? `?${query}` : ""}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyAuthenticatedResponse(await requestTasks(request));
}

export async function POST(request: NextRequest) {
  return proxyAuthenticatedResponse(await requestTasks(request, {
    method: "POST",
    body: JSON.stringify(await request.json()),
  }));
}
