import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export interface ClassRankingEntry { classId:string; className:string; averageScore:number; totalCount:number; rank:number; }

const DUMMY_RANKING: Omit<ClassRankingEntry,"rank">[] = [
  { classId:"1-3", className:"1年3組", averageScore:4.6, totalCount:12 },
  { classId:"1-1", className:"1年1組", averageScore:4.1, totalCount:3  },
  { classId:"2-1", className:"2年1組", averageScore:3.9, totalCount:8  },
  { classId:"1-2", className:"1年2組", averageScore:4.2, totalCount:1  },
];

function attachRanks(entries: Omit<ClassRankingEntry,"rank">[]): ClassRankingEntry[] {
  return [...entries].sort((a,b)=>b.averageScore-a.averageScore).map((e,i)=>({...e,rank:i+1}));
}

export async function getClassRanking(): Promise<ClassRankingEntry[]> {
  if (isSupabaseAdminConfigured() && supabaseAdmin) {
    try {
      const { data:classes, error:classesError } = await supabaseAdmin
        .from("koryo_classes").select("id, name").neq("id","admin");
      if (classesError || !classes) throw classesError;

      const { data:scores, error:scoresError } = await supabaseAdmin
        .from("koryo_scores").select("to_class_id, score");
      if (scoresError) throw scoresError;

      return attachRanks(classes.map(c => {
        const cs = (scores??[]).filter(s=>s.to_class_id===c.id);
        const totalCount = cs.length;
        const averageScore = totalCount===0 ? 0 : Math.round(cs.reduce((s,e)=>s+Number(e.score),0)/totalCount*10)/10;
        return { classId:c.id, className:c.name, averageScore, totalCount };
      }));
    } catch { /* フォールバック */ }
  }
  return attachRanks(DUMMY_RANKING);
}
