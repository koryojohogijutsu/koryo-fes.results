"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { KoryoLayout } from "@/components/KoryoLayout";
import { QrScanner } from "@/components/QrScanner";
import styles from "./LoginForm.module.css";

interface Props {
  error?: string;
  callbackUrl: string;
}

/**
 * QRコードの文字列を解析してID/パスワードを取り出す
 * 形式: id=xxx,pass=yyy
 * 例:   id=0101-kamimura,pass=1234
 */
function parseQrCode(text: string): { loginId: string; password: string } | null {
  const idMatch   = text.match(/id=([^,]+)/);
  const passMatch = text.match(/,pass=(.+)/);
  if (!idMatch || !passMatch) return null;
  return { loginId: idMatch[1].trim(), password: passMatch[1].trim() };
}

export function LoginForm({ error, callbackUrl }: Props) {
  const [loginId,  setLoginId]  = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showQr,   setShowQr]   = useState(false);
  const [authError, setAuthError] = useState(
    error === "CredentialsSignin" ? "IDまたはパスワードが間違っています" : ""
  );

  // 共通ログイン処理
  async function doLogin(id: string, pass: string) {
    setLoading(true);
    setAuthError("");
    const res = await signIn("credentials", {
      loginId: id,
      password: pass,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.error) {
      setAuthError("IDまたはパスワードが間違っています");
    } else if (res?.url) {
      window.location.href = res.url;
    }
  }

  // フォーム送信
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginId || !password) {
      setAuthError("ログインIDとパスワードを入力してください");
      return;
    }
    await doLogin(loginId, password);
  }

  // QRスキャン成功
  const handleScan = useCallback(async (text: string) => {
    setShowQr(false);
    const parsed = parseQrCode(text);
    if (!parsed) {
      setAuthError("QRコードの形式が正しくありません");
      return;
    }
    // フォームにも反映しておく（視認性のため）
    setLoginId(parsed.loginId);
    setPassword(parsed.password);
    await doLogin(parsed.loginId, parsed.password);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <KoryoLayout subtitle="ログイン">
      {/* QRスキャナーオーバーレイ */}
      {showQr && (
        <QrScanner
          onScan={handleScan}
          onClose={() => setShowQr(false)}
        />
      )}

      {/* メインカード */}
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
              <label htmlFor="loginId" className={styles.label}>ログインID</label>
            </div>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              className={styles.input}
              placeholder="0000-koryo"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          {/* パスワード */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <span className={styles.labelBar} />
              <label htmlFor="password" className={styles.label}>パスワード</label>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              placeholder="【クラス企画成績表】に記載されているパスワード"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {/* ログインボタン */}
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>

          {/* QRログインボタン */}
          <button
            type="button"
            className={styles.qrBtn}
            onClick={() => { setAuthError(""); setShowQr(true); }}
            disabled={loading}
          >
            <CameraIcon />
            2次元コードでログイン
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

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
