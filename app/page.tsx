import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

// セッションに応じて振り分けるため、キャッシュさせず毎回動的にレンダリングする
// (これが無いとVercel側でページがキャッシュされ、
//  別のユーザーのセッションに基づいたリダイレクト結果が使い回されてしまう)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  // 管理者は /admin へ、それ以外は /member へ
  if (session.user?.role === "admin") redirect("/admin");
  redirect("/member");
}
