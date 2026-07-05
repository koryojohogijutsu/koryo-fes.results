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
  const [showPassword, setShowPassword] = useState(false);
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
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="【クラス企画評価】に記載されているパスワード"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? "パスワードを非表示にする" : "パスワードを表示する"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  // 目（表示中）
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // 目に斜線（非表示中）
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
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
