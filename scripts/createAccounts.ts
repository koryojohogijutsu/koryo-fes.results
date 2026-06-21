/**
 * アカウント作成スクリプト
 * --------------------------------------------------------------
 * Supabaseの accounts テーブルに、bcryptでハッシュ化した
 * パスワードと一緒にログインアカウントを登録します。
 *
 * 使い方:
 *   1. .env.local に以下を設定
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...
 *   2. このファイル下部の ACCOUNTS_TO_CREATE を編集
 *   3. 実行:
 *        npx tsx scripts/createAccounts.ts
 *      (tsx が無ければ: npm install -D tsx)
 *
 * 既に同じ login_id のアカウントがある場合は更新（upsert）します。
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "環境変数 NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません。"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ────────────────────────────────────────────
// ここを編集して、作成したいアカウントを列挙する
// ────────────────────────────────────────────
const ACCOUNTS_TO_CREATE = [
  {
    loginId: "admin",
    password: "changeme123", // 本番では必ず変更してください
    classId: "admin",
    displayName: "管理者",
    role: "admin" as const,
  },
  {
    loginId: "KORYO0000000001",
    password: "abcd1234",
    classId: "1-1",
    displayName: "1年1組",
    role: "class" as const,
  },
  {
    loginId: "KORYO0000000002",
    password: "efgh5678",
    classId: "1-2",
    displayName: "1年2組",
    role: "class" as const,
  },
];

async function main() {
  for (const account of ACCOUNTS_TO_CREATE) {
    const passwordHash = await bcrypt.hash(account.password, 10);

    const { error } = await supabase.from("accounts").upsert(
      {
        login_id: account.loginId,
        password_hash: passwordHash,
        class_id: account.classId,
        display_name: account.displayName,
        role: account.role,
      },
      { onConflict: "login_id" }
    );

    if (error) {
      console.error(`✗ ${account.loginId} の作成に失敗:`, error.message);
    } else {
      console.log(`✓ ${account.loginId} (${account.displayName}) を作成/更新しました`);
    }
  }
}

main().then(() => {
  console.log("完了しました。");
  process.exit(0);
});
