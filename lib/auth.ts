import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
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
        if (!credentials?.loginId || !credentials?.password) return null;

        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
          .from("koryo_classes")
          .select("id, login_id, password_hash, name, role")
          .eq("login_id", credentials.loginId)
          .eq("password_hash", credentials.password)
          .maybeSingle();

        if (error || !data) return null;

        return {
          id:      data.id,
          name:    data.name,
          email:   data.login_id,
          classId: data.id,
          role:    data.role ?? "class",
        };
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
