import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(_req: NextRequest): Promise<{ ok: true } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user?.classId !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return { ok: true };
}
