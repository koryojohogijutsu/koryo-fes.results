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
  const [rememberLogin, setRememberLogin] = useState(false);
  const [mailReg, setMailReg] = useState(false);
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
    <div className={styles.pageWrap}>
      {/* ===== simpleHeader ===== */}
      <header className={styles.simpleHeader}>
        {/* Benesseロゴバー */}
        <div className={styles.benesseHeaderBar}>
          <div className={styles.benesseHeaderBox}>
            <a href="http://www.benesse.co.jp/" target="_blank" rel="noreferrer" className={styles.benesseHeaderLogo}>
              <BenesseLogo />
            </a>
          </div>
        </div>
        {/* マナビジョンロゴ + "ログイン" */}
        <div className={styles.wFix}>
          <p className={styles.manageLogo}>
            <a href="https://manabi.benesse.ne.jp/">
              <ManabiVisionLogo />
            </a>
          </p>
          <p className={styles.headerTxt}>ログイン</p>
        </div>
      </header>

      {/* ===== contents ===== */}
      <div id="contents" className={styles.col1}>
        <div className={styles.contBoxWrap}>
          <div className={styles.contBox}>

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formInput}>

                {/* ログインID */}
                <div className={styles.formSection}>
                  <div className={styles.formTtl01}><h2>ログインID</h2></div>
                  <p>
                    <input
                      type="text"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className={`${styles.loginId} ${styles.entered}`}
                      id="textBox01"
                      name="loginId"
                      placeholder="SASSI0123456789 または 登録したメールアドレス"
                      autoComplete="username"
                      disabled={loading}
                    />
                  </p>
                </div>

                {/* パスワード */}
                <div className={styles.formSection}>
                  <div className={styles.formTtl01}><h2>パスワード</h2></div>
                  <div className={styles.formPasswd}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.loginPass}
                      name="password"
                      maxLength={16}
                      id="textBox02"
                      placeholder="登録したパスワード または 初期パスワード"
                      autoComplete="current-password"
                      disabled={loading}
                    />
                    <span className={styles.pwcheck}></span>
                  </div>
                </div>

                {/* エラーメッセージ */}
                <div className={styles.loginfalse} style={{ marginTop: 0 }}>
                  <div className={styles.loginfalsInner}>
                    <p
                      className={styles.loginfalseText}
                      style={{
                        display: authError ? "" : "none",
                        fontSize: 14,
                        padding: "0px 0px 30px",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {authError}
                    </p>
                  </div>
                </div>

                <div className={styles.formSection}>
                  {/* チェックボックス群 */}
                  <ul className={styles.formList03}>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          checked={rememberLogin}
                          onChange={(e) => setRememberLogin(e.target.checked)}
                          id="loginCheck"
                          name="loginCheck"
                        />
                        <span>次回からのID入力を省略する</span>
                      </label>
                    </li>
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          checked={mailReg}
                          onChange={(e) => setMailReg(e.target.checked)}
                          id="mail_reg_flg"
                          name="mailRegFlg"
                        />
                        <span>メールアドレスをログインIDとして登録する</span>
                      </label>
                    </li>
                  </ul>

                  {/* ログインボタン */}
                  <div className={styles.formBtn01}>
                    <button type="submit" disabled={loading}>
                      {loading ? "ログイン中..." : "ログイン"}
                    </button>
                  </div>

                  {/* 他のIDでログイン */}
                  <div id="exbc_longin_area" className={styles.exbcLoginArea}>
                    <p className={styles.exbcLoginTitle}>他のIDでログイン</p>
                    <p className={styles.exbcNote}>
                      {hasGoogle
                        ? "Google のアカウントでマナビジョンにログインするためには、お通いの学校の先生による事前登録が必要です。"
                        : "Classi、Google/Microsoft のアカウントでマナビジョンにログインするためには、お通いの学校の先生による事前登録が必要です。"}
                    </p>
                    {/* Google */}
                    <div className={styles.exbcLoginAreaBtn}>
                      {hasGoogle ? (
                        <button
                          type="button"
                          className={styles.exbcSnsBtn}
                          onClick={handleGoogleLogin}
                          disabled={loading}
                        >
                          <span className={styles.iconCover}>
                            <GoogleGLogo />
                          </span>
                          <span className={styles.iconText}>Google のアカウント</span>
                        </button>
                      ) : (
                        <span className={styles.exbcSnsBtn} style={{ opacity: 0.4, cursor: "default" }}>
                          <span className={styles.iconCover}>
                            <GoogleGLogo />
                          </span>
                          <span className={styles.iconText}>Google のアカウント</span>
                        </span>
                      )}
                    </div>
                    {/* Microsoft */}
                    <div className={styles.exbcLoginAreaBtn}>
                      <span className={styles.exbcSnsBtn} style={{ opacity: 0.4, cursor: "default" }}>
                        <span className={styles.iconCover}>
                          <MicrosoftLogo />
                        </span>
                        <span className={styles.iconText}>Microsoft のアカウント</span>
                      </span>
                    </div>
                    {/* Classi */}
                    <div className={styles.exbcLoginAreaBtn}>
                      <span className={`${styles.exbcSnsBtn} ${styles.exbcSnsBtnClassi}`} style={{ opacity: 0.4, cursor: "default" }}>
                        <span className={`${styles.iconCover} ${styles.classiIconCover}`}>
                          <ClassiLogo />
                        </span>
                        <span className={styles.iconText}> のアカウント</span>
                      </span>
                    </div>
                  </div>

                  {/* 初期登録案内 */}
                  <div className={styles.formNote02} id="syokitouroku">
                    <p className={styles.note}>
                      まだログインをしたことがない方、初期登録がお済みでない方は初めに初期登録が必要です。<br />
                      また、先生にパスワードを初期化いただいた場合も、再度「初期登録」の手続きが必要です。&nbsp;
                    </p>
                  </div>

                  {/* リンク群 */}
                  <ul className={styles.formList05}>
                    <li><a href="https://manabi.benesse.ne.jp/kk/mnpassrec/Select">パスワードを忘れた方</a></li>
                    <li><a href="https://manabi.benesse.ne.jp/doc/faq/idpw_index.html" target="_blank" rel="noreferrer">「よくある質問と回答」はこちら</a></li>
                    <li><a href="https://manabi.benesse.ne.jp/account/signup.html">初期パスワードが発行されていない方の初期登録はこちらから</a></li>
                  </ul>

                  {/* 注意事項 */}
                  <ul className={styles.formNote03}>
                    <li>※マナビジョンの「進研模試」に関する画面や、「マナビジョン ポートフォリオ」「進路達成プログラム」をご利用される場合は、SASSI＋10桁の数字のログインIDまたは登録したメールアドレスとパスワードでログインしてください。</li>
                    <li>※ログインIDは、学校の先生から配付された用紙や、ログインカード、ベネッセのテストの成績表に記載されています。</li>
                  </ul>
                </div>

                {/* フッターメニュー */}
                <div className={styles.footMenu}>
                  <ul className={styles.footMenuList}>
                    <li><a href="https://manabi.benesse.ne.jp/">マナビジョン</a></li>
                  </ul>
                </div>

              </div>{/* /formInput */}
            </form>

          </div>{/* /contBox */}
        </div>
      </div>

      {/* ===== footer ===== */}
      <footer style={{ paddingRight: 20 }}>
        <div className={styles.benesseFooter}>
          <div className={styles.benesseFooterInner}>
            <div className={styles.benesseFooterUpper}>
              <a className={styles.benesseFooterLogo} href="http://www.benesse.co.jp/" target="_blank" rel="noreferrer">
                <BenesseLogo />
              </a>
              <ul className={styles.benesseFooterList}>
                <li><a href="http://www.benesse.co.jp/privacy/" target="_blank" rel="noreferrer">個人情報保護への取り組みについて</a></li>
                <li><a href="http://www.benesse.co.jp/benesseinfo/" target="_blank" rel="noreferrer">会社案内</a></li>
              </ul>
            </div>
            <small className={styles.benesseFooterCopyright}>Copyright © Benesse Corporation All rights reserved.</small>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ────────── SVGアイコン群 ────────── */

function BenesseLogo() {
  return (
    <svg width="105" height="24" viewBox="0 0 105 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="18" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#333" letterSpacing="1">Benesse</text>
    </svg>
  );
}

function ManabiVisionLogo() {
  return (
    <span style={{
      fontFamily: '"Hiragino Kaku Gothic ProN","Hiragino Sans",Meiryo,sans-serif',
      fontWeight: "bold",
      fontSize: 22,
      color: "#0092d7",
      letterSpacing: "-0.02em",
    }}>
      マナビジョン
    </span>
  );
}

function GoogleGLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
      <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
    </svg>
  );
}

function ClassiLogo() {
  return (
    <svg width="80" height="20" viewBox="0 0 80 20" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="15" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="14" fill="#00a0e9">Classi</text>
    </svg>
  );
}
