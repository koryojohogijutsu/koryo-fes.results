import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MemberPage } from "@/components/MemberPage";

export default async function Member() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <MemberPage session={session} />;
}
