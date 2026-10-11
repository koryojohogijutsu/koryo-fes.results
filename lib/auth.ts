import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // どちらの環境変数が無いかをログに出す（値は出さない）
    console.error("[auth] Supabase env missing:", {
      NEXT_PUBLIC_SUPABASE_URL: !!url,
      SUPABASE_SERVICE_ROLE_KEY: !!key,
    });
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId:  { label: "ログインID", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) {
          console.error("[auth] empty loginId or password");
          return null;
        }

        const supabase = getSupabase();
        if (!supabase) return null;

        try {
          const { data, error } = await supabase
            .from("koryo_classes")
            .select("id, login_id, password_hash, name, role")
            .eq("login_id", credentials.loginId)
            .eq("password_hash", credentials.password)
            .maybeSingle();

          if (error) {
            console.error("[auth] supabase error:", {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            });
            return null;
          }

          if (!data) {
            // パスワードはログに出さない
            console.error("[auth] no matching row for loginId:", credentials.loginId);
            return null;
          }

          return {
            id:      data.id,
            name:    data.name,
            email:   data.login_id,
            classId: data.id,
            role:    data.role ?? "class",
          };
        } catch (e) {
          console.error("[auth] unexpected exception:", e);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id;
        token.classId = (user as { classId?: string }).classId;
        token.role    = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; classId?: string; role?: string };
        u.id      = token.id      as string;
        u.classId = token.classId as string;
        u.role    = token.role    as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
