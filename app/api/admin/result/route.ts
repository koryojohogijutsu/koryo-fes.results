import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

const NUM = [
  "grade","class_num",
  "visitors","visitors_max","visitors_rank_school","visitors_rank_grade",
  "ticket","ticket_max","ticket_rank_school","ticket_rank_grade",
  "under_junior","under_junior_max","under_junior_rank_school","under_junior_rank_grade",
  "high_school","high_school_max","high_school_rank_school","high_school_rank_grade",
  "univ_30","univ_30_max","univ_30_rank_school","univ_30_rank_grade",
  "age_40_50","age_40_50_max","age_40_50_rank_school","age_40_50_rank_grade",
  "over_60","over_60_max","over_60_rank_school","over_60_rank_grade",
  "ex_student","ex_student_max","ex_student_rank_school","ex_student_rank_grade",
  "vote_in_school","vote_in_school_max","vote_in_school_rank_school","vote_in_school_rank_grade",
  "vote_decoration","vote_decoration_max","vote_decoration_rank_school","vote_decoration_rank_grade",
  "rank_school","rank_school_total","rank_grade","rank_grade_total",
];
const FLOAT = [
  "total_score","total_max","deviation_school","avg_school","deviation_grade","avg_grade",
  "visitors_deviation_school","visitors_avg_school","visitors_deviation_grade","visitors_avg_grade",
  "ticket_deviation_school","ticket_avg_school","ticket_deviation_grade","ticket_avg_grade",
  "under_junior_deviation_school","under_junior_avg_school","under_junior_deviation_grade","under_junior_avg_grade",
  "high_school_deviation_school","high_school_avg_school","high_school_deviation_grade","high_school_avg_grade",
  "univ_30_deviation_school","univ_30_avg_school","univ_30_deviation_grade","univ_30_avg_grade",
  "age_40_50_deviation_school","age_40_50_avg_school","age_40_50_deviation_grade","age_40_50_avg_grade",
  "over_60_deviation_school","over_60_avg_school","over_60_deviation_grade","over_60_avg_grade",
  "ex_student_deviation_school","ex_student_avg_school","ex_student_deviation_grade","ex_student_avg_grade",
  "vote_in_school_deviation_school","vote_in_school_avg_school","vote_in_school_deviation_grade","vote_in_school_avg_grade",
  "vote_decoration_deviation_school","vote_decoration_avg_school","vote_decoration_deviation_grade","vote_decoration_avg_grade",
];

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

  // classId は "{学年}-{組番号}" 形式（例: "1-3" = 1年3組）。
  // grade / class_num は koryo_results で NOT NULL のため、フォームに項目がなくても
  // classId から必ず算出してセットする。
  const [gradePart, classNumPart] = classId.split("-");
  const grade    = parseInt(gradePart, 10);
  const classNum = classNumPart != null ? parseInt(classNumPart, 10) : NaN;
  if (Number.isNaN(grade) || Number.isNaN(classNum)) {
    return NextResponse.json(
      { error: `classId の形式が不正です（"学年-組番号" である必要があります）: ${classId}` },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    class_id: classId,
    year: Number(year ?? 2026),
    grade,
    class_num: classNum,
  };
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
