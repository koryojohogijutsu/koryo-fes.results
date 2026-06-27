import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const NUM  = ["grade","class_num","visitors","visitors_max","ticket","ticket_max","under_junior","under_junior_max","high_school","high_school_max","univ_30","univ_30_max","age_40_50","age_40_50_max","over_60","over_60_max","ex_student","ex_student_max","vote_in_school","vote_in_school_max","vote_decoration","vote_decoration_max","rank_school","rank_school_total","rank_grade","rank_grade_total"];
const FLOAT = ["total_score","total_max","deviation_school","avg_school","deviation_grade","avg_grade"];

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const classId = req.nextUrl.searchParams.get("classId");
  const year    = req.nextUrl.searchParams.get("year") ?? "2026";
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("koryo_results").select("*")
    .eq("class_id", classId).eq("year", Number(year)).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data ?? null });
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { classId, year, ...fields } = body;
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const payload: Record<string, unknown> = { class_id: classId, year: Number(year ?? 2026) };
  for (const [k, v] of Object.entries(fields)) {
    if (v === "" || v == null) { payload[k] = null; continue; }
    if (NUM.includes(k))   { payload[k] = parseInt(String(v), 10);  continue; }
    if (FLOAT.includes(k)) { payload[k] = parseFloat(String(v));    continue; }
    payload[k] = v;
  }

  const { error } = await supabaseAdmin
    .from("koryo_results").upsert(payload, { onConflict: "class_id,year" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
