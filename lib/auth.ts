import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

/**
 * ログインID/パスワード/クラスの管理について
 * --------------------------------------------------------------
 * 環境変数 AUTH_USERS に
 *   「ログインID:パスワード:表示名:classId」
 * をカンマ区切りで設定することでユーザーを管理します。
 *
 * classId は /member ページでどのクラスの集計を表示するかを
 * 判別するためのキーです（例: "1-1", "1-2", "admin" など）。
 * 管理者アカウントの場合は classId を "admin" にしておくと、
 * 将来的に全クラス閲覧などの分岐がしやすくなります。
 *
 * 例 (.env.local / Vercelの環境変数):
 *   AUTH_USERS=admin:changeme:管理者:admin,1-1:abcd1234:1年1組:1-1,1-2:efgh5678:1年2組:1-2
 *
 * メリット: コードを書き換えずに本番(Vercel)の環境変数だけで
 *           ID/パスワード/クラスの追加・変更・削除ができる。
 * 注意点  : クラス数・ユーザー数が多い場合や、パスワードを
 *           ユーザー自身が変更できるようにしたい場合は、
 *           Supabase などのDBに切り替えることを推奨します
 *           （lib/supabase.ts を参照、将来の移行先として用意済み）。
 *
 * 環境変数が未設定の場合は、開発用の DEMO_USERS にフォールバックします。
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
        classId: classId || loginId, // classId省略時はloginIdを流用
      };
    })
    .filter((u) => u.loginId && u.password);
}

// 開発用フォールバック（AUTH_USERS未設定時のみ使用）
const DEMO_USERS: AuthUser[] = [
  { id: "1", loginId: "admin", password: "password123", name: "管理者", classId: "admin" },
  { id: "2", loginId: "1-1", password: "password123", name: "1年1組", classId: "1-1" },
  { id: "3", loginId: "1-2", password: "password123", name: "1年2組", classId: "1-2" },
];

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      loginId: { label: "ログインID", type: "text" },
      password: { label: "パスワード", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.loginId || !credentials?.password) return null;

      const users = loadUsersFromEnv() ?? DEMO_USERS;
      const user = users.find(
        (u) => u.loginId === credentials.loginId && u.password === credentials.password
      );
      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.loginId,
        classId: user.classId,
      };
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
