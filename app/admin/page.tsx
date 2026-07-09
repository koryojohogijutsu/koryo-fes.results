import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminPage } from "@/components/AdminPage";

// セッションのroleで振り分けるため、キャッシュさせず毎回動的にレンダリングする
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const metadata = { title: "管理者ページ｜蛟龍祭クラス企画評価" };

export default async function Admin() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user?.role !== "admin") redirect("/member");
  return <AdminPage />;
}
