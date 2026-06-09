import Link from "next/link";
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
          <KoryoIcon size={25} />
          <span className={styles.headerLogoText}>Koryo-fes</span>
        </a>

        {/* クラス企画評価 タイトル + サブタイトル */}
        <div className={styles.headerTitleBlock}>
          <Link href="/login" className={styles.headerTitleLink}>
            <TrophyIcon />
            <span className={styles.headerTitleText}>
              <span className={styles.titleBlack}>クラス</span>
              <span className={styles.titleGreen}>企画</span>
              <span className={styles.titleBlack}>評価</span>
            </span>
          </Link>
          {subtitle && (
            <span className={styles.headerSubtitle}>{subtitle}</span>
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
            <KoryoIcon size={40} />
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
          Copyright © Koryo Festival&nbsp; All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* ────────── SVGアイコン群 ────────── */

export function KoryoIcon({ size = 25 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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

export function TrophyIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 120"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M25 10 h50 v40 a25 25 0 0 1-50 0 Z"
        fill="none"
        stroke="#000"
        strokeWidth="6"
      />
      <path d="M25 20 Q10 20 10 35 Q10 50 25 50" fill="none" stroke="#000" strokeWidth="5" />
      <path d="M75 20 Q90 20 90 35 Q90 50 75 50" fill="none" stroke="#000" strokeWidth="5" />
      <rect x="38" y="70" width="24" height="20" fill="#000" />
      <rect x="28" y="90" width="44" height="8" rx="2" fill="#000" />
    </svg>
  );
}
