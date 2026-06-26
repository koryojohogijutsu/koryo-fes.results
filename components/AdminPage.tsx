"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminPage.module.css";

// ── 型 ────────────────────────────────────────────────────────
interface ClassOption { id: string; name: string; }

const GRAPH_TYPES = [
  { key: "radar",      label: "年代別レーダーチャート" },
  { key: "pie_gender", label: "性別円グラフ" },
  { key: "pie_other",  label: "その他グラフ" },
] as const;

const RESULT_FIELDS = [
  { key: "grade",           label: "学年",           type: "number" },
  { key: "class_num",       label: "組",             type: "number" },
  { key: "school_num",      label: "学校番号",        type: "text"   },
  { key: "plan_name",       label: "企画名",          type: "text"   },
  { key: "total_score",     label: "総合得点",        type: "number" },
  { key: "total_max",       label: "総合合計",        type: "number" },
  { key: "visitors",        label: "来場者数",        type: "number" },
  { key: "visitors_max",    label: "来場者数合計",    type: "number" },
  { key: "ticket",          label: "紙チケット入場",  type: "number" },
  { key: "ticket_max",      label: "紙チケット合計",  type: "number" },
  { key: "under_junior",    label: "中学生以下",      type: "number" },
  { key: "under_junior_max",label: "中学生以下合計",  type: "number" },
  { key: "high_school",     label: "高校生",          type: "number" },
  { key: "high_school_max", label: "高校生合計",      type: "number" },
  { key: "univ_30",         label: "大学生〜30代",    type: "number" },
  { key: "univ_30_max",     label: "大学生〜30代合計",type: "number" },
  { key: "age_40_50",       label: "40代・50代",      type: "number" },
  { key: "age_40_50_max",   label: "40代・50代合計",  type: "number" },
  { key: "over_60",         label: "60代以上",        type: "number" },
  { key: "over_60_max",     label: "60代以上合計",    type: "number" },
  { key: "ex_student",      label: "前高生",          type: "number" },
  { key: "ex_student_max",  label: "前高生合計",      type: "number" },
  { key: "vote_in_school",  label: "学年内投票数",    type: "number" },
  { key: "vote_in_school_max", label:"学年内投票合計",type: "number" },
  { key: "vote_decoration", label: "装飾賞投票数",    type: "number" },
  { key: "vote_decoration_max",label:"装飾賞投票合計",type: "number" },
  { key: "deviation_school",label: "校内偏差値",      type: "number" },
  { key: "rank_school",     label: "校内順位",        type: "number" },
  { key: "rank_school_total",label:"校内クラス総数",  type: "number" },
  { key: "avg_school",      label: "校内平均",        type: "number" },
  { key: "deviation_grade", label: "学年偏差値",      type: "number" },
  { key: "rank_grade",      label: "学年順位",        type: "number" },
  { key: "rank_grade_total",label: "学年クラス総数",  type: "number" },
  { key: "avg_grade",       label: "学年平均",        type: "number" },
  { key: "ktz",             label: "KTZ",             type: "text"   },
  { key: "target_message",  label: "集客ターゲットメッセージ", type: "text" },
] as const;

export function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"result"|"graph"|"comment">("result");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [year] = useState(2026);

  // 成績フォーム
  const [resultForm, setResultForm] = useState<Record<string, string>>({});
  const [resultMsg, setResultMsg] = useState("");
  const [resultLoading, setResultLoading] = useState(false);

  // グラフアップロード
  const [graphType, setGraphType] = useState<string>("radar");
  const [graphFile, setGraphFile] = useState<File | null>(null);
  const [graphMsg, setGraphMsg] = useState("");
  const [graphLoading, setGraphLoading] = useState(false);

  // コメント追加
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{id:string;comment:string;created_at:string}[]>([]);
  const [commentMsg, setCommentMsg] = useState("");

  // クラス一覧取得
  useEffect(() => {
    fetch("/api/admin/classes").then(r => r.json()).then(d => {
      setClasses(d.classes ?? []);
      if (d.classes?.length > 0) setSelectedClass(d.classes[0].id);
    });
  }, []);

  // 既存成績読み込み
  useEffect(() => {
    if (!selectedClass) return;
    fetch(`/api/admin/result?classId=${selectedClass}&year=${year}`)
      .then(r => r.json()).then(d => {
        if (d.result) setResultForm(d.result);
        else setResultForm({});
      });
    fetch(`/api/admin/comments?classId=${selectedClass}&year=${year}`)
      .then(r => r.json()).then(d => setComments(d.comments ?? []));
  }, [selectedClass, year]);

  // 成績保存
  async function saveResult() {
    setResultLoading(true); setResultMsg("");
    const res = await fetch("/api/admin/result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, year, ...resultForm }),
    });
    setResultMsg(res.ok ? "✅ 保存しました" : "❌ 保存に失敗しました");
    setResultLoading(false);
  }

  // グラフアップロード
  async function uploadGraph() {
    if (!graphFile) return;
    setGraphLoading(true); setGraphMsg("");
    const form = new FormData();
    form.append("file", graphFile);
    form.append("classId", selectedClass);
    form.append("year", String(year));
    form.append("graphType", graphType);
    const res = await fetch("/api/admin/graph", { method: "POST", body: form });
    setGraphMsg(res.ok ? "✅ アップロードしました" : "❌ アップロードに失敗しました");
    setGraphLoading(false);
  }

  // コメント追加
  async function addComment() {
    if (!newComment.trim()) return;
    const res = await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, year, comment: newComment }),
    });
    if (res.ok) {
      const d = await res.json();
      setComments(prev => [d.comment, ...prev]);
      setNewComment("");
      setCommentMsg("✅ 追加しました");
    } else { setCommentMsg("❌ 追加に失敗しました"); }
  }

  // コメント削除
  async function deleteComment(id: string) {
    const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) setComments(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.siteName}>クラス<span className={styles.green}>企画</span>評価 — 管理者</span>
          <div className={styles.headerRight}>
            <button className={styles.backBtn} onClick={() => router.push("/member")}>← メンバーページへ</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <h1 className={styles.pageTitle}>管理者ページ</h1>

          {/* クラス選択 */}
          <div className={styles.classSelect}>
            <label className={styles.label}>対象クラス</label>
            <select className={styles.select} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* タブ */}
          <div className={styles.tabBar}>
            {(["result","graph","comment"] as const).map(t => (
              <button key={t} className={`${styles.tab} ${tab===t ? styles.tabActive : ""}`} onClick={() => setTab(t)}>
                {{ result:"📊 成績データ", graph:"🖼 グラフ画像", comment:"💬 来場者コメント" }[t]}
              </button>
            ))}
          </div>

          {/* ── 成績データ ── */}
          {tab === "result" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>成績データ入力</h2>
              <p className={styles.cardSub}>画像の成績表の数値を入力してください。「保存」ボタンで上書き登録されます。</p>
              <div className={styles.formGrid}>
                {RESULT_FIELDS.map(f => (
                  <div key={f.key} className={styles.formField}>
                    <label className={styles.label}>{f.label}</label>
                    <input
                      className={styles.input}
                      type={f.type}
                      value={resultForm[f.key] ?? ""}
                      onChange={e => setResultForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              {resultMsg && <p className={styles.msg}>{resultMsg}</p>}
              <button className={styles.saveBtn} onClick={saveResult} disabled={resultLoading}>
                {resultLoading ? "保存中..." : "保存"}
              </button>
            </div>
          )}

          {/* ── グラフ画像 ── */}
          {tab === "graph" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>グラフ画像アップロード</h2>
              <p className={styles.cardSub}>Supabase Storageに画像を保存します。PNG/JPG推奨。</p>
              <div className={styles.formField}>
                <label className={styles.label}>グラフの種類</label>
                <select className={styles.select} value={graphType} onChange={e => setGraphType(e.target.value)}>
                  {GRAPH_TYPES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>画像ファイル</label>
                <input type="file" accept="image/*" className={styles.fileInput}
                  onChange={e => setGraphFile(e.target.files?.[0] ?? null)} />
              </div>
              {graphMsg && <p className={styles.msg}>{graphMsg}</p>}
              <button className={styles.saveBtn} onClick={uploadGraph} disabled={graphLoading || !graphFile}>
                {graphLoading ? "アップロード中..." : "アップロード"}
              </button>
            </div>
          )}

          {/* ── 来場者コメント ── */}
          {tab === "comment" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>来場者コメント管理</h2>
              <div className={styles.commentForm}>
                <textarea
                  className={styles.textarea}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="来場者のコメントを入力してください..."
                  rows={3}
                />
                {commentMsg && <p className={styles.msg}>{commentMsg}</p>}
                <button className={styles.saveBtn} onClick={addComment}>追加</button>
              </div>
              <ul className={styles.commentList}>
                {comments.map(c => (
                  <li key={c.id} className={styles.commentItem}>
                    <p className={styles.commentText}>{c.comment}</p>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentDate}>{new Date(c.created_at).toLocaleDateString("ja-JP")}</span>
                      <button className={styles.deleteBtn} onClick={() => deleteComment(c.id)}>削除</button>
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
