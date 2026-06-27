import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberPage } from "@/components/MemberPage";
import { getClassResult, getGraphUrls, getVisitorComments } from "@/lib/results";

export const metadata = { title: "評価結果｜蛟龍祭クラス企画評価" };

export default async function Member() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 管理者は管理者ページへ
  if (session.user?.role === "admin") redirect("/admin");

  const classId = session.user?.classId ?? "";
  const [result, graphs, comments] = await Promise.all([
    getClassResult(classId),
    getGraphUrls(classId),
    getVisitorComments(classId),
  ]);

  return (
    <MemberPage
      session={session}
      result={result}
      graphs={graphs}
      comments={comments}
    />
  );
}
