import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

async function requestTask(request: NextRequest, params: RouteContext["params"], init: RequestInit) {
  const { id } = await params;
  return authenticatedApiFetch(request, `/api/v1/tasks/${id}/`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  return proxyAuthenticatedResponse(
    await requestTask(request, params, { method: "PATCH", body: JSON.stringify(await request.json()) })
  );
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const action = request.nextUrl.searchParams.get("action");
  const { id } = await params;
  const actionPath = action === "submit-progress"
    ? "submit-progress"
    : action === "review-progress"
      ? "review-progress"
      : null;
  if (!actionPath) {
    return Response.json({ detail: "Unsupported task action." }, { status: 400 });
  }
  const body = await request.text();
  if (!body) {
    return Response.json({ detail: "A JSON request body is required." }, { status: 400 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ detail: "The request body must be valid JSON." }, { status: 400 });
  }
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/tasks/${id}/${actionPath}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  return proxyAuthenticatedResponse(await requestTask(request, params, { method: "DELETE" }));
}
