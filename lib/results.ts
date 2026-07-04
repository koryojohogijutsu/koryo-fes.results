import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

// 項目（来場者数・紙チケットなど）ごとの校内/学年の偏差値・順位・平均値
export interface ItemStat {
  value?: number;   max?: number;
  deviationSchool?: number; rankSchool?: number; avgSchool?: number;
  deviationGrade?: number;  rankGrade?: number;   avgGrade?: number;
}

export interface ClassResult {
  planName?: string;
  targetMessage?: string;
  ktz?: string;
  totalScore?: number;     totalMax?: number;
  deviationSchool?: number; rankSchool?: number; rankSchoolTotal?: number; avgSchool?: number;
  deviationGrade?: number;  rankGrade?: number;  rankGradeTotal?: number;  avgGrade?: number;

  visitors: ItemStat;
  ticket: ItemStat;
  underJunior: ItemStat;
  highSchool: ItemStat;
  univ30: ItemStat;
  age4050: ItemStat;
  over60: ItemStat;
  exStudent: ItemStat;
  voteInSchool: ItemStat;
  voteDecoration: ItemStat;
}

export interface GraphUrls {
  radar?: string;
  pieGender?: string;
}

const n = (v: unknown) => v != null ? Number(v) : undefined;

// data から prefix_xxx 列を読み取って ItemStat を組み立てるヘルパー
function readItemStat(data: Record<string, unknown>, prefix: string): ItemStat {
  return {
    value: n(data[prefix]),
    max: n(data[`${prefix}_max`]),
    deviationSchool: n(data[`${prefix}_deviation_school`]),
    rankSchool: n(data[`${prefix}_rank_school`]),
    avgSchool: n(data[`${prefix}_avg_school`]),
    deviationGrade: n(data[`${prefix}_deviation_grade`]),
    rankGrade: n(data[`${prefix}_rank_grade`]),
    avgGrade: n(data[`${prefix}_avg_grade`]),
  };
}

export async function getClassResult(classId: string, year = 2026): Promise<ClassResult | null> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("koryo_results").select("*")
    .eq("class_id", classId).eq("year", year).maybeSingle();
  if (error || !data) return null;

  return {
    planName: data.plan_name ?? undefined,
    targetMessage: data.target_message ?? undefined,
    ktz: data.ktz ?? undefined,
    totalScore: n(data.total_score), totalMax: n(data.total_max),
    deviationSchool: n(data.deviation_school), rankSchool: n(data.rank_school),
    rankSchoolTotal: n(data.rank_school_total), avgSchool: n(data.avg_school),
    deviationGrade: n(data.deviation_grade),   rankGrade: n(data.rank_grade),
    rankGradeTotal: n(data.rank_grade_total),   avgGrade: n(data.avg_grade),

    visitors:       readItemStat(data, "visitors"),
    ticket:         readItemStat(data, "ticket"),
    underJunior:    readItemStat(data, "under_junior"),
    highSchool:     readItemStat(data, "high_school"),
    univ30:         readItemStat(data, "univ_30"),
    age4050:        readItemStat(data, "age_40_50"),
    over60:         readItemStat(data, "over_60"),
    exStudent:      readItemStat(data, "ex_student"),
    voteInSchool:   readItemStat(data, "vote_in_school"),
    voteDecoration: readItemStat(data, "vote_decoration"),
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

export interface VisitorComment {
  id: string;
  q1?: string;
  q2?: string;
  q3?: string;
  createdAt: string;
}

export async function getVisitorComments(classId: string, year = 2026): Promise<VisitorComment[]> {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin
    .from("koryo_comments").select("id, q1, q2, q3, created_at")
    .eq("class_id", classId).eq("year", year)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(d => ({
    id: d.id,
    q1: d.q1 ?? undefined,
    q2: d.q2 ?? undefined,
    q3: d.q3 ?? undefined,
    createdAt: d.created_at,
  }));
}
