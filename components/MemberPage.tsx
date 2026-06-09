"use client";

import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import styles from "./MemberPage.module.css";

export function MemberPage({ session }: { session: Session }) {
  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <KoryoIcon />
            <span className={styles.headerTitle}>クラス<span className={styles.green}>企画</span>評価</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>
              {session.user?.name ?? session.user?.email}
            </span>
            <button
              className={styles.logoutBtn}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ（ここにリンク先のページを実装予定） */}
      <main className={styles.main}>
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>
            ここにログイン後のコンテンツが入ります。
          </p>
          <p className={styles.placeholderSub}>
            リンク先のファイルまたはURLを添付してください。
          </p>
        </div>
      </main>

      {/* フッター */}
      <footer className={styles.footer}>
        <p className={styles.copyright}>
          Copyright © Koryo Festival&nbsp; All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function KoryoIcon() {
  return (
    <svg
      width="28"
      height="28"
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
