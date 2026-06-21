import { Session } from "next-auth";
import { getScoresForClass } from "@/lib/scores";
import { LogoutButton } from "./LogoutButton";
import styles from "./MemberPage.module.css";

export async function MemberPage({ session }: { session: Session }) {
  const classId = session.user?.classId ?? "";
  const summary = await getScoresForClass(classId);

  return (
    <div className={styles.page}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <KoryoIcon />
            <span className={styles.headerTitle}>
              クラス<span className={styles.green}>企画</span>評価
            </span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>
              {session.user?.name ?? session.user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className={styles.main}>
        <div className={styles.contentWrap}>

          {/* クラス情報 */}
          <div className={styles.classBadge}>
            <span className={styles.classBadgeLabel}>あなたのクラス</span>
            <span className={styles.classBadgeValue}>{classId || "未設定"}</span>
          </div>

          {/* サマリーカード */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>平均評価</p>
              <p className={styles.summaryValue}>
                {summary.totalCount > 0 ? summary.averageScore.toFixed(1) : "—"}
                <span className={styles.summaryUnit}>/ 5.0</span>
              </p>
            </div>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>評価件数</p>
              <p className={styles.summaryValue}>
                {summary.totalCount}
                <span className={styles.summaryUnit}>件</span>
              </p>
            </div>
          </div>

          {/* 評価一覧 */}
          <section className={styles.listSection}>
            <h2 className={styles.listTitle}>評価コメント一覧</h2>

            {summary.entries.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  まだ評価が届いていません。
                </p>
              </div>
            ) : (
              <ul className={styles.entryList}>
                {summary.entries.map((entry) => (
                  <li key={entry.id} className={styles.entryItem}>
                    <div className={styles.entryHeader}>
                      <span className={styles.entryFrom}>{entry.fromClassId} より</span>
                      <span className={styles.entryScore}>★ {entry.score.toFixed(1)}</span>
                    </div>
                    <p className={styles.entryComment}>{entry.comment}</p>
                    <p className={styles.entryDate}>
                      {new Date(entry.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </main>

      {/* フッター */}
      <footer className={styles.footer}>
        <p className={styles.copyright}>
          Copyright © Koryo Festival Committee&nbsp; All rights reserved.
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
