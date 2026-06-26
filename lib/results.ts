import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

// ── 型定義 ────────────────────────────────────────────────────

export interface ClassResult {
  id?: string;
  classId: string;
  year: number;
  grade: number;
  classNum: number;
  schoolNum?: string;
  planName?: string;

  totalScore?: number;     totalMax?: number;
  visitors?: number;       visitorsMax?: number;
  ticket?: number;         ticketMax?: number;
  underJunior?: number;    underJuniorMax?: number;
  highSchool?: number;     highSchoolMax?: number;
  univ30?: number;         univ30Max?: number;
  age4050?: number;        age4050Max?: number;
  over60?: number;         over60Max?: number;
  exStudent?: number;      exStudentMax?: number;
  voteInSchool?: number;   voteInSchoolMax?: number;
  voteDecoration?: number; voteDecorationMax?: number;

  deviationSchool?: number;
  rankSchool?: number;
  rankSchoolTotal?: number;
  avgSchool?: number;

  deviationGrade?: number;
  rankGrade?: number;
  rankGradeTotal?: number;
  avgGrade?: number;

  ktz?: string;
  targetMessage?: string;
}

export interface GraphUrls {
  radar?: string;
  pieGender?: string;
  pieOther?: string;
}

export interface VisitorComment {
  id: string;
  comment: string;
  createdAt: string;
}

// ── 成績取得 ──────────────────────────────────────────────────

export async function getClassResult(classId: string, year = 2026): Promise<ClassResult | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("koryo_results")
    .select("*")
    .eq("class_id", classId)
    .eq("year", year)
    .maybeSingle();
  if (error || !data) return null;
  return mapResult(data);
}

function mapResult(d: Record<string, unknown>): ClassResult {
  return {
    id: d.id as string,
    classId: d.class_id as string,
    year: d.year as number,
    grade: d.grade as number,
    classNum: d.class_num as number,
    schoolNum: d.school_num as string | undefined,
    planName: d.plan_name as string | undefined,
    totalScore: d.total_score != null ? Number(d.total_score) : undefined,
    totalMax: d.total_max != null ? Number(d.total_max) : undefined,
    visitors: d.visitors as number | undefined,
    visitorsMax: d.visitors_max as number | undefined,
    ticket: d.ticket as number | undefined,
    ticketMax: d.ticket_max as number | undefined,
    underJunior: d.under_junior as number | undefined,    underJuniorMax: d.under_junior_max as number | undefined,
    highSchool: d.high_school as number | undefined,      highSchoolMax: d.high_school_max as number | undefined,
    univ30: d.univ_30 as number | undefined,              univ30Max: d.univ_30_max as number | undefined,
    age4050: d.age_40_50 as number | undefined,           age4050Max: d.age_40_50_max as number | undefined,
    over60: d.over_60 as number | undefined,              over60Max: d.over_60_max as number | undefined,
    exStudent: d.ex_student as number | undefined,        exStudentMax: d.ex_student_max as number | undefined,
    voteInSchool: d.vote_in_school as number | undefined, voteInSchoolMax: d.vote_in_school_max as number | undefined,
    voteDecoration: d.vote_decoration as number | undefined, voteDecorationMax: d.vote_decoration_max as number | undefined,
    deviationSchool: d.deviation_school != null ? Number(d.deviation_school) : undefined,
    rankSchool: d.rank_school as number | undefined,
    rankSchoolTotal: d.rank_school_total as number | undefined,
    avgSchool: d.avg_school != null ? Number(d.avg_school) : undefined,
    deviationGrade: d.deviation_grade != null ? Number(d.deviation_grade) : undefined,
    rankGrade: d.rank_grade as number | undefined,
    rankGradeTotal: d.rank_grade_total as number | undefined,
    avgGrade: d.avg_grade != null ? Number(d.avg_grade) : undefined,
    ktz: d.ktz as string | undefined,
    targetMessage: d.target_message as string | undefined,
  };
}

// ── グラフ画像URL取得 ─────────────────────────────────────────

export async function getGraphUrls(classId: string, year = 2026): Promise<GraphUrls> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return {};
  const { data, error } = await supabaseAdmin
    .from("koryo_graphs")
    .select("graph_type, storage_path")
    .eq("class_id", classId)
    .eq("year", year);
  if (error || !data) return {};

  const urls: GraphUrls = {};
  for (const row of data) {
    const { data: urlData } = supabaseAdmin.storage
      .from("koryo-graphs")
      .getPublicUrl(row.storage_path);
    // 署名付きURLが必要な場合は createSignedUrl を使う
    const { data: signed } = await supabaseAdmin.storage
      .from("koryo-graphs")
      .createSignedUrl(row.storage_path, 3600);
    const url = signed?.signedUrl ?? urlData?.publicUrl;
    if (row.graph_type === "radar")      urls.radar     = url;
    if (row.graph_type === "pie_gender") urls.pieGender = url;
    if (row.graph_type === "pie_other")  urls.pieOther  = url;
  }
  return urls;
}

// ── 来場者コメント取得 ────────────────────────────────────────

export async function getVisitorComments(classId: string, year = 2026): Promise<VisitorComment[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("koryo_comments")
    .select("id, comment, created_at")
    .eq("class_id", classId)
    .eq("year", year)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(d => ({ id: d.id, comment: d.comment, createdAt: d.created_at }));
}

// ── 成績保存（管理者UI用） ────────────────────────────────────

export async function upsertClassResult(result: ClassResult): Promise<boolean> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return false;
  const { error } = await supabaseAdmin.from("koryo_results").upsert({
    class_id: result.classId, year: result.year,
    grade: result.grade, class_num: result.classNum,
    school_num: result.schoolNum, plan_name: result.planName,
    total_score: result.totalScore, total_max: result.totalMax,
    visitors: result.visitors, visitors_max: result.visitorsMax,
    ticket: result.ticket, ticket_max: result.ticketMax,
    under_junior: result.underJunior, under_junior_max: result.underJuniorMax,
    high_school: result.highSchool, high_school_max: result.highSchoolMax,
    univ_30: result.univ30, univ_30_max: result.univ30Max,
    age_40_50: result.age4050, age_40_50_max: result.age4050Max,
    over_60: result.over60, over_60_max: result.over60Max,
    ex_student: result.exStudent, ex_student_max: result.exStudentMax,
    vote_in_school: result.voteInSchool, vote_in_school_max: result.voteInSchoolMax,
    vote_decoration: result.voteDecoration, vote_decoration_max: result.voteDecorationMax,
    deviation_school: result.deviationSchool, rank_school: result.rankSchool,
    rank_school_total: result.rankSchoolTotal, avg_school: result.avgSchool,
    deviation_grade: result.deviationGrade, rank_grade: result.rankGrade,
    rank_grade_total: result.rankGradeTotal, avg_grade: result.avgGrade,
    ktz: result.ktz, target_message: result.targetMessage,
  }, { onConflict: "class_id,year" });
  return !error;
}
