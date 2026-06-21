import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

/**
 * ログインID/パスワード/クラスの管理について
 * --------------------------------------------------------------
 * 【優先1】Supabase (accounts テーブル)
 *   supabase/schema.sql で作成した accounts テーブルから認証します。
 *   パスワードは bcrypt でハッシュ化して保存されている前提です。
 *   必要な環境変数: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * 【優先2】環境変数 AUTH_USERS（Supabase未設定時のフォールバック）
 *   「ログインID:パスワード:表示名:classId」をカンマ区切りで指定。
 *   例:
 *     AUTH_USERS=admin:changeme:管理者:admin,1-1:abcd1234:1年1組:1-1
 *
 * 【優先3】DEMO_USERS（どちらも未設定の場合の開発用フォールバック）
 *
 * classId は /member ページでどのクラスの集計を表示するかを
 * 判別するためのキーです。
 */

export interface AuthUser {
  id: string;
  loginId: string;
  password: string;
  name: string;
  classId: string;
}

function loadUsersFromEnv(): AuthUser[] | null {
  const raw = process.env.AUTH_USERS;
  if (!raw) return null;

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry, index) => {
      const [loginId, password, name, classId] = entry
        .split(":")
        .map((s) => s.trim());
      return {
        id: String(index + 1),
        loginId,
        password,
        name: name || loginId,
        classId: classId || loginId,
      };
    })
    .filter((u) => u.loginId && u.password);
}

// 開発用フォールバック（Supabase・AUTH_USERSどちらも未設定の場合のみ使用）
const DEMO_USERS: AuthUser[] = [
  { id: "1", loginId: "admin", password: "password123", name: "管理者", classId: "admin" },
  { id: "2", loginId: "1-1", password: "password123", name: "1年1組", classId: "1-1" },
  { id: "3", loginId: "1-2", password: "password123", name: "1年2組", classId: "1-2" },
];

/**
 * Supabaseのaccountsテーブルを使った認証
 * 戻り値: 認証成功時はユーザー情報、失敗時はnull
 */
async function authorizeWithSupabase(loginId: string, password: string) {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("accounts")
    .select("id, login_id, password_hash, class_id, display_name")
    .eq("login_id", loginId)
    .maybeSingle();

  if (error || !data) return null;

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) return null;

  return {
    id: data.id,
    name: data.display_name,
    email: data.login_id,
    classId: data.class_id,
  };
}

/**
 * 環境変数(AUTH_USERS) or デモユーザーを使った認証（フォールバック）
 */
function authorizeWithEnv(loginId: string, password: string) {
  const users = loadUsersFromEnv() ?? DEMO_USERS;
  const user = users.find((u) => u.loginId === loginId && u.password === password);
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.loginId,
    classId: user.classId,
  };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      loginId: { label: "ログインID", type: "text" },
      password: { label: "パスワード", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.loginId || !credentials?.password) return null;

      // Supabaseが設定されていればそちらを優先
      if (isSupabaseAdminConfigured()) {
        const supabaseUser = await authorizeWithSupabase(
          credentials.loginId,
          credentials.password
        );
        if (supabaseUser) return supabaseUser;
        // Supabaseで見つからない場合はそのまま失敗扱い
        // （Supabase設定済みなら環境変数にはフォールバックしない）
        return null;
      }

      // Supabase未設定時のみ環境変数/デモユーザーにフォールバック
      return authorizeWithEnv(credentials.loginId, credentials.password);
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.classId = user.classId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.classId = token.classId;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
