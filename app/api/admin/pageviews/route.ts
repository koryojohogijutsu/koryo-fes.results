import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

interface StatRow  { page: string; class_id: string | null; pv: number; uv: number; }
interface MonthRow { yr: number; mo: number; }

const CURRENT_YEAR = new Date().getFullYear();

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const yearParam  = req.nextUrl.searchParams.get("year");
  const monthParam = req.nextUrl.searchParams.get("month"); // "" or null = 年間合計

  const year  = Number(yearParam ?? CURRENT_YEAR);
  const month = monthParam ? Number(monthParam) : null;

  const [{ data: statData, error: statErr }, { data: monthData, error: monthErr }] = await Promise.all([
    supabaseAdmin.rpc("koryo_page_view_stats", { target_year: year, target_month: month }),
    supabaseAdmin.rpc("koryo_page_view_months"),
  ]);

  if (statErr)  return NextResponse.json({ error: statErr.message }, { status: 500 });
  if (monthErr) return NextResponse.json({ error: monthErr.message }, { status: 500 });

  const rows = (statData ?? []) as StatRow[];

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

  // データが存在する年月の一覧（プルダウン用）。データが1件も無ければ今年だけを候補にする。
  const months = ((monthData ?? []) as MonthRow[]).map(m => ({ year: m.yr, month: m.mo }));

  return NextResponse.json({ byClass, site, months, selected: { year, month } });
}
