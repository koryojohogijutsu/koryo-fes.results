import { KoryoLayout } from "@/components/KoryoLayout";
import styles from "./PrivacyPage.module.css";

export function PrivacyPage() {
  return (
    <KoryoLayout subtitle="ご利用にあたって">
      <div className={styles.card}>
        {/* ページタイトル */}
        <div className={styles.pageTitleBlock}>
          <span className={styles.pageTitleBar} />
          <h1 className={styles.pageTitle}>サービスポリシー</h1>
        </div>

        <p className={styles.intro}>
          蛟龍祭実行委員会（以下、「当委員会」という）は、本ウェブサイト上で提供するサービス（以下、「本サービス」という）における、情報の取り扱いについて、以下のとおり定める。
        </p>

        <Section title="第１条　本サービスについて">
          <p>
            本サービスは、蛟龍祭の来場者アンケート等から得られた統計情報（来場者数、年代別内訳、投票数など）を、クラスごとに集計・分析した結果を、当該クラスの生徒が閲覧できるようにするものである。本サービスで表示される情報は統計上の集計値であり、来場者個人を識別できるものではない。
          </p>
        </Section>

        <Section title="第２条　ログインID・パスワードについて">
          <p>当委員会が発行するログイン情報について以下の通り定める。</p>
          <ol className={styles.orderedList}>
            <li>本サービスの利用に必要なログインID・パスワードは、当委員会がクラスごとに発行する。</li>
            <li>ログインID・パスワードでログインしたユーザーが閲覧できるのは、当該クラスに関する情報に限られ、他クラスの情報を閲覧することはできない。</li>
            <li>ユーザーは、付与されたログインID・パスワードを第三者に共有・貸与しないものとし、その管理について責任を負うものとする。</li>
            <li>ログインID・パスワードは、当委員会の裁量により、予告なく利用停止または削除することがある。</li>
          </ol>
        </Section>

        <Section title="第３条　本サービスで取得する情報">
          <p>当委員会は、本サービスの提供にあたり、以下の情報を取得することがある。</p>
          <ol className={styles.orderedList}>
            <li>ログイン状態を維持するためのセッション情報（Cookie等）</li>
            <li>来場者アンケートへの回答内容（氏名等は含まれない任意記述のコメントを含む）</li>
            <li>アクセスログ等の技術的情報</li>
          </ol>
          <p>これらは特定の個人を識別することを目的として取得するものではない。ただし、来場者アンケートの自由記述欄に個人を識別しうる情報が記載された場合、当該部分は当委員会の判断で一部または全てを削除することがある。</p>
        </Section>

        <Section title="第４条　情報の第三者提供">
            <p>
              当委員会は、法令に基づく場合を除き、取得した情報を本サービスの提供に必要な範囲を超えて第三者に提供することはない。ただし、本サービスの運用に必要なサーバー・データベース等のインフラ事業者への業務委託を妨げない。
            </p>
        </Section>

        <Section title="第５条　来場者情報の削除及び情報訂正の請求">
          <p>不適切な内容を含む情報については当委員会の判断により該当部分を削除した。また、情報の訂正（削除を含む）を希望する場合は、下記まで連絡するものとする。</p>
          <p>当委員会本部 E-mail：honbu.koryo.fes@gmail.com</p>
        </Section>

        <Section title="第６条　個人情報の利用停止等">
          <ol className={styles.orderedList}>
            <li>当委員会は、ユーザーが不正の手段により他クラス等のログイン情報を取得した虞がある場合には、必要な調査を行う。</li>
            <li>前項の調査結果に基づき、不正な手段による情報取得が認定されたと判断した場合には、遅滞なく当該クラス等のログイン情報の変更や利用の一時停止等のセキュリティ保護を目的とする措置を行う。</li>
            <li>当委員会は、前項の規定に基づき措置を行った場合には、遅滞なく、これをその措置により影響を受けるユーザーに通知する。</li>
            <li>前２項にかかわらず、当委員会が行う措置に多額の費用を有する場合 その他その措置を行うことが困難な場合であって、本サービスのセキュリティを保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとする。</li>
          </ol>
        </Section>

        <Section title="第７条　サイトポリシーの変更">
          <ol className={styles.orderedList}>
            <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとする。</li>
            <li>当委員会が別途定める場合を除いて、変更後のサービスポリシーは、本ウェブサイトに掲載したときから効力を生じるものとする。</li>
          </ol>
        </Section>

        <p className={styles.closing}>以上</p>
        <p className={styles.date}>（2026年6月）</p>
      </div>
    </KoryoLayout>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 0 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 5,
            height: 40,
            background: "#8cd15c",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: "'Lato', 'Noto Sans JP', sans-serif",
            fontSize: 24,
            fontWeight: 900,
            color: "#8cd15c",
            marginLeft: 10,
            lineHeight: 1.4,
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ marginTop: 10, fontFamily: "'Noto Sans JP', sans-serif", fontSize: 15, lineHeight: 1.4, color: "#000" }}>
        {children}
      </div>
    </section>
  );
}
