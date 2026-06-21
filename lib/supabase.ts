import { createClient } from "@supabase/supabase-js";

/**
 * Supabase クライアント
 * --------------------------------------------------------------
 * 評価データ（点数・コメント）は将来的にSupabaseのテーブルから
 * 取得する想定です。今はまだテーブル未作成のため、
 * lib/scores.ts 側でダミーデータにフォールバックしています。
 *
 * 必要な環境変数（.env.local / Vercel環境変数）:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
 *
 * サーバー側だけで使う管理者キーが必要な場合（RLSを回避する場合）は
 *   SUPABASE_SERVICE_ROLE_KEY=xxxxx
 * を別途追加し、サーバー専用クライアントを分けてください。
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が未設定でもビルド・開発が止まらないように、
// 値が無い場合は null を返すヘルパー経由でのみ使用する。
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function isSupabaseConfigured() {
  return supabase !== null;
}
