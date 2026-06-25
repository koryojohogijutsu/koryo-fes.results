import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberPage } from "@/components/MemberPage";

export const metadata = { title: "評価結果｜蛟龍祭クラス企画評価" };

export default async function Member() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <MemberPage session={session} />;
}
