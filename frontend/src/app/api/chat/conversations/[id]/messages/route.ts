import { NextRequest } from "next/server";
import { authenticatedApiFetch, proxyAuthenticatedResponse } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) { const { id } = await params; const query = request.nextUrl.searchParams.toString(); return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/chat/conversations/${id}/messages/${query ? `?${query}` : ""}`)); }
export async function POST(request: NextRequest, { params }: Context) { const { id } = await params; return proxyAuthenticatedResponse(await authenticatedApiFetch(request, `/api/v1/chat/conversations/${id}/messages/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) })); }
