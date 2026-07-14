import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

interface StatRow { page: string; class_id: string | null; pv: number; uv: number; }

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const year = Number(req.nextUrl.searchParams.get("year") ?? "2026");

  const { data, error } = await supabaseAdmin.rpc("koryo_page_view_stats", { target_year: year });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as StatRow[];

  const byClass: Record<string, { pv: number; uv: number }> = {};
  const site: Record<string, { pv: number; uv: number }> = {
    privacypolicy: { pv: 0, uv: 0 },
    forgetPassword: { pv: 0, uv: 0 },
    schoolGuideClick: { pv: 0, uv: 0 },
  };

  for (const r of rows) {
    if (r.page === "member" && r.class_id) {
      byClass[r.class_id] = { pv: Number(r.pv), uv: Number(r.uv) };
    } else if (r.page in site) {
      site[r.page] = { pv: Number(r.pv), uv: Number(r.uv) };
    }
  }

  return NextResponse.json({ byClass, site });
}
