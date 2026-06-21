"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KoryoLayout } from "@/components/KoryoLayout";
import styles from "./LoginForm.module.css";

interface Props {
  error?: string;
  callbackUrl: string;
}

export function LoginForm({ error, callbackUrl }: Props) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(
    error === "CredentialsSignin" ? "IDまたはパスワードが間違っています" : ""
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginId || !password) {
      setAuthError("ログインIDとパスワードを入力してください");
      return;
    }
    setLoading(true);
    setAuthError("");
    const res = await signIn("credentials", {
      loginId,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setAuthError("IDまたはパスワードが間違っています");
    } else if (res?.url) {
      router.push(res.url);
    }
  }

  return (
    <KoryoLayout subtitle="ログイン">
      {/* ===== メインカード ===== */}
      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          {/* エラー表示 */}
          {authError && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{authError}</p>
            </div>
          )}

          {/* ログインID */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <span className={styles.labelBar} />
              <label htmlFor="loginId" className={styles.label}>
                ログインID
              </label>
            </div>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className={styles.input}
              placeholder="KORYO0123456789 または ぐんまスクールネットのメールアドレス"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* パスワード */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <span className={styles.labelBar} />
              <label htmlFor="password" className={styles.label}>
                パスワード
              </label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="【クラス企画評価】に記載されているパスワード"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* ログインボタン */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          {/* パスワードを忘れた方 */}
          <div className={styles.forgotWrap}>
            <span className={styles.forgotArrow}>➡</span>
            <Link href="/forgetPassword" className={styles.forgotLink}>
              パスワードを忘れた方はこちら
            </Link>
          </div>

        </form>
      </div>
    </KoryoLayout>
  );
}
