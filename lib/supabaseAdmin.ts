import { createClient } from "@supabase/supabase-js";

/**
 * サーバー専用 Supabase クライアント（Service Role Key使用）
 * --------------------------------------------------------------
 * このクライアントは RLS (Row Level Security) をバイパスするため、
 * 絶対にクライアント（ブラウザ）側のコードからimportしないこと。
 * - サーバーコンポーネント
 * - API Route (app/api/**)
 * - Server Action
 * からのみ使用してください。
 *
 * 必要な環境変数:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=xxxxx   ← Supabase Dashboard > Project Settings > API
 *
 * NEXT_PUBLIC_ が付いていない = ブラウザにバンドルされない安全な変数です。
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

export function isSupabaseAdminConfigured() {
  return supabaseAdmin !== null;
}
