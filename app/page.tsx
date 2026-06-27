import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  // 管理者は /admin へ、それ以外は /member へ
  if (session.user?.role === "admin") redirect("/admin");
  redirect("/member");
}
