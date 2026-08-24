import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

async function requestUsers(request: NextRequest, init?: RequestInit) {
  const isMultipart = init?.body instanceof FormData;
  return authenticatedApiFetch(request, "/api/v1/accounts/users/", {
    ...init,
    headers: {
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });
}

export async function GET(request: NextRequest) {
  return proxyAuthenticatedResponse(await requestUsers(request));
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("multipart/form-data")
    ? await request.formData()
    : JSON.stringify(await request.json());
  return proxyAuthenticatedResponse(await requestUsers(request, {
    method: "POST",
    headers: contentType.includes("multipart/form-data") ? undefined : { "Content-Type": "application/json" },
    body,
  }));
}
