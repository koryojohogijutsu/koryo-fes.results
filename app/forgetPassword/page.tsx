import { KoryoLayout } from "@/components/KoryoLayout";
import Link from "next/link";
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
