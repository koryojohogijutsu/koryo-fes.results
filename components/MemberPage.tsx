import { Session } from "next-auth";
import { getScoresForClass, QA_QUESTIONS } from "@/lib/scores";
import { getClassRanking } from "@/lib/ranking";
import { LogoutButton } from "./LogoutButton";
import styles from "./MemberPage.module.css";

export async function MemberPage({ session }: { session: Session }) {
  const classId = session.user?.classId ?? "";
  const className = session.user?.name ?? classId;

  const [summary, ranking] = await Promise.all([
    getScoresForClass(classId),
    getClassRanking(),
  ]);
  const myRank = ranking.find(r => r.classId === classId);

  return (
    <div className={styles.page}>

      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.headerSiteName}>
            クラス<span className={styles.green}>企画</span>評価
          </span>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{className}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>

          {/* パンくず */}
          <nav className={styles.breadcrumb}>
            <span>蛟龍祭クラス企画評価</span>
            <span className={styles.breadSep}>＞</span>
            <strong>{className} の評価結果</strong>
          </nav>

          <div className={styles.layout}>

            {/* サイドバー */}
            <aside className={styles.sidebar}>
              <div className={styles.sideClassBox}>
                <p className={styles.sideLbl}>ログイン中のクラス</p>
                <p className={styles.sideClassName}>{className}</p>
              </div>
              {myRank && (
                <div className={styles.sideRankBox}>
                  <p className={styles.sideLbl}>総合順位</p>
                  <p className={styles.sideRankNum}><em>{myRank.rank}</em>位</p>
                  <p className={styles.sideRankOf}>{ranking.length}クラス中</p>
                </div>
              )}
              <nav className={styles.sidenav}>
                <p className={styles.sidenavTtl}>評価を見る</p>
                <ul>
                  <li><a href="#digest"   className={styles.sidenavLink}>ダイジェスト</a></li>
                  <li><a href="#seiseki"  className={styles.sidenavLink}>成績結果</a></li>
                  <li><a href="#kanso"    className={styles.sidenavLink}>来場者からの感想</a></li>
                </ul>
              </nav>
            </aside>

            {/* コンテンツ */}
            <div className={styles.content}>

              {/* タブバー */}
              <div className={styles.tabBar}>
                <a href="#digest"  className={styles.tab}>ダイジェスト</a>
                <a href="#seiseki" className={styles.tab}>成績結果</a>
                <a href="#kanso"   className={styles.tab}>来場者からの感想</a>
              </div>

              {/* ════ ① ダイジェスト ════ */}
              <section id="digest" className={styles.section}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTtl}>総合結果ダイジェスト</h2>
                </div>

                <div className={styles.digestGrid}>
                  {/* 総合スコア */}
                  <div className={styles.digestCard}>
                    <p className={styles.digestLbl}>平均評価スコア</p>
                    <div className={styles.digestScoreWrap}>
                      <em className={styles.digestScoreBig}>
                        {summary.totalCount > 0 ? summary.averageScore.toFixed(1) : "—"}
                      </em>
                      <span className={styles.digestScoreUnit}>/ 5.0</span>
                    </div>
                    {summary.totalCount > 0 && (
                      <div className={styles.bar}>
                        <div className={styles.barFill} style={{ width: `${summary.averageScore / 5 * 100}%` }} />
                      </div>
                    )}
                    <p className={styles.digestSub}>{summary.totalCount}件の評価</p>
                  </div>

                  {/* 順位 */}
                  {myRank && (
                    <div className={styles.digestCard}>
                      <p className={styles.digestLbl}>全クラス順位</p>
                      <div className={styles.digestScoreWrap}>
                        <em className={styles.digestScoreBig}>{myRank.rank}</em>
                        <span className={styles.digestScoreUnit}>位</span>
                      </div>
                      <p className={styles.digestSub}>{ranking.length}クラス中</p>
                    </div>
                  )}
                </div>

                {/* ミニランキング */}
                <div className={styles.miniRanking}>
                  <p className={styles.miniRankTtl}>クラス別スコア（上位5件）</p>
                  <ul className={styles.miniRankList}>
                    {ranking.slice(0, 5).map(r => (
                      <li key={r.classId} className={`${styles.miniRankItem} ${r.classId === classId ? styles.miniRankItemSelf : ""}`}>
                        <span className={styles.miniRankPos}>{r.rank}</span>
                        <span className={styles.miniRankName}>
                          {r.className}
                          {r.classId === classId && <span className={styles.selfTag}>あなた</span>}
                        </span>
                        <span className={styles.miniRankScore}>{r.totalCount > 0 ? r.averageScore.toFixed(1) : "—"}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#ranking" className={styles.miniRankMore}>すべてのクラスを見る →</a>
                </div>
              </section>

              {/* ════ ② 成績結果（マナビジョン風テーブル） ════ */}
              <section id="seiseki" className={styles.section}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTtl}>成績結果</h2>
                </div>

                {summary.totalCount === 0 ? (
                  <div className={styles.empty}>
                    <p className={styles.emptyTtl}>まだ評価が届いていません</p>
                  </div>
                ) : (
                  <>
                    {/* スコアテーブル */}
                    <div className={styles.scoreTableWrap}>
                      <table className={styles.scoreTable}>
                        <thead>
                          <tr>
                            <th className={`${styles.scoreTh} ${styles.scoreThItem}`}>評価項目</th>
                            <th className={styles.scoreTh}>得点 / 満点</th>
                            <th className={styles.scoreTh}>全体平均</th>
                            <th className={styles.scoreTh}>差分</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 総合 */}
                          <tr className={styles.scoreRowTotal}>
                            <th className={`${styles.scoreTd} ${styles.scoreItemName} ${styles.scoreItemNameTotal}`}>
                              総合
                            </th>
                            <td className={styles.scoreTd}>
                              <span className={styles.scoreNum}>{summary.averageScore.toFixed(1)}</span>
                              <span className={styles.scoreFull}>5.0</span>
                            </td>
                            <td className={styles.scoreTd}>
                              {/* 全体平均は将来Supabaseから取得 */}
                              <span className={styles.scoreAvg}>—</span>
                            </td>
                            <td className={styles.scoreTd}>—</td>
                          </tr>
                          {/* 項目別 */}
                          {summary.itemScores.map(item => {
                            const diff = item.myScore > 0 && item.average > 0
                              ? (item.myScore - item.average).toFixed(1) : null;
                            return (
                              <tr key={item.key} className={styles.scoreRow}>
                                <th className={`${styles.scoreTd} ${styles.scoreItemName}`}>
                                  {item.label}
                                </th>
                                <td className={styles.scoreTd}>
                                  <div className={styles.scoreCellWrap}>
                                    <span className={styles.scoreNum}>{item.myScore > 0 ? item.myScore.toFixed(1) : "—"}</span>
                                    <span className={styles.scoreFull}>{item.maxScore.toFixed(1)}</span>
                                  </div>
                                  {item.myScore > 0 && (
                                    <div className={styles.scoreBarCell}>
                                      <div className={styles.scoreBarCellFill} style={{ width: `${item.myScore / item.maxScore * 100}%` }} />
                                      <div className={styles.scoreBarCellAvg} style={{ left: `${item.average / item.maxScore * 100}%` }} />
                                    </div>
                                  )}
                                </td>
                                <td className={styles.scoreTd}>
                                  <span className={styles.scoreAvg}>{item.average > 0 ? item.average.toFixed(1) : "—"}</span>
                                </td>
                                <td className={styles.scoreTd}>
                                  {diff !== null ? (
                                    <span className={Number(diff) >= 0 ? styles.diffPos : styles.diffNeg}>
                                      {Number(diff) >= 0 ? "+" : ""}{diff}
                                    </span>
                                  ) : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* 全クラスランキング */}
                    <div id="ranking" className={styles.rankTableSection}>
                      <p className={styles.rankTableTtl}>全クラスランキング</p>
                      <table className={styles.rankTable}>
                        <thead>
                          <tr>
                            <th className={styles.rankTh}>順位</th>
                            <th className={styles.rankTh}>クラス</th>
                            <th className={styles.rankTh}>平均スコア</th>
                            <th className={styles.rankTh}>件数</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.map(r => (
                            <tr key={r.classId} className={r.classId === classId ? styles.rankRowSelf : styles.rankRow}>
                              <td className={styles.rankTd}>
                                {r.rank <= 3
                                  ? <span className={`${styles.medal} ${styles[`medal${r.rank}` as "medal1"|"medal2"|"medal3"]}`}>{r.rank}</span>
                                  : r.rank}
                              </td>
                              <td className={styles.rankTd}>
                                {r.className}
                                {r.classId === classId && <span className={styles.selfTag}>あなた</span>}
                              </td>
                              <td className={styles.rankTd}>
                                <div className={styles.rankScoreWrap}>
                                  <span className={styles.rankScoreNum}>{r.totalCount > 0 ? r.averageScore.toFixed(1) : "—"}</span>
                                  {r.totalCount > 0 && (
                                    <div className={styles.rankBar}>
                                      <div className={styles.rankBarFill} style={{ width: `${r.averageScore / 5 * 100}%` }} />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className={styles.rankTd}>{r.totalCount}件</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              {/* ════ ③ 来場者からの感想 ════ */}
              <section id="kanso" className={styles.section}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.sectionTtl}>来場者からの感想</h2>
                </div>

                {summary.entries.length === 0 ? (
                  <div className={styles.empty}>
                    <p className={styles.emptyTtl}>まだ感想が届いていません</p>
                    <p className={styles.emptySub}>来場者からの感想が届くとここに表示されます。</p>
                  </div>
                ) : (
                  <div className={styles.qaWrap}>
                    {QA_QUESTIONS.map(q => {
                      const answers = summary.entries
                        .map(e => ({ from: e.fromClassId, ans: e.qaAnswers?.[q.key] }))
                        .filter(a => a.ans);
                      return (
                        <div key={q.key} className={styles.qaBlock}>
                          <div className={styles.qaQuestion}>
                            <span className={styles.qaQIcon}>Q</span>
                            <p className={styles.qaQText}>{q.label}</p>
                          </div>
                          {answers.length === 0 ? (
                            <p className={styles.qaNoAnswer}>回答なし</p>
                          ) : (
                            <ul className={styles.qaAnswerList}>
                              {answers.map((a, i) => (
                                <li key={i} className={styles.qaAnswerItem}>
                                  <span className={styles.qaAIcon}>A</span>
                                  <div className={styles.qaAnswerBody}>
                                    <p className={styles.qaAnswerText}>{a.ans}</p>
                                    <p className={styles.qaAnswerFrom}>{a.from} より</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

            </div>{/* /content */}
          </div>{/* /layout */}
        </div>{/* /inner */}
      </main>

      <footer className={styles.footer}>
        <p className={styles.copyright}>
          Copyright © Koryo Festival Committee&nbsp; All rights reserved.
        </p>
      </footer>
    </div>
  );
}
