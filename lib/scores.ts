import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

/**
 * 評価データの型定義
 * --------------------------------------------------------------
 * Supabase koryo_scores テーブル想定スキーマ:
 *   id            uuid PK
 *   from_class_id text  (評価したクラス)
 *   to_class_id   text  (評価されたクラス)
 *   score         numeric(3,1)  総合スコア 0〜5
 *   comment       text  自由記述コメント
 *   created_at    timestamptz
 *
 * 評価項目別・Q&A対応のため、以下カラムを追加予定:
 *   score_naiso   numeric(3,1)  内装
 *   score_settai  numeric(3,1)  接客
 *   score_kikaku  numeric(3,1)  企画
 *   score_moriagari numeric(3,1) 盛り上がり
 *   qa_answers    jsonb  { "q1": "回答文", "q2": "回答文", ... }
 *
 * 現時点ではダミーデータで表示構造を確認してください。
 * Supabaseにカラムを追加後、getScoresForClass()内のselectを更新してください。
 */

export interface ScoreEntry {
  id: string;
  fromClassId: string;
  score: number;         // 総合 0〜5
  scoreNaiso?: number;   // 内装
  scoreSettai?: number;  // 接客
  scoreKikaku?: number;  // 企画
  scoreMoriagari?: number; // 盛り上がり
  comment: string;
  qaAnswers?: Record<string, string>; // { q1: "回答", q2: "回答" }
  createdAt: string;
}

export interface ItemScore {
  label: string;       // 項目名
  key: string;         // キー
  myScore: number;     // 自クラスの平均
  maxScore: number;    // 満点
  average: number;     // 全体平均
  rank: number;        // 全体順位
  totalClasses: number;
}

export interface ClassScoreSummary {
  classId: string;
  averageScore: number;
  totalCount: number;
  entries: ScoreEntry[];
  itemScores: ItemScore[];
}

// ── Q&A の質問定義（実際の質問文に変更してください） ──
export const QA_QUESTIONS: { key: string; label: string }[] = [
  { key: "q1", label: "企画全体の印象はいかがでしたか？" },
  { key: "q2", label: "特に良かった点を教えてください。" },
  { key: "q3", label: "改善してほしい点はありますか？" },
  { key: "q4", label: "また来たいと思いますか？" },
];

// ── ダミーデータ ──
const DUMMY_ENTRIES: Record<string, ScoreEntry[]> = {
  "1-1": [
    {
      id: "d1", fromClassId: "1-2", score: 4.5,
      scoreNaiso: 5.0, scoreSettai: 4.0, scoreKikaku: 4.5, scoreMoriagari: 4.5,
      comment: "内装がとても凝っていて驚きました！スタッフの方も親切で楽しめました。",
      qaAnswers: { q1: "とても良かった", q2: "内装のクオリティが高かった", q3: "待ち時間が少し長かった", q4: "ぜひまた来たい" },
      createdAt: "2026-06-20T10:00:00Z",
    },
    {
      id: "d2", fromClassId: "1-3", score: 4.0,
      scoreNaiso: 3.5, scoreSettai: 4.5, scoreKikaku: 4.0, scoreMoriagari: 4.0,
      comment: "接客が丁寧で楽しめました。もう少し内装を凝ってほしかったです。",
      qaAnswers: { q1: "良かった", q2: "スタッフの笑顔が良かった", q3: "内装をもっと工夫してほしい", q4: "また来たい" },
      createdAt: "2026-06-20T11:30:00Z",
    },
    {
      id: "d3", fromClassId: "2-1", score: 3.8,
      scoreNaiso: 4.0, scoreSettai: 3.5, scoreKikaku: 4.0, scoreMoriagari: 3.5,
      comment: "もう少し待ち時間が短いと良いと思います。",
      qaAnswers: { q1: "普通", q2: "企画が面白かった", q3: "待ち時間の改善", q4: "多分来る" },
      createdAt: "2026-06-20T13:15:00Z",
    },
  ],
  "1-2": [
    {
      id: "d4", fromClassId: "1-1", score: 4.2,
      scoreNaiso: 4.0, scoreSettai: 4.5, scoreKikaku: 4.0, scoreMoriagari: 4.5,
      comment: "企画のアイデアが面白かったです。また来年も参加したいです！",
      qaAnswers: { q1: "とても良かった", q2: "企画の独創性", q3: "特になし", q4: "ぜひ来たい" },
      createdAt: "2026-06-20T10:20:00Z",
    },
  ],
  admin: [],
};

// 全体平均（ダミー）
const DUMMY_ALL_AVERAGES: Record<string, number> = {
  scoreNaiso: 3.8, scoreSettai: 3.9, scoreKikaku: 4.0, scoreMoriagari: 3.7,
};

const ITEM_DEFS = [
  { label: "内装",    key: "scoreNaiso",     max: 5 },
  { label: "接客",    key: "scoreSettai",    max: 5 },
  { label: "企画",    key: "scoreKikaku",    max: 5 },
  { label: "盛り上がり", key: "scoreMoriagari", max: 5 },
];

function buildSummary(classId: string, entries: ScoreEntry[], allClassAverages?: Record<string, number>): ClassScoreSummary {
  const totalCount = entries.length;
  const averageScore = totalCount === 0 ? 0
    : Math.round(entries.reduce((s, e) => s + e.score, 0) / totalCount * 10) / 10;

  // 項目別スコア集計
  const itemScores: ItemScore[] = ITEM_DEFS.map(({ label, key, max }) => {
    const vals = entries.map(e => (e as Record<string, number>)[key]).filter(v => v != null);
    const myScore = vals.length === 0 ? 0 : Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10;
    const average = allClassAverages?.[key] ?? DUMMY_ALL_AVERAGES[key] ?? 0;
    return { label, key, myScore, maxScore: max, average, rank: 0, totalClasses: 0 };
  });

  return { classId, averageScore, totalCount, entries, itemScores };
}

export async function getScoresForClass(classId: string): Promise<ClassScoreSummary> {
  if (isSupabaseAdminConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("koryo_scores")
        .select("id, from_class_id, score, score_naiso, score_settai, score_kikaku, score_moriagari, comment, qa_answers, created_at")
        .eq("to_class_id", classId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const entries: ScoreEntry[] = data.map(row => ({
          id: row.id,
          fromClassId: row.from_class_id,
          score: Number(row.score),
          scoreNaiso: row.score_naiso != null ? Number(row.score_naiso) : undefined,
          scoreSettai: row.score_settai != null ? Number(row.score_settai) : undefined,
          scoreKikaku: row.score_kikaku != null ? Number(row.score_kikaku) : undefined,
          scoreMoriagari: row.score_moriagari != null ? Number(row.score_moriagari) : undefined,
          comment: row.comment ?? "",
          qaAnswers: row.qa_answers ?? {},
          createdAt: row.created_at,
        }));
        return buildSummary(classId, entries);
      }
    } catch { /* fallback */ }
  }
  return buildSummary(classId, DUMMY_ENTRIES[classId] ?? []);
}
