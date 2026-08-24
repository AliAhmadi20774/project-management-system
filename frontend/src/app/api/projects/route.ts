import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

async function requestProjects(request: NextRequest, init?: RequestInit) {
  return authenticatedApiFetch(request, "/api/v1/projects/", {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyAuthenticatedResponse(await requestProjects(request));
}

export async function POST(request: NextRequest) {
  return proxyAuthenticatedResponse(await requestProjects(request, {
    method: "POST",
    body: JSON.stringify(await request.json()),
  }));
}
