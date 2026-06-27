import { Session } from "next-auth";
import { ClassResult, GraphUrls } from "@/lib/results";
import { LogoutButton } from "./LogoutButton";
import Image from "next/image";
import styles from "./MemberPage.module.css";

interface Props {
  session: Session;
  result: ClassResult | null;
  graphs: GraphUrls;
  comments: { id: string; comment: string; createdAt: string }[];
}

const fmt = (score?: number, max?: number) =>
  score != null && max != null ? `${score} / ${max}` : "—";

export function MemberPage({ session, result, graphs, comments }: Props) {
  const className = session.user?.name ?? session.user?.classId ?? "";

  return (
    <div className={styles.page}>

      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.siteName}>クラス<span className={styles.green}>企画</span>評価</span>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{className}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>

          <h1 className={styles.pageTitle}>{className} の評価結果</h1>

          {/* ══ STEP1 今回の成績 ══ */}
          <section className={styles.section}>
            <div className={styles.stepHead}>
              <div className={styles.stepBadge}><span>STEP</span><span>1</span></div>
              <div className={styles.stepHeadText}>
                <h2 className={styles.stepTtl}>今回の成績</h2>
                <p className={styles.stepPoint}>
                  <span className={styles.pointTag}>POINT</span>
                  まずは前高全体の来場者情報で、自分のクラスの位置を確認してみよう。
                </p>
              </div>
            </div>

            {/* 集客力ターゲットメッセージ */}
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
                      <th className={`${styles.th} ${styles.thGroup}`} colSpan={3}>校内</th>
                      <th className={`${styles.th} ${styles.thGroup}`} colSpan={3}>学年</th>
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
                    {/* 総合 */}
                    <tr className={styles.trTotal}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>総合</td>
                      <td className={styles.td}>{fmt(result.totalScore, result.totalMax)}</td>
                      <td className={styles.td}>{result.deviationSchool ?? "—"}</td>
                      <td className={styles.td}>{result.rankSchool != null ? `${result.rankSchool}（位／${result.rankSchoolTotal ?? "?"}クラス中）` : "—"}</td>
                      <td className={styles.td}>{result.avgSchool ?? "—"}</td>
                      <td className={styles.td}>{result.deviationGrade ?? "—"}</td>
                      <td className={styles.td}>{result.rankGrade != null ? `${result.rankGrade}（位／${result.rankGradeTotal ?? "?"}クラス中）` : "—"}</td>
                      <td className={styles.td}>{result.avgGrade ?? "—"}</td>
                      <td className={`${styles.td} ${styles.tdKtz}`}>{result.ktz ?? "—"}</td>
                    </tr>
                    {/* 来場者数 */}
                    <tr className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>来場者数</td>
                      <td className={styles.td}>{fmt(result.visitors, result.visitorsMax)}</td>
                      <td className={styles.td} colSpan={6}></td>
                      <td className={styles.td}></td>
                    </tr>
                    {/* 紙チケット */}
                    <tr className={styles.trAlt}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>紙チケット入場</td>
                      <td className={styles.td}>{fmt(result.ticket, result.ticketMax)}</td>
                      <td className={styles.td} colSpan={6}></td>
                      <td className={styles.td}></td>
                    </tr>
                    {/* 年代別 */}
                    {[
                      { label: "中学生以下",   s: result.underJunior, m: result.underJuniorMax },
                      { label: "高校生",       s: result.highSchool,  m: result.highSchoolMax  },
                      { label: "大学生〜30代", s: result.univ30,      m: result.univ30Max      },
                      { label: "40代・50代",   s: result.age4050,     m: result.age4050Max     },
                      { label: "60代以上",     s: result.over60,      m: result.over60Max      },
                    ].map((row, i) => (
                      <tr key={row.label} className={i % 2 === 0 ? styles.tr : styles.trAlt}>
                        <td className={`${styles.td} ${styles.tdLabel}`}>{row.label}</td>
                        <td className={styles.td}>{fmt(row.s, row.m)}</td>
                        <td className={styles.td} colSpan={6}></td>
                        <td className={styles.td}></td>
                      </tr>
                    ))}
                    {/* 前高生（点線上） */}
                    <tr className={styles.trDashed}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>前高生</td>
                      <td className={styles.td}>{fmt(result.exStudent, result.exStudentMax)}</td>
                      <td className={styles.td} colSpan={6}></td>
                      <td className={styles.td}></td>
                    </tr>
                    {/* 投票数 */}
                    <tr className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>学年内投票数</td>
                      <td className={styles.td}>{fmt(result.voteInSchool, result.voteInSchoolMax)}</td>
                      <td className={styles.td} colSpan={6}></td>
                      <td className={styles.td}></td>
                    </tr>
                    <tr className={styles.trAlt}>
                      <td className={`${styles.td} ${styles.tdLabel}`}>装飾賞投票数</td>
                      <td className={styles.td}>{fmt(result.voteDecoration, result.voteDecorationMax)}</td>
                      <td className={styles.td} colSpan={6}></td>
                      <td className={styles.td}></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>
                <p className={styles.emptyTtl}>成績データがまだ登録されていません</p>
                <p className={styles.emptySub}>管理者から登録されるまでお待ちください。</p>
              </div>
            )}
          </section>

          {/* ══ STEP2 来場者バランス ══ */}
          <section className={styles.section}>
            <div className={styles.stepHead}>
              <div className={`${styles.stepBadge} ${styles.stepBadge2}`}><span>STEP</span><span>2</span></div>
              <div className={styles.stepHeadText}>
                <h2 className={styles.stepTtl}>来場者バランス</h2>
                <p className={styles.stepPoint}>
                  <span className={styles.pointTag}>POINT</span>
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
              </div>
            )}
          </section>

          {/* ══ 来場者コメント ══ */}
          <section className={styles.section}>
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
                    <div>
                      <p className={styles.commentText}>{c.comment}</p>
                      <p className={styles.commentDate}>
                        {new Date(c.createdAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
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
