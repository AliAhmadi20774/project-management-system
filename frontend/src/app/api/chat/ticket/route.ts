import { NextRequest } from "next/server";
import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

export async function POST(request: NextRequest) { return proxyAuthenticatedResponse(await authenticatedApiFetch(request, "/api/v1/chat/ticket/", { method: "POST" })); }
