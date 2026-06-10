import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";

export const metadata = {
  title: "蛟龍祭クラス企画評価",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (session) redirect("/member");

  return (
    <LoginForm
      error={params.error}
      callbackUrl={params.callbackUrl ?? "/member"}
    />
  );
}
