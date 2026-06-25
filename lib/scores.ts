import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export interface ScoreEntry {
  id: string;
  fromClassId: string;
  score: number;
  scoreNaiso?: number;
  scoreSettai?: number;
  scoreKikaku?: number;
  scoreMoriagari?: number;
  comment: string;
  qaAnswers?: Record<string, string>;
  createdAt: string;
}

export interface ItemScore {
  label: string;
  key: string;
  myScore: number;
  maxScore: number;
  average: number;
  rank: number;
  totalClasses: number;
}

export interface ClassScoreSummary {
  classId: string;
  averageScore: number;
  totalCount: number;
  entries: ScoreEntry[];
  itemScores: ItemScore[];
}

export const QA_QUESTIONS: { key: string; label: string }[] = [
  { key: "q1", label: "企画全体の印象はいかがでしたか？" },
  { key: "q2", label: "特に良かった点を教えてください。" },
  { key: "q3", label: "改善してほしい点はありますか？" },
  { key: "q4", label: "また来たいと思いますか？" },
];

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

const DUMMY_ALL_AVERAGES: Record<string, number> = {
  scoreNaiso: 3.8, scoreSettai: 3.9, scoreKikaku: 4.0, scoreMoriagari: 3.7,
};

const ITEM_DEFS: { label: string; key: keyof ScoreEntry; max: number }[] = [
  { label: "内装",      key: "scoreNaiso",      max: 5 },
  { label: "接客",      key: "scoreSettai",     max: 5 },
  { label: "企画",      key: "scoreKikaku",     max: 5 },
  { label: "盛り上がり", key: "scoreMoriagari",  max: 5 },
];

function buildSummary(
  classId: string,
  entries: ScoreEntry[],
  allClassAverages?: Record<string, number>
): ClassScoreSummary {
  const totalCount = entries.length;
  const averageScore =
    totalCount === 0
      ? 0
      : Math.round((entries.reduce((s, e) => s + e.score, 0) / totalCount) * 10) / 10;

  const itemScores: ItemScore[] = ITEM_DEFS.map(({ label, key, max }) => {
    const vals = entries
      .map(e => e[key] as number | undefined)
      .filter((v): v is number => v != null);
    const myScore =
      vals.length === 0
        ? 0
        : Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    const average = allClassAverages?.[key] ?? DUMMY_ALL_AVERAGES[key] ?? 0;
    return { label, key: String(key), myScore, maxScore: max, average, rank: 0, totalClasses: 0 };
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
          scoreNaiso:      row.score_naiso      != null ? Number(row.score_naiso)      : undefined,
          scoreSettai:     row.score_settai     != null ? Number(row.score_settai)     : undefined,
          scoreKikaku:     row.score_kikaku     != null ? Number(row.score_kikaku)     : undefined,
          scoreMoriagari:  row.score_moriagari  != null ? Number(row.score_moriagari)  : undefined,
          comment:    row.comment    ?? "",
          qaAnswers:  row.qa_answers ?? {},
          createdAt:  row.created_at,
        }));
        return buildSummary(classId, entries);
      }
    } catch { /* fallback */ }
  }
  return buildSummary(classId, DUMMY_ENTRIES[classId] ?? []);
}
