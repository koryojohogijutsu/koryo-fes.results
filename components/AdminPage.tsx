"use client";

import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import styles from "./AdminPage.module.css";

interface ClassOption { id: string; name: string; }

const GRAPH_TYPES = [
  { key: "radar",      label: "年代別レーダーチャート" },
  { key: "pie_gender", label: "性別円グラフ" },
] as const;

// フォームフィールド定義（セクション分け）
const FIELDS = [
  { s: "基本情報",  k: "plan_name",           l: "企画名",           t: "text"   },
  { s: "基本情報",  k: "target_message",      l: "集客ターゲットメッセージ", t: "text" },
  { s: "基本情報",  k: "ktz",                 l: "KTZ（例: B1）",    t: "text"   },
  { s: "総合",      k: "total_score",         l: "総合得点",         t: "number" },
  { s: "総合",      k: "total_max",           l: "総合合計",         t: "number" },
  { s: "来場者数",  k: "visitors",            l: "来場者数",         t: "number" },
  { s: "来場者数",  k: "visitors_max",        l: "来場者数合計",     t: "number" },
  { s: "来場者数",  k: "ticket",              l: "紙チケット入場",   t: "number" },
  { s: "来場者数",  k: "ticket_max",          l: "紙チケット合計",   t: "number" },
  { s: "年代別",    k: "under_junior",        l: "中学生以下",       t: "number" },
  { s: "年代別",    k: "under_junior_max",    l: "中学生以下合計",   t: "number" },
  { s: "年代別",    k: "high_school",         l: "高校生",           t: "number" },
  { s: "年代別",    k: "high_school_max",     l: "高校生合計",       t: "number" },
  { s: "年代別",    k: "univ_30",             l: "大学生〜30代",     t: "number" },
  { s: "年代別",    k: "univ_30_max",         l: "大学生〜30代合計", t: "number" },
  { s: "年代別",    k: "age_40_50",           l: "40代・50代",       t: "number" },
  { s: "年代別",    k: "age_40_50_max",       l: "40代・50代合計",   t: "number" },
  { s: "年代別",    k: "over_60",             l: "60代以上",         t: "number" },
  { s: "年代別",    k: "over_60_max",         l: "60代以上合計",     t: "number" },
  { s: "年代別",    k: "ex_student",          l: "前高生",           t: "number" },
  { s: "年代別",    k: "ex_student_max",      l: "前高生合計",       t: "number" },
  { s: "投票",      k: "vote_in_school",      l: "学年内投票数",     t: "number" },
  { s: "投票",      k: "vote_in_school_max",  l: "学年内投票合計",   t: "number" },
  { s: "投票",      k: "vote_decoration",     l: "装飾賞投票数",     t: "number" },
  { s: "投票",      k: "vote_decoration_max", l: "装飾賞投票合計",   t: "number" },
  { s: "校内",      k: "deviation_school",    l: "校内偏差値",       t: "number" },
  { s: "校内",      k: "rank_school",         l: "校内順位",         t: "number" },
  { s: "校内",      k: "rank_school_total",   l: "校内クラス総数",   t: "number" },
  { s: "校内",      k: "avg_school",          l: "校内平均",         t: "number" },
  { s: "学年",      k: "deviation_grade",     l: "学年偏差値",       t: "number" },
  { s: "学年",      k: "rank_grade",          l: "学年順位",         t: "number" },
  { s: "学年",      k: "rank_grade_total",    l: "学年クラス総数",   t: "number" },
  { s: "学年",      k: "avg_grade",           l: "学年平均",         t: "number" },
] as const;

const SECTIONS = ["基本情報","総合","来場者数","年代別","投票","校内","学年"] as const;

export function AdminPage() {
  const [tab, setTab]           = useState<"result"|"graph"|"comment">("result");
  const [classes, setClasses]   = useState<ClassOption[]>([]);
  const [selClass, setSelClass] = useState("");
  const year = 2026;

  const [form, setForm]       = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving]   = useState(false);

  const [gType, setGType]     = useState("radar");
  const [gFile, setGFile]     = useState<File | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const [newCmt, setNewCmt]   = useState("");
  const [cmts, setCmts]       = useState<{id:string;comment:string;created_at:string}[]>([]);
  const [cmtMsg, setCmtMsg]   = useState("");

  // クラス一覧
  useEffect(() => {
    fetch("/api/admin/classes").then(r => r.json()).then(d => {
      const list: ClassOption[] = d.classes ?? [];
      setClasses(list);
      if (list.length > 0) setSelClass(list[0].id);
    }).catch(() => {});
  }, []);

  // データ読み込み
  const load = useCallback(() => {
    if (!selClass) return;
    fetch(`/api/admin/result?classId=${selClass}&year=${year}`)
      .then(r => r.json()).then(d => {
        const flat: Record<string,string> = {};
        if (d.result) for (const [k,v] of Object.entries(d.result)) { if (v != null) flat[k] = String(v); }
        setForm(flat);
      }).catch(() => {});
    fetch(`/api/admin/comments?classId=${selClass}&year=${year}`)
      .then(r => r.json()).then(d => setCmts(d.comments ?? [])).catch(() => {});
  }, [selClass, year]);

  useEffect(() => { load(); }, [load]);

  // 成績保存
  async function save() {
    setSaving(true); setSaveMsg("");
    try {
      const res = await fetch("/api/admin/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selClass, year, ...form }),
      });
      const d = await res.json();
      setSaveMsg(res.ok ? "✅ 保存しました" : `❌ ${d.error ?? "保存に失敗しました"}`);
    } catch { setSaveMsg("❌ 通信エラーが発生しました"); }
    setSaving(false);
  }

  // グラフアップロード
  async function upload() {
    if (!gFile) return;
    setUploading(true); setUploadMsg("");
    try {
      const fd = new FormData();
      fd.append("file", gFile);
      fd.append("classId", selClass);
      fd.append("year", String(year));
      fd.append("graphType", gType);
      const res = await fetch("/api/admin/graph", { method: "POST", body: fd });
      const d = await res.json();
      setUploadMsg(res.ok ? "✅ アップロードしました" : `❌ ${d.error ?? "失敗しました"}`);
      if (res.ok) setGFile(null);
    } catch { setUploadMsg("❌ 通信エラーが発生しました"); }
    setUploading(false);
  }

  // コメント追加
  async function addCmt() {
    if (!newCmt.trim()) return;
    setCmtMsg("");
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selClass, year, comment: newCmt.trim() }),
      });
      const d = await res.json();
      if (res.ok) { setCmts(p => [d.comment, ...p]); setNewCmt(""); setCmtMsg("✅ 追加しました"); }
      else setCmtMsg(`❌ ${d.error ?? "失敗しました"}`);
    } catch { setCmtMsg("❌ 通信エラー"); }
  }

  // コメント削除
  async function delCmt(id: string) {
    const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) setCmts(p => p.filter(c => c.id !== id));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.siteName}>クラス<span className={styles.green}>企画</span>評価 — 管理者</span>
          <button className={styles.logoutBtn} onClick={() => signOut({ callbackUrl: "/login" })}>ログアウト</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <h1 className={styles.pageTitle}>管理者ページ</h1>

          {/* クラス選択 */}
          <div className={styles.classBar}>
            <label className={styles.label}>対象クラス：</label>
            <select className={styles.select} value={selClass} onChange={e => setSelClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}（{c.id}）</option>)}
            </select>
          </div>

          {/* タブ */}
          <div className={styles.tabBar}>
            {(["result","graph","comment"] as const).map(t => (
              <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:""}`} onClick={() => setTab(t)}>
                {{ result:"📊 成績データ", graph:"🖼 グラフ画像", comment:"💬 来場者コメント" }[t]}
              </button>
            ))}
          </div>

          {/* ── 成績データ ── */}
          {tab === "result" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>成績データ入力</h2>
              <p className={styles.cardSub}>数値を入力して「保存」してください。既存データは上書きされます。</p>
              {SECTIONS.map(sec => (
                <div key={sec} className={styles.fieldGroup}>
                  <h3 className={styles.fieldGroupTtl}>{sec}</h3>
                  <div className={styles.grid}>
                    {FIELDS.filter(f => f.s === sec).map(f => (
                      <div key={f.k} className={styles.field}>
                        <label className={styles.label}>{f.l}</label>
                        <input
                          className={styles.input}
                          type={f.t}
                          step={f.t === "number" ? "0.1" : undefined}
                          value={form[f.k] ?? ""}
                          onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {saveMsg && <p className={saveMsg.startsWith("✅") ? styles.ok : styles.err}>{saveMsg}</p>}
              <button className={styles.btn} onClick={save} disabled={saving}>
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          )}

          {/* ── グラフ画像 ── */}
          {tab === "graph" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>グラフ画像アップロード</h2>
              <p className={styles.cardSub}>Supabase Storageに保存します。同じ種類は上書きされます。</p>
              <div className={styles.field} style={{ marginBottom: 16 }}>
                <label className={styles.label}>グラフの種類</label>
                <select className={styles.select} value={gType} onChange={e => setGType(e.target.value)}>
                  {GRAPH_TYPES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
              </div>
              <div className={styles.field} style={{ marginBottom: 20 }}>
                <label className={styles.label}>画像ファイル（PNG / JPG）</label>
                <input type="file" accept="image/*"
                  onChange={e => setGFile(e.target.files?.[0] ?? null)} />
                {gFile && <p className={styles.fileName}>選択中: {gFile.name}</p>}
              </div>
              {uploadMsg && <p className={uploadMsg.startsWith("✅") ? styles.ok : styles.err}>{uploadMsg}</p>}
              <button className={styles.btn} onClick={upload} disabled={uploading || !gFile}>
                {uploading ? "アップロード中..." : "アップロード"}
              </button>
            </div>
          )}

          {/* ── 来場者コメント ── */}
          {tab === "comment" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>来場者コメント管理</h2>
              <textarea className={styles.textarea} rows={3} value={newCmt}
                onChange={e => setNewCmt(e.target.value)} placeholder="コメントを入力..." />
              <button className={styles.btnSm} onClick={addCmt} disabled={!newCmt.trim()}>追加</button>
              {cmtMsg && <p className={cmtMsg.startsWith("✅") ? styles.ok : styles.err}>{cmtMsg}</p>}
              <p className={styles.cmtCount}>{cmts.length}件</p>
              <ul className={styles.cmtList}>
                {cmts.map(c => (
                  <li key={c.id} className={styles.cmtItem}>
                    <p className={styles.cmtText}>{c.comment}</p>
                    <div className={styles.cmtMeta}>
                      <span className={styles.cmtDate}>{new Date(c.created_at).toLocaleDateString("ja-JP")}</span>
                      <button className={styles.delBtn} onClick={() => delCmt(c.id)}>削除</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p className={styles.copyright}>Copyright © Koryo Festival Committee&nbsp; All rights reserved.</p>
      </footer>
    </div>
  );
}
