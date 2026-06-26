import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.classId === "admin";
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({}, { status: 401 });
  const classId = req.nextUrl.searchParams.get("classId");
  const year = req.nextUrl.searchParams.get("year") ?? "2026";
  const { data } = await supabaseAdmin!.from("koryo_results")
    .select("*").eq("class_id", classId).eq("year", year).maybeSingle();
  return NextResponse.json({ result: data });
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({}, { status: 401 });
  const body = await req.json();
  const { classId, year, ...fields } = body;
  // 数値変換
  const numFields = ["grade","class_num","visitors","visitors_max","ticket","ticket_max",
    "under_junior","under_junior_max","high_school","high_school_max","univ_30","univ_30_max",
    "age_40_50","age_40_50_max","over_60","over_60_max","ex_student","ex_student_max",
    "vote_in_school","vote_in_school_max","vote_decoration","vote_decoration_max",
    "rank_school","rank_school_total","rank_grade","rank_grade_total"];
  const floatFields = ["total_score","total_max","deviation_school","avg_school","deviation_grade","avg_grade"];
  const payload: Record<string, unknown> = { class_id: classId, year: Number(year) };
  for (const [k, v] of Object.entries(fields)) {
    if (v === "" || v == null) { payload[k] = null; continue; }
    if (numFields.includes(k))   payload[k] = parseInt(String(v));
    else if (floatFields.includes(k)) payload[k] = parseFloat(String(v));
    else payload[k] = v;
  }
  const { error } = await supabaseAdmin!.from("koryo_results")
    .upsert(payload, { onConflict: "class_id,year" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
