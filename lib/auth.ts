import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

export interface AuthUser {
  id: string; loginId: string; password: string; name: string; classId: string;
}

function loadUsersFromEnv(): AuthUser[] | null {
  const raw = process.env.AUTH_USERS;
  if (!raw) return null;
  return raw.split(",").map((e,i) => {
    const [loginId, password, name, classId] = e.trim().split(":").map(s => s.trim());
    return { id: String(i+1), loginId, password, name: name||loginId, classId: classId||loginId };
  }).filter(u => u.loginId && u.password);
}

const DEMO_USERS: AuthUser[] = [
  { id:"1", loginId:"admin", password:"password123", name:"管理者",  classId:"admin" },
  { id:"2", loginId:"1-1",   password:"password123", name:"1年1組", classId:"1-1"   },
  { id:"3", loginId:"1-2",   password:"password123", name:"1年2組", classId:"1-2"   },
];

async function authorizeWithSupabase(loginId: string, password: string) {
  if (!isSupabaseAdminConfigured() || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin
    .from("koryo_classes")
    .select("id, login_id, password_hash, name")
    .eq("login_id", loginId)
    .maybeSingle();
  if (error || !data) return null;
  const isValid = await bcrypt.compare(password, data.password_hash);
  if (!isValid) return null;
  return { id: data.id, name: data.name, email: data.login_id, classId: data.id };
}

function authorizeWithEnv(loginId: string, password: string) {
  const user = (loadUsersFromEnv() ?? DEMO_USERS).find(u => u.loginId===loginId && u.password===password);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.loginId, classId: user.classId };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        loginId:  { label:"ログインID", type:"text"     },
        password: { label:"パスワード", type:"password" },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) return null;
        if (isSupabaseAdminConfigured()) return await authorizeWithSupabase(credentials.loginId, credentials.password);
        return authorizeWithEnv(credentials.loginId, credentials.password);
      },
    }),
  ],
  pages: { signIn:"/login", error:"/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.classId = user.classId; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { session.user.id = token.id; session.user.classId = token.classId; }
      return session;
    },
  },
  session: { strategy:"jwt" },
};
