import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

/**
 * 認証の優先順位:
 *   1. Supabase (classes テーブル)  ← SUPABASE_SERVICE_ROLE_KEY が設定されている場合
 *   2. 環境変数 AUTH_USERS          ← Supabase未設定時のフォールバック
 *   3. DEMO_USERS                   ← どちらも未設定の開発用フォールバック
 *
 * classesテーブル構造（1クラス = 1ログインID）:
 *   id, name, login_id, password_hash, role, grade
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
      const [loginId, password, name, classId] = entry.split(":").map((s) => s.trim());
      return { id: String(index + 1), loginId, password, name: name || loginId, classId: classId || loginId };
    })
    .filter((u) => u.loginId && u.password);
}

const DEMO_USERS: AuthUser[] = [
  { id: "1", loginId: "admin",  password: "password123", name: "管理者",  classId: "admin" },
  { id: "2", loginId: "1-1",   password: "password123", name: "1年1組", classId: "1-1"   },
  { id: "3", loginId: "1-2",   password: "password123", name: "1年2組", classId: "1-2"   },
];

// Supabase (classesテーブル) で認証
async function authorizeWithSupabase(loginId: string, password: string) {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from("classes")
    .select("id, login_id, password_hash, name")
    .eq("login_id", loginId)
    .maybeSingle();

  if (error || !data) return null;

  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) return null;

  return { id: data.id, name: data.name, email: data.login_id, classId: data.id };
}

// 環境変数 or デモユーザーで認証（フォールバック）
function authorizeWithEnv(loginId: string, password: string) {
  const users = loadUsersFromEnv() ?? DEMO_USERS;
  const user = users.find((u) => u.loginId === loginId && u.password === password);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.loginId, classId: user.classId };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId:  { label: "ログインID", type: "text"     },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null;

        if (isSupabaseAdminConfigured()) {
          return await authorizeWithSupabase(credentials.loginId, credentials.password);
        }
        return authorizeWithEnv(credentials.loginId, credentials.password);
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error:  "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id;
        token.classId = user.classId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id      = token.id;
        session.user.classId = token.classId;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
