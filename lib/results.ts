import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export interface ClassResult {
  planName?: string;
  targetMessage?: string;
  ktz?: string;
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
  deviationSchool?: number; rankSchool?: number; rankSchoolTotal?: number; avgSchool?: number;
  deviationGrade?: number;  rankGrade?: number;  rankGradeTotal?: number;  avgGrade?: number;
}

export interface GraphUrls {
  radar?: string;
  pieGender?: string;
}

export async function getClassResult(classId: string, year = 2026): Promise<ClassResult | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("koryo_results").select("*")
    .eq("class_id", classId).eq("year", year).maybeSingle();
  if (error || !data) return null;
  const n = (v: unknown) => v != null ? Number(v) : undefined;
  return {
    planName: data.plan_name ?? undefined,
    targetMessage: data.target_message ?? undefined,
    ktz: data.ktz ?? undefined,
    totalScore: n(data.total_score),     totalMax: n(data.total_max),
    visitors: n(data.visitors),          visitorsMax: n(data.visitors_max),
    ticket: n(data.ticket),              ticketMax: n(data.ticket_max),
    underJunior: n(data.under_junior),   underJuniorMax: n(data.under_junior_max),
    highSchool: n(data.high_school),     highSchoolMax: n(data.high_school_max),
    univ30: n(data.univ_30),             univ30Max: n(data.univ_30_max),
    age4050: n(data.age_40_50),          age4050Max: n(data.age_40_50_max),
    over60: n(data.over_60),             over60Max: n(data.over_60_max),
    exStudent: n(data.ex_student),       exStudentMax: n(data.ex_student_max),
    voteInSchool: n(data.vote_in_school),   voteInSchoolMax: n(data.vote_in_school_max),
    voteDecoration: n(data.vote_decoration), voteDecorationMax: n(data.vote_decoration_max),
    deviationSchool: n(data.deviation_school), rankSchool: n(data.rank_school),
    rankSchoolTotal: n(data.rank_school_total), avgSchool: n(data.avg_school),
    deviationGrade: n(data.deviation_grade),   rankGrade: n(data.rank_grade),
    rankGradeTotal: n(data.rank_grade_total),   avgGrade: n(data.avg_grade),
  };
}

export async function getGraphUrls(classId: string, year = 2026): Promise<GraphUrls> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return {};
  const { data, error } = await supabaseAdmin
    .from("koryo_graphs").select("graph_type, storage_path")
    .eq("class_id", classId).eq("year", year);
  if (error || !data) return {};
  const urls: GraphUrls = {};
  for (const row of data) {
    const { data: signed } = await supabaseAdmin.storage
      .from("koryo-graphs").createSignedUrl(row.storage_path, 3600);
    const url = signed?.signedUrl;
    if (!url) continue;
    if (row.graph_type === "radar")      urls.radar     = url;
    if (row.graph_type === "pie_gender") urls.pieGender = url;
  }
  return urls;
}

export async function getVisitorComments(classId: string, year = 2026) {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("koryo_comments").select("id, comment, created_at")
    .eq("class_id", classId).eq("year", year)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(d => ({ id: d.id, comment: d.comment, createdAt: d.created_at }));
}
