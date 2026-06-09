import { KoryoLayout } from "@/components/KoryoLayout";
import styles from "./PrivacyPage.module.css";

export function PrivacyPage() {
  return (
    <KoryoLayout subtitle="個人情報保護への取り組み">
      <div className={styles.card}>
        {/* ページタイトル */}
        <div className={styles.pageTitleBlock}>
          <span className={styles.pageTitleBar} />
          <h1 className={styles.pageTitle}>プライバシーポリシー</h1>
        </div>

        <p className={styles.intro}>
          蛟龍祭実行委員会（以下、「当委員会」という）は、本ウェブサイト上で提供するサービス（以下、「本サービス」という）における、ユーザーの個人情報の取り扱いについて、以下のプライバシーポリシー（以下、「本ポリシー」という）を定める。
        </p>

        <Section title="第１条　個人情報">
          <p>
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指す。
          </p>
        </Section>

        <Section title="第２条　個人情報の収集方法">
          <p>
            当委員会は、ユーザーとして登録するためにメールアドレスを使用しており、蛟龍祭開催時に収集したぐんまスクールネットのメールアドレスである。新規ユーザーとして登録するためにメールアドレスを尋ねる。
          </p>
        </Section>

        <Section title="第３条　個人情報を収集・利用する目的">
          <p>当委員会が個人情報を収集・利用する目的は以下の通りである。</p>
          <ol className={styles.orderedList}>
            <li>当委員会サービスの提供・運営のため</li>
            <li>ユーザーからの問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>メンテナンス、重要なお知らせなど必要に応じた連絡のため</li>
            <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーを特定し、利用を断るため</li>
            <li>ユーザーが自身の登録情報の閲覧や変更を行うため</li>
            <li>上記の利用目的に付随する目的</li>
          </ol>
        </Section>

        <Section title="第４条　利用目的の変更">
          <ol className={styles.orderedList}>
            <li>当委員会は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとする。</li>
            <li>利用目的の変更を行った場合には、変更後の目的について、当委員会所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとする。</li>
          </ol>
        </Section>

        <Section title="第５条　個人情報の第三者提供">
          <ol className={styles.orderedList}>
            <li>当委員会は、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはない。ただし、個人情報保護法その他の法令で認められる場合を除く。</li>
            <li>
              前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとする。
              <ol className={styles.innerList}>
                <li>当委員会が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
              </ol>
            </li>
          </ol>
        </Section>

        <Section title="第６条　個人情報の開示">
          <ol className={styles.orderedList}>
            <li>
              当委員会は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示する。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知する。
              <ol className={styles.innerList}>
                <li>当委員会の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ol>
            </li>
            <li>前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示しない。</li>
          </ol>
        </Section>

        <Section title="第７条　個人情報の訂正及び削除">
          <ol className={styles.orderedList}>
            <li>ユーザーは、当委員会の保有する自己の個人情報が誤った情報である場合には、当委員会が定める手続きにより、当委員会に対して個人情報の訂正、追加または削除（以下、「訂正等」という）を請求することができる。</li>
            <li>当委員会は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとする。</li>
            <li>当委員会は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知する。</li>
          </ol>
        </Section>

        <Section title="第８条　個人情報の利用停止等">
          <ol className={styles.orderedList}>
            <li>当委員会は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下、「利用停止等」という）を求められた場合には、遅滞なく必要な調査を行う。</li>
            <li>前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行う。</li>
            <li>当委員会は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知する。</li>
            <li>前２項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。</li>
          </ol>
        </Section>

        <Section title="第９条　プライバシーポリシーの変更">
          <ol className={styles.orderedList}>
            <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとする。</li>
            <li>当委員会が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとする。</li>
          </ol>
        </Section>

        <p className={styles.closing}>以上</p>
        <p className={styles.date}>（2024年06月）</p>
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
