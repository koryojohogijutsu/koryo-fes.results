"use client";
import { signOut } from "next-auth/react";
import styles from "./MemberPage.module.css";
export function LogoutButton() {
  return <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl:"/login" })}>ログアウト</button>;
}
