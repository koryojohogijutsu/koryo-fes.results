import { Session } from "next-auth";
import { ClassResult, GraphUrls, VisitorComment, ItemStat } from "@/lib/results";
import { COMMENT_QUESTIONS } from "@/lib/commentQuestions";
import { LogoutButton } from "./LogoutButton";
import { ViewTracker } from "./ViewTracker";
import Image from "next/image";
import styles from "./MemberPage.module.css";

interface Props {
  session: Session;
  result: ClassResult | null;
  graphs: GraphUrls;
  comments: VisitorComment[];
}

const fmt = (score?: number, max?: number) =>
  score != null && max != null ? `${score} / ${max}` : "—";

const fmtRank = (rank?: number, total?: number) =>
  rank != null ? `${rank}（位／${total ?? "?"}クラス中）` : "—";

// 項目（来場者数・紙チケットなど）の行を共通レンダリングするヘルパー
function ItemRow({
  label, stat, rankSchoolTotal, rankGradeTotal, alt, dashed,
}: {
  label: string; stat: ItemStat;
  rankSchoolTotal?: number; rankGradeTotal?: number;
  alt?: boolean; dashed?: boolean;
}) {
  const cls = [alt ? styles.trAlt : styles.tr, dashed ? styles.trDashed : ""].filter(Boolean).join(" ");
  return (
    <tr className={cls}>
      <td className={`${styles.td} ${styles.tdLabel}`}>{label}</td>
      <td className={styles.td}>{fmt(stat.value, stat.max)}</td>
      <td className={styles.td}>{stat.deviationSchool ?? "—"}</td>
      <td className={styles.td}>{fmtRank(stat.rankSchool, rankSchoolTotal)}</td>
      <td className={styles.td}>{stat.avgSchool ?? "—"}</td>
      <td className={styles.td}>{stat.deviationGrade ?? "—"}</td>
      <td className={styles.td}>{fmtRank(stat.rankGrade, rankGradeTotal)}</td>
      <td className={styles.td}>{stat.avgGrade ?? "—"}</td>
      <td className={`${styles.td} ${styles.tdKtz}`}>{stat.ktz ?? "—"}</td>
    </tr>
  );
}

export function MemberPage({ session, result, graphs, comments }: Props) {
  const className = session.user?.name ?? session.user?.classId ?? "";

  return (
    <div className={styles.page}>
      <ViewTracker page="member" classId={session.user?.classId ?? undefined} />

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
                      <td className={styles.td}>{fmtRank(result.rankSchool, result.rankSchoolTotal)}</td>
                      <td className={styles.td}>{result.avgSchool ?? "—"}</td>
                      <td className={styles.td}>{result.deviationGrade ?? "—"}</td>
                      <td className={styles.td}>{fmtRank(result.rankGrade, result.rankGradeTotal)}</td>
                      <td className={styles.td}>{result.avgGrade ?? "—"}</td>
                      <td className={`${styles.td} ${styles.tdKtz}`}>{result.ktz ?? "—"}</td>
                    </tr>

                    <ItemRow label="来場者数" stat={result.visitors}
                      rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />
                    <ItemRow label="紙チケット入場" stat={result.ticket} alt
                      rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />

                    {/* 年代別（中学生以下の前に点線） */}
                    {[
                      { label: "中学生以下",   stat: result.underJunior },
                      { label: "高校生",       stat: result.highSchool  },
                      { label: "大学生〜30代", stat: result.univ30      },
                      { label: "40代・50代",   stat: result.age4050     },
                      { label: "60代以上",     stat: result.over60      },
                    ].map((row, i) => (
                      <ItemRow key={row.label} label={row.label} stat={row.stat} alt={i % 2 !== 0} dashed={i === 0}
                        rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />
                    ))}

                    <ItemRow label="前高生" stat={result.exStudent} alt
                      rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />

                    {/* 投票数（学年内投票数の前に点線） */}
                    <ItemRow label="学年内投票数" stat={result.voteInSchool} dashed
                      rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />
                    <ItemRow label="装飾賞投票数" stat={result.voteDecoration} alt
                      rankSchoolTotal={result.rankSchoolTotal} rankGradeTotal={result.rankGradeTotal} />
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
                    <div className={styles.commentBody}>
                      {COMMENT_QUESTIONS.map(q => {
                        const val = c[q.key];
                        if (!val) return null;
                        return (
                          <div key={q.key} className={styles.commentQA}>
                            <p className={styles.commentQ}>{q.label}. {q.question}</p>
                            <p className={styles.commentText}>{val}</p>
                          </div>
                        );
                      })}
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
