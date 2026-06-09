"use client";

import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import styles from "./MemberPage.module.css";

export function MemberPage({ session }: { session: Session }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>マナビジョン</span>
          <button
            className={styles.logoutBtn}
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            ログアウト
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>ログイン成功</h1>
          <p className={styles.welcome}>
            ようこそ、<strong>{session.user?.name ?? session.user?.email}</strong> さん
          </p>
          <p className={styles.note}>
            ここにマナビジョンのメンバー向けコンテンツが表示されます。
          </p>
        </div>
      </main>
    </div>
  );
}
