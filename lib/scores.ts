import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * 評価データの取得ロジック
 * --------------------------------------------------------------
 * 想定テーブル構成（Supabaseに作成する場合の例）:
 *
 *   table: scores
 *     id            uuid (PK)
 *     from_class_id text   -- 評価した側のクラス
 *     to_class_id   text   -- 評価された側のクラス（自分のクラス宛）
 *     score         numeric
 *     comment       text
 *     created_at    timestamptz
 *
 * 今はテーブル未作成のため、Supabase未設定 or 取得失敗時は
 * ダミーデータにフォールバックします。
 * Supabaseのテーブルが用意でき次第、下の getScoresForClass() の
 * 中身だけ差し替えれば、呼び出し側（/memberページ）は変更不要です。
 */

export interface ScoreEntry {
  id: string;
  fromClassId: string;
  score: number; // 1.0 〜 5.0 等、運用に合わせて調整
  comment: string;
  createdAt: string;
}

export interface ClassScoreSummary {
  classId: string;
  averageScore: number;
  totalCount: number;
  entries: ScoreEntry[];
}

// ──────────────────────────────────────────────
// ダミーデータ（Supabase未接続時のフォールバック）
// ──────────────────────────────────────────────
const DUMMY_ENTRIES: Record<string, ScoreEntry[]> = {
  "1-1": [
    { id: "d1", fromClassId: "1-2", score: 4.5, comment: "内装がとても凝っていて驚きました！", createdAt: "2026-06-20T10:00:00Z" },
    { id: "d2", fromClassId: "1-3", score: 4.0, comment: "接客が丁寧で楽しめました。", createdAt: "2026-06-20T11:30:00Z" },
    { id: "d3", fromClassId: "2-1", score: 3.8, comment: "もう少し待ち時間が短いと良いと思います。", createdAt: "2026-06-20T13:15:00Z" },
  ],
  "1-2": [
    { id: "d4", fromClassId: "1-1", score: 4.2, comment: "企画のアイデアが面白かったです。", createdAt: "2026-06-20T10:20:00Z" },
  ],
  admin: [],
};

function buildSummaryFromEntries(classId: string, entries: ScoreEntry[]): ClassScoreSummary {
  const totalCount = entries.length;
  const averageScore =
    totalCount === 0
      ? 0
      : Math.round((entries.reduce((sum, e) => sum + e.score, 0) / totalCount) * 10) / 10;

  return { classId, averageScore, totalCount, entries };
}

/**
 * 指定クラス宛の評価結果サマリーを取得する。
 * Supabaseが設定されていればそちらから取得し、
 * 失敗時・未設定時はダミーデータを返す。
 */
export async function getScoresForClass(classId: string): Promise<ClassScoreSummary> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("id, from_class_id, score, comment, created_at")
        .eq("to_class_id", classId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const entries: ScoreEntry[] = data.map((row) => ({
          id: row.id,
          fromClassId: row.from_class_id,
          score: Number(row.score),
          comment: row.comment ?? "",
          createdAt: row.created_at,
        }));
        return buildSummaryFromEntries(classId, entries);
      }
      // エラー時はダミーにフォールバック（下に続く）
    } catch {
      // 接続失敗時もダミーにフォールバック
    }
  }

  const dummyEntries = DUMMY_ENTRIES[classId] ?? [];
  return buildSummaryFromEntries(classId, dummyEntries);
}
