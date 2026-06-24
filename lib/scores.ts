import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export interface ScoreEntry { id:string; fromClassId:string; score:number; comment:string; createdAt:string; }
export interface ClassScoreSummary { classId:string; averageScore:number; totalCount:number; entries:ScoreEntry[]; }

const DUMMY_ENTRIES: Record<string, ScoreEntry[]> = {
  "1-1": [
    { id:"d1", fromClassId:"1-2", score:4.5, comment:"内装がとても凝っていて驚きました！", createdAt:"2026-06-20T10:00:00Z" },
    { id:"d2", fromClassId:"1-3", score:4.0, comment:"接客が丁寧で楽しめました。",           createdAt:"2026-06-20T11:30:00Z" },
    { id:"d3", fromClassId:"2-1", score:3.8, comment:"もう少し待ち時間が短いと良いです。",   createdAt:"2026-06-20T13:15:00Z" },
  ],
  "1-2": [{ id:"d4", fromClassId:"1-1", score:4.2, comment:"企画のアイデアが面白かったです。", createdAt:"2026-06-20T10:20:00Z" }],
  admin: [],
};

function buildSummary(classId:string, entries:ScoreEntry[]): ClassScoreSummary {
  const totalCount = entries.length;
  const averageScore = totalCount===0 ? 0 : Math.round(entries.reduce((s,e)=>s+e.score,0)/totalCount*10)/10;
  return { classId, averageScore, totalCount, entries };
}

export async function getScoresForClass(classId:string): Promise<ClassScoreSummary> {
  if (isSupabaseAdminConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from("koryo_scores")
        .select("id, from_class_id, score, comment, created_at")
        .eq("to_class_id", classId)
        .order("created_at", { ascending:false });
      if (!error && data) {
        return buildSummary(classId, data.map(row => ({
          id: row.id, fromClassId: row.from_class_id,
          score: Number(row.score), comment: row.comment??"", createdAt: row.created_at,
        })));
      }
    } catch { /* フォールバック */ }
  }
  return buildSummary(classId, DUMMY_ENTRIES[classId]??[]);
}
