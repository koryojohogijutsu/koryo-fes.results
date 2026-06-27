import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPage } from "@/components/AdminPage";

export const metadata = { title: "管理者ページ｜蛟龍祭クラス企画評価" };

export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user?.role !== "admin") redirect("/member");
  return <AdminPage />;
}
