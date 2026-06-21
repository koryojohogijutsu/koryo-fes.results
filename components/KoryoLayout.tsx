import Link from "next/link";
import Image from "next/image";
import styles from "./KoryoLayout.module.css";

interface Props {
  /** ヘッダーのサブタイトル（例: "ログイン" "個人情報保護への取り組み"）*/
  subtitle?: string;
  children: React.ReactNode;
}

export function KoryoLayout({ subtitle, children }: Props) {
  return (
    <div className={styles.pageWrap}>
      {/* ===== ヘッダー ===== */}
      <header className={styles.header}>
        {/* Koryo-fes ロゴ (左) */}
        <a
          href="https://koryo-fes.studio.site/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.headerLogo}
        >
          <Image
            src="/icon.png"
            alt="Koryo-fes"
            width={25}
            height={25}
            className={styles.headerLogoImg}
            priority
          />
          <span className={styles.headerLogoText}>Koryo-fes</span>
        </a>

        {/* 右ブロック: クラス企画評価 タイトル + サブタイトル（横並び） */}
        <div className={styles.headerRight}>
          <Link href="/login" className={styles.headerTitleLink}>
            <Image
              src="/icon.png"
              alt=""
              width={40}
              height={40}
              className={styles.headerTitleImg}
              priority
            />
            <span className={styles.headerTitleText}>
              <span className={styles.titleBlack}>クラス</span>
              <span className={styles.titleGreen}>企画</span>
              <span className={styles.titleBlack}>評価</span>
            </span>
          </Link>
          {subtitle && (
            <div className={styles.headerSubtitleCol}>
              <span className={styles.headerSubtitle}>{subtitle}</span>
            </div>
          )}
        </div>
      </header>

      {/* ===== コンテンツ ===== */}
      <main className={styles.main}>{children}</main>

      {/* ===== フッター ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {/* 左: Koryo-fes ロゴ */}
          <a
            href="https://koryo-fes.studio.site/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLogo}
          >
            <Image
              src="/icon.png"
              alt="Koryo-fes"
              width={40}
              height={40}
              className={styles.footerLogoImg}
            />
            <span className={styles.footerLogoText}>Koryo-fes</span>
          </a>

          {/* 右: リンク群 */}
          <div className={styles.footerLinks}>
            <Link href="/privacypolicy" className={styles.footerLink}>
              個人情報保護への取り組みについて
            </Link>
            <span className={styles.footerDivider} />
            <a
              href="https://maebashi-hs.gsn.ed.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              高校案内
            </a>
          </div>
        </div>

        {/* コピーライト */}
        <p className={styles.copyright}>
          Copyright © Koryo Festival Committee&nbsp; All rights reserved.
        </p>
      </footer>
    </div>
  );
}
