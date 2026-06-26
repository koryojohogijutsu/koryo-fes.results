import { Session } from "next-auth";
import { getClassResult, getGraphUrls, getVisitorComments } from "@/lib/results";
import { LogoutButton } from "./LogoutButton";
import Image from "next/image";
import styles from "./MemberPage.module.css";

export async function MemberPage({ session }: { session: Session }) {
  const classId = session.user?.classId ?? "";
  const className = session.user?.name ?? classId;

  const [result, graphs, comments] = await Promise.all([
    getClassResult(classId),
    getGraphUrls(classId),
    getVisitorComments(classId),
  ]);

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

          {/* パンくず（「蛟龍祭クラス企画評価>」削除） */}
          <nav className={styles.breadcrumb}>
            <strong>{className} の評価結果</strong>
          </nav>

          {/* タブバー */}
          <div className={styles.tabBar}>
            <a href="#seiseki" className={styles.tab}>今回の成績</a>
            <a href="#balance" className={styles.tab}>来場者バランス</a>
            <a href="#comments" className={styles.tab}>来場者コメント</a>
          </div>

          {/* ════ STEP1 今回の成績 ════ */}
          <section id="seiseki" className={styles.section}>
            <div className={styles.stepHead}>
              <span className={styles.stepBadge}>STEP<br />1</span>
              <div>
                <h2 className={styles.stepTtl}>今回の成績</h2>
                <p className={styles.stepPoint}>
                  <span className={styles.pointLabel}>POINT</span>
                  まずは前高全体の来場者情報で、自分のクラスの位置を確認してみよう。
                </p>
              </div>
            </div>

            {/* 集客力確認メッセージ */}
            {result?.targetMessage && (
              <div className={styles.targetBox}>
                <span className={styles.targetIcon}>!</span>
                <div>
                  <p className={styles.targetLead}>集客力向上のために真っ先に力を入れてほしい来場者層は</p>
                  <p className={styles.targetMain}>{result.targetMessage}</p>
                </div>
              </div>
            )}

            {result ? (
              <div className={styles.tableWrap}>
                <table className={styles.resultTable}>
                  <thead>
                    <tr>
                      <th className={styles.th} rowSpan={2}>項目</th>
                      <th className={styles.th} rowSpan={2}>得点／合計</th>
                      <th className={styles.th} colSpan={3}>校内</th>
                      <th className={styles.th} colSpan={3}>学年</th>
                      <th className={styles.th} rowSpan={2}>KTZ</th>
                    </tr>
                    <tr>
                      <th className={styles.th}>偏差値</th>
                      <th className={styles.th}>順位</th>
                      <th className={styles.th}>平均値</th>
                      <th className={styles.th}>偏差値</th>
                      <th className={styles.th}>順位</th>
                      <th className={styles.th}>平均値</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "総合",        score: result.totalScore,     max: result.totalMax,      bold: true },
                      { label: "来場者数",     score: result.visitors,       max: result.visitorsMax   },
                      { label: "紙チケット入場",score: result.ticket,         max: result.ticketMax     },
                      { label: "中学生以下",   score: result.underJunior,    max: result.underJuniorMax},
                      { label: "高校生",       score: result.highSchool,     max: result.highSchoolMax },
                      { label: "大学生〜30代", score: result.univ30,         max: result.univ30Max     },
                      { label: "40代・50代",   score: result.age4050,        max: result.age4050Max    },
                      { label: "60代以上",     score: result.over60,         max: result.over60Max     },
                      { label: "前高生",       score: result.exStudent,      max: result.exStudentMax,  dashed: true },
                      { label: "学年内投票数", score: result.voteInSchool,   max: result.voteInSchoolMax },
                      { label: "装飾賞投票数", score: result.voteDecoration, max: result.voteDecorationMax },
                    ].map(row => (
                      <tr key={row.label} className={row.bold ? styles.trTotal : row.dashed ? styles.trDashed : styles.tr}>
                        <td className={`${styles.td} ${styles.tdLabel}`}>{row.label}</td>
                        <td className={styles.td}>
                          {row.score != null && row.max != null
                            ? `${row.score} / ${row.max}`
                            : "—"}
                        </td>
                        <td className={styles.td}>{row.bold ? result.deviationSchool ?? "—" : "—"}</td>
                        <td className={styles.td}>
                          {row.bold && result.rankSchool != null
                            ? `${result.rankSchool}（位／${result.rankSchoolTotal ?? "?"}クラス中）`
                            : "—"}
                        </td>
                        <td className={styles.td}>{row.bold ? result.avgSchool ?? "—" : "—"}</td>
                        <td className={styles.td}>{row.bold ? result.deviationGrade ?? "—" : "—"}</td>
                        <td className={styles.td}>
                          {row.bold && result.rankGrade != null
                            ? `${result.rankGrade}（位／${result.rankGradeTotal ?? "?"}クラス中）`
                            : "—"}
                        </td>
                        <td className={styles.td}>{row.bold ? result.avgGrade ?? "—" : "—"}</td>
                        <td className={`${styles.td} ${styles.tdKtz}`}>{row.bold ? result.ktz ?? "—" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyTtl}>成績データがまだ登録されていません</p>
              </div>
            )}
          </section>

          {/* ════ STEP2 来場者バランス ════ */}
          <section id="balance" className={styles.section}>
            <div className={styles.stepHead}>
              <span className={styles.stepBadge}>STEP<br />2</span>
              <div>
                <h2 className={styles.stepTtl}>来場者バランス</h2>
                <p className={styles.stepPoint}>
                  <span className={styles.pointLabel}>POINT</span>
                  今回最も偏差値が低かった入場者層に注目し、バランスを整えることを大事にしよう。
                </p>
              </div>
            </div>

            {graphs.radar || graphs.pieGender ? (
              <div className={styles.graphGrid}>
                {graphs.radar && (
                  <div className={styles.graphCard}>
                    <p className={styles.graphTtl}>年代別の来場者バランス</p>
                    <div className={styles.graphImgWrap}>
                      <Image src={graphs.radar} alt="年代別来場者バランス" fill style={{ objectFit: "contain" }} unoptimized />
                    </div>
                  </div>
                )}
                {graphs.pieGender && (
                  <div className={styles.graphCard}>
                    <p className={styles.graphTtl}>性別の来場者バランス</p>
                    <div className={styles.graphImgWrap}>
                      <Image src={graphs.pieGender} alt="性別来場者バランス" fill style={{ objectFit: "contain" }} unoptimized />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyTtl}>グラフ画像がまだ登録されていません</p>
                <p className={styles.emptySub}>管理者ページから画像をアップロードしてください。</p>
              </div>
            )}
          </section>

          {/* ════ 来場者コメント ════ */}
          <section id="comments" className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTtl}>来場者コメント</h2>
            </div>

            {comments.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyTtl}>コメントがまだありません</p>
              </div>
            ) : (
              <ul className={styles.commentList}>
                {comments.map(c => (
                  <li key={c.id} className={styles.commentItem}>
                    <span className={styles.commentIcon}>✍</span>
                    <div className={styles.commentBody}>
                      <p className={styles.commentText}>{c.comment}</p>
                      <p className={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleDateString("ja-JP", { year:"numeric", month:"long", day:"numeric" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.copyright}>Copyright © Koryo Festival Committee&nbsp; All rights reserved.</p>
      </footer>
    </div>
  );
}
