"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";

interface Props {
  error?: string;
  callbackUrl: string;
  hasGoogle: boolean;
}

export function LoginForm({ error, callbackUrl, hasGoogle }: Props) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
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

  async function handleGoogleLogin() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.simpleHeader}>
        <div className={styles.headerTop}>
          <span className={styles.benesseLabel}>Benesse</span>
        </div>
        <div className={styles.headerMain}>
          <div className={styles.logoWrap}>
            <span className={styles.logoText}>マナビジョン</span>
          </div>
          <span className={styles.headerTitle}>ログイン</span>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.contBox}>
          <form onSubmit={handleSubmit} noValidate>
            {/* Login ID */}
            <div className={styles.formSection}>
              <div className={styles.formTtl}>
                <h2>ログインID</h2>
              </div>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="SASSI0123456789 または 登録したメールアドレス"
                className={styles.textInput}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className={styles.formSection}>
              <div className={styles.formTtl}>
                <h2>パスワード</h2>
              </div>
              <div className={styles.passwordWrap}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="登録したパスワード または 初期パスワード"
                  className={styles.textInput}
                  maxLength={16}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.showPassBtn}
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPass ? "隠す" : "表示"}
                </button>
              </div>
            </div>

            {/* Error */}
            {authError && (
              <p className={styles.errorMsg} role="alert">
                {authError}
              </p>
            )}

            {/* Checkbox */}
            <div className={styles.checkboxArea}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                />
                <span>次回からのID入力を省略する</span>
              </label>
            </div>

            {/* Submit */}
            <div className={styles.btnWrap}>
              <button
                type="submit"
                className={styles.loginBtn}
                disabled={loading}
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>
            </div>
          </form>

          {/* Google Login */}
          {hasGoogle && (
            <div className={styles.externalArea}>
              <p className={styles.externalTitle}>他のIDでログイン</p>
              <p className={styles.externalNote}>
                Googleのアカウントでマナビジョンにログインするためには、お通いの学校の先生による事前登録が必要です。
              </p>
              <div className={styles.externalBtnWrap}>
                <button
                  type="button"
                  className={styles.googleBtn}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <GoogleIcon />
                  <span>Google のアカウント</span>
                </button>
              </div>
            </div>
          )}

          {/* Links */}
          <div className={styles.formSection}>
            <ul className={styles.linkList}>
              <li>
                <a href="#">パスワードを忘れた方</a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noreferrer">
                  「よくある質問と回答」はこちら
                </a>
              </li>
              <li>
                <a href="#">初期パスワードが発行されていない方の初期登録はこちらから</a>
              </li>
            </ul>
          </div>

          {/* Notes */}
          <ul className={styles.noteList}>
            <li>
              ※マナビジョンの「進研模試」に関する画面や、「マナビジョン
              ポートフォリオ」「進路達成プログラム」をご利用される場合は、SASSI＋10桁の数字のログインIDまたは登録したメールアドレスとパスワードでログインしてください。
            </li>
            <li>
              ※ログインIDは、学校の先生から配付された用紙や、ログインカード、ベネッセのテストの成績表に記載されています。
            </li>
          </ul>

          <div className={styles.footMenu}>
            <a href="#">マナビジョン</a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerLogo}>Benesse</span>
          <ul className={styles.footerLinks}>
            <li>
              <a href="http://www.benesse.co.jp/privacy/" target="_blank" rel="noreferrer">
                個人情報保護への取り組みについて
              </a>
            </li>
            <li>
              <a href="http://www.benesse.co.jp/benesseinfo/" target="_blank" rel="noreferrer">
                会社案内
              </a>
            </li>
          </ul>
          <small className={styles.copyright}>
            Copyright © Benesse Corporation All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
