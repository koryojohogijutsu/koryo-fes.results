import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

/**
 * 全クラスのランキング取得ロジック
 * --------------------------------------------------------------
 * scores テーブルを to_class_id ごとに集計し、平均点の高い順に
 * ランキングを作成します。
 *
 * Supabase未設定時はダミーデータにフォールバックします。
 */

export interface ClassRankingEntry {
  classId: string;
  className: string;
  averageScore: number;
  totalCount: number;
  rank: number;
}

// ──────────────────────────────────────────────
// ダミーデータ（Supabase未接続時のフォールバック）
// ──────────────────────────────────────────────
const DUMMY_RANKING: Omit<ClassRankingEntry, "rank">[] = [
  { classId: "1-3", className: "1年3組", averageScore: 4.6, totalCount: 12 },
  { classId: "1-1", className: "1年1組", averageScore: 4.1, totalCount: 3 },
  { classId: "2-1", className: "2年1組", averageScore: 3.9, totalCount: 8 },
  { classId: "1-2", className: "1年2組", averageScore: 4.2, totalCount: 1 },
];

function attachRanks(
  entries: Omit<ClassRankingEntry, "rank">[]
): ClassRankingEntry[] {
  const sorted = [...entries].sort((a, b) => b.averageScore - a.averageScore);
  return sorted.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/**
 * 全クラスのランキングを取得する。
 */
export async function getClassRanking(): Promise<ClassRankingEntry[]> {
  if (isSupabaseAdminConfigured() && supabaseAdmin) {
    try {
      // クラス一覧を取得（adminクラスは除外）
      const { data: classes, error: classesError } = await supabaseAdmin
        .from("classes")
        .select("id, name")
        .neq("id", "admin");

      if (classesError || !classes) throw classesError;

      // 各クラスの評価データを取得
      const { data: scores, error: scoresError } = await supabaseAdmin
        .from("scores")
        .select("to_class_id, score");

      if (scoresError) throw scoresError;

      const entries: Omit<ClassRankingEntry, "rank">[] = classes.map((c) => {
        const classScores = (scores ?? []).filter((s) => s.to_class_id === c.id);
        const totalCount = classScores.length;
        const averageScore =
          totalCount === 0
            ? 0
            : Math.round(
                (classScores.reduce((sum, s) => sum + Number(s.score), 0) / totalCount) * 10
              ) / 10;

        return {
          classId: c.id,
          className: c.name,
          averageScore,
          totalCount,
        };
      });

      return attachRanks(entries);
    } catch {
      // 失敗時はダミーにフォールバック
    }
  }

  return attachRanks(DUMMY_RANKING);
}
