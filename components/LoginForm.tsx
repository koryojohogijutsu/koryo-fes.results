"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    <div className={styles.pageWrap}>
      {/* ===== ヘッダー ===== */}
      <header className={styles.header}>
        {/* Koryo-fes ロゴ (左上) */}
        <a
          href="https://koryo-fes.studio.site/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.headerLogo}
        >
          <KoryoIcon />
          <span className={styles.headerLogoText}>Koryo-fes</span>
        </a>

        {/* クラス企画評価 + ログイン (中央-右) */}
        <div className={styles.headerTitleBlock}>
          <a href="https://koryo-score.studio.site/" className={styles.headerTitleLink}>
            <TrophyIcon />
            <span className={styles.headerTitleText}>
              <span className={styles.titleBlack}>クラス</span>
              <span className={styles.titleGreen}>企画</span>
              <span className={styles.titleBlack}>評価</span>
            </span>
          </a>
          <span className={styles.headerLoginLabel}>ログイン</span>
        </div>
      </header>

      {/* ===== メインカード ===== */}
      <main className={styles.main}>
        <div className={styles.card}>
          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} noValidate className={styles.form}>

            {/* エラー表示 */}
            {authError && (
              <div className={styles.errorBox}>
                <p className={styles.errorText}>{authError}</p>
              </div>
            )}

            {/* ログインID */}
            <div className={styles.field}>
              <label htmlFor="loginId" className={styles.label}>
                ログインID
              </label>
              <input
                id="loginId"
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className={styles.input}
                placeholder="ログインIDを入力"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* パスワード */}
            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="パスワードを入力"
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

          </form>
        </div>
      </main>

      {/* ===== フッター ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {/* 左: Koryo-fes ロゴ */}
          <a
            href="https://koryo-fes.studio.site/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLogo}
          >
            <KoryoIcon size={40} />
            <span className={styles.footerLogoText}>Koryo-fes</span>
          </a>

          {/* 右: リンク群 */}
          <div className={styles.footerLinks}>
            <a
              href="https://koryo-score.studio.site/privacypolicy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              個人情報保護への取り組みについて
            </a>
            <span className={styles.footerDivider} />
            <a
              href="https://maebashi-hs.gsn.ed.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              高校案内
            </a>
          </div>
        </div>

        {/* コピーライト */}
        <p className={styles.copyright}>
          Copyright © Koryo Festival&nbsp; All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* ────────── SVGアイコン群 ────────── */

function KoryoIcon({ size = 25 }: { size?: number }) {
  // 元HTMLの webp 画像の代替として蛟龍祭のシンプルなアイコンSVG
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r="48" fill="#8cd15c" />
      <text
        x="50"
        y="67"
        textAnchor="middle"
        fontFamily="'Noto Serif JP', serif"
        fontWeight="900"
        fontSize="42"
        fill="#ffffff"
      >
        蛟
      </text>
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* トロフィー本体 */}
      <path
        d="M25 10 h50 v40 a25 25 0 0 1-50 0 Z"
        fill="none"
        stroke="#000"
        strokeWidth="6"
      />
      {/* 左ハンドル */}
      <path d="M25 20 Q10 20 10 35 Q10 50 25 50" fill="none" stroke="#000" strokeWidth="5" />
      {/* 右ハンドル */}
      <path d="M75 20 Q90 20 90 35 Q90 50 75 50" fill="none" stroke="#000" strokeWidth="5" />
      {/* 台座 */}
      <rect x="38" y="70" width="24" height="20" fill="#000" />
      <rect x="28" y="90" width="44" height="8" rx="2" fill="#000" />
    </svg>
  );
}
