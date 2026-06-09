import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/LoginForm";

export const metadata = {
  title: "蛟龍祭 ログイン画面｜第60回蛟龍祭 実行委員会",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (session) redirect("/member");

  const hasGoogle = !!(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <LoginForm
      error={params.error}
      callbackUrl={params.callbackUrl ?? "/member"}
      hasGoogle={hasGoogle}
    />
  );
}
