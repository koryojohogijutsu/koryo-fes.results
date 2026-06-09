import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// デモ用ユーザー（本番ではDBに置き換えてください）
const DEMO_USERS = [
  { id: "1", loginId: "admin", password: "password123", name: "管理者" },
  { id: "2", loginId: "test@koryo-fes.jp", password: "password123", name: "テストユーザー" },
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
      const user = DEMO_USERS.find(
        (u) => u.loginId === credentials.loginId && u.password === credentials.password
      );
      if (!user) return null;
      return { id: user.id, name: user.name, email: user.loginId };
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
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
};
