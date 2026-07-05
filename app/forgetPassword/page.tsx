import { KoryoLayout } from "@/components/KoryoLayout";
import Link from "next/link";
import Image from "next/image";
import styles from "./forgetPassword.module.css";

export const metadata = {
  title: "パスワード確認・再設定｜蛟龍祭クラス企画評価",
};

export default function ForgetPassword() {
  return (
    <KoryoLayout subtitle="パスワード確認方法・パスワード再設定">
      <div className={styles.card}>

        {/* ── セクション1: パスワード確認方法 ── */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBar} />
          <h2 className={styles.sectionTitle}>パスワード確認方法（初期パスワード）</h2>
        </div>
        <p className={styles.body}>
          【蛟龍祭クラス企画評価】の左下の赤枠を確認してください。
        </p>

        {/* 初期パスワードの位置を示す画像 */}
        <div className={styles.imgWrap}>
          <Image
            src="/paper_example.png"
            alt="初期パスワードの確認方法（左下の赤枠）"
            width={600}
            height={450}
            className={styles.exampleImg}
          />
        </div>

        {/* ログイン画面へボタン */}
        <div className={styles.btnWrap}>
          <Link href="/login" className={styles.loginBtn}>
            ログイン画面へ
          </Link>
        </div>

      </div>
    </KoryoLayout>
  );
}
