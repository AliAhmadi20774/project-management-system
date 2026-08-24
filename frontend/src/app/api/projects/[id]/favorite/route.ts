import { NextRequest } from "next/server";

import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

async function favorite(request: NextRequest, context: RouteContext, method: "POST" | "DELETE") {
  const { id } = await context.params;
  return proxyAuthenticatedResponse(
    await authenticatedApiFetch(request, `/api/v1/projects/${id}/favorite/`, { method })
  );
}

export function POST(request: NextRequest, context: RouteContext) {
  return favorite(request, context, "POST");
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return favorite(request, context, "DELETE");
}
