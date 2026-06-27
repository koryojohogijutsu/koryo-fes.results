import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

const NUM_FIELDS = [
  "grade","class_num","visitors","visitors_max","ticket","ticket_max",
  "under_junior","under_junior_max","high_school","high_school_max",
  "univ_30","univ_30_max","age_40_50","age_40_50_max",
  "over_60","over_60_max","ex_student","ex_student_max",
  "vote_in_school","vote_in_school_max","vote_decoration","vote_decoration_max",
  "rank_school","rank_school_total","rank_grade","rank_grade_total",
];
const FLOAT_FIELDS = [
  "total_score","total_max","deviation_school","avg_school","deviation_grade","avg_grade",
];

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const classId = req.nextUrl.searchParams.get("classId");
  const year    = req.nextUrl.searchParams.get("year") ?? "2026";

  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin!
    .from("koryo_results")
    .select("*")
    .eq("class_id", classId)
    .eq("year", Number(year))
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data ?? null });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();
  const { classId, year, ...fields } = body;

  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const payload: Record<string, unknown> = {
    class_id: classId,
    year: Number(year ?? 2026),
  };

  for (const [k, v] of Object.entries(fields)) {
    if (v === "" || v == null) { payload[k] = null; continue; }
    if (NUM_FIELDS.includes(k))   { payload[k] = parseInt(String(v), 10); continue; }
    if (FLOAT_FIELDS.includes(k)) { payload[k] = parseFloat(String(v));   continue; }
    payload[k] = v;
  }

  const { error } = await supabaseAdmin!
    .from("koryo_results")
    .upsert(payload, { onConflict: "class_id,year" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
