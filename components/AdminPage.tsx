"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./AdminPage.module.css";

interface ClassOption { id: string; name: string; }

const GRAPH_TYPES = [
  { key: "radar",      label: "年代別レーダーチャート" },
  { key: "pie_gender", label: "性別円グラフ" },
  { key: "pie_other",  label: "その他グラフ" },
] as const;

const RESULT_FIELDS: { key: string; label: string; type: string; section: string }[] = [
  // 基本情報
  { key: "grade",               label: "学年",            type: "number", section: "基本情報" },
  { key: "class_num",           label: "組",              type: "number", section: "基本情報" },
  { key: "school_num",          label: "学校番号",         type: "text",   section: "基本情報" },
  { key: "plan_name",           label: "企画名",           type: "text",   section: "基本情報" },
  { key: "target_message",      label: "集客ターゲット",   type: "text",   section: "基本情報" },
  { key: "ktz",                 label: "KTZ",             type: "text",   section: "基本情報" },
  // 総合
  { key: "total_score",         label: "総合得点",         type: "number", section: "総合" },
  { key: "total_max",           label: "総合合計",         type: "number", section: "総合" },
  // 来場者数
  { key: "visitors",            label: "来場者数",         type: "number", section: "来場者数" },
  { key: "visitors_max",        label: "来場者数合計",     type: "number", section: "来場者数" },
  { key: "ticket",              label: "紙チケット入場",   type: "number", section: "来場者数" },
  { key: "ticket_max",          label: "紙チケット合計",   type: "number", section: "来場者数" },
  // 年代別
  { key: "under_junior",        label: "中学生以下",       type: "number", section: "年代別" },
  { key: "under_junior_max",    label: "中学生以下合計",   type: "number", section: "年代別" },
  { key: "high_school",         label: "高校生",           type: "number", section: "年代別" },
  { key: "high_school_max",     label: "高校生合計",       type: "number", section: "年代別" },
  { key: "univ_30",             label: "大学生〜30代",     type: "number", section: "年代別" },
  { key: "univ_30_max",         label: "大学生〜30代合計", type: "number", section: "年代別" },
  { key: "age_40_50",           label: "40代・50代",       type: "number", section: "年代別" },
  { key: "age_40_50_max",       label: "40代・50代合計",   type: "number", section: "年代別" },
  { key: "over_60",             label: "60代以上",         type: "number", section: "年代別" },
  { key: "over_60_max",         label: "60代以上合計",     type: "number", section: "年代別" },
  { key: "ex_student",          label: "前高生",           type: "number", section: "年代別" },
  { key: "ex_student_max",      label: "前高生合計",       type: "number", section: "年代別" },
  // 投票
  { key: "vote_in_school",      label: "学年内投票数",     type: "number", section: "投票" },
  { key: "vote_in_school_max",  label: "学年内投票合計",   type: "number", section: "投票" },
  { key: "vote_decoration",     label: "装飾賞投票数",     type: "number", section: "投票" },
  { key: "vote_decoration_max", label: "装飾賞投票合計",   type: "number", section: "投票" },
  // 校内
  { key: "deviation_school",    label: "校内偏差値",       type: "number", section: "校内" },
  { key: "rank_school",         label: "校内順位",         type: "number", section: "校内" },
  { key: "rank_school_total",   label: "校内クラス総数",   type: "number", section: "校内" },
  { key: "avg_school",          label: "校内平均",         type: "number", section: "校内" },
  // 学年
  { key: "deviation_grade",     label: "学年偏差値",       type: "number", section: "学年" },
  { key: "rank_grade",          label: "学年順位",         type: "number", section: "学年" },
  { key: "rank_grade_total",    label: "学年クラス総数",   type: "number", section: "学年" },
  { key: "avg_grade",           label: "学年平均",         type: "number", section: "学年" },
];

const SECTIONS = ["基本情報","総合","来場者数","年代別","投票","校内","学年"];

export function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"result"|"graph"|"comment">("result");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const year = 2026;

  // 成績フォーム
  const [resultForm, setResultForm] = useState<Record<string, string>>({});
  const [resultMsg, setResultMsg] = useState<{text:string; ok:boolean} | null>(null);
  const [resultLoading, setResultLoading] = useState(false);

  // グラフ
  const [graphType, setGraphType] = useState<string>("radar");
  const [graphFile, setGraphFile] = useState<File | null>(null);
  const [graphMsg, setGraphMsg] = useState<{text:string; ok:boolean} | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  // コメント
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{id:string; comment:string; created_at:string}[]>([]);
  const [commentMsg, setCommentMsg] = useState<{text:string; ok:boolean} | null>(null);

  // クラス一覧取得
  useEffect(() => {
    fetch("/api/admin/classes")
      .then(r => r.json())
      .then(d => {
        const list = d.classes ?? [];
        setClasses(list);
        if (list.length > 0) setSelectedClass(list[0].id);
      })
      .catch(() => setClasses([]));
  }, []);

  // 成績・コメント読み込み
  const loadData = useCallback(() => {
    if (!selectedClass) return;
    fetch(`/api/admin/result?classId=${selectedClass}&year=${year}`)
      .then(r => r.json())
      .then(d => {
        if (d.result) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(d.result)) {
            if (v != null) flat[k] = String(v);
          }
          setResultForm(flat);
        } else {
          setResultForm({});
        }
      });
    fetch(`/api/admin/comments?classId=${selectedClass}&year=${year}`)
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []));
  }, [selectedClass, year]);

  useEffect(() => { loadData(); }, [loadData]);

  // 成績保存
  async function saveResult() {
    setResultLoading(true); setResultMsg(null);
    try {
      const res = await fetch("/api/admin/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, year, ...resultForm }),
      });
      const d = await res.json();
      setResultMsg(res.ok ? { text: "✅ 保存しました", ok: true } : { text: `❌ 失敗: ${d.error ?? res.status}`, ok: false });
    } catch (e) {
      setResultMsg({ text: `❌ エラー: ${e}`, ok: false });
    }
    setResultLoading(false);
  }

  // グラフアップロード
  async function uploadGraph() {
    if (!graphFile) return;
    setGraphLoading(true); setGraphMsg(null);
    try {
      const form = new FormData();
      form.append("file", graphFile);
      form.append("classId", selectedClass);
      form.append("year", String(year));
      form.append("graphType", graphType);
      const res = await fetch("/api/admin/graph", { method: "POST", body: form });
      const d = await res.json();
      setGraphMsg(res.ok ? { text: "✅ アップロードしました", ok: true } : { text: `❌ 失敗: ${d.error ?? res.status}`, ok: false });
      if (res.ok) setGraphFile(null);
    } catch (e) {
      setGraphMsg({ text: `❌ エラー: ${e}`, ok: false });
    }
    setGraphLoading(false);
  }

  // コメント追加
  async function addComment() {
    if (!newComment.trim()) return;
    setCommentMsg(null);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, year, comment: newComment.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        setComments(prev => [d.comment, ...prev]);
        setNewComment("");
        setCommentMsg({ text: "✅ 追加しました", ok: true });
      } else {
        setCommentMsg({ text: `❌ 失敗: ${d.error ?? res.status}`, ok: false });
      }
    } catch (e) {
      setCommentMsg({ text: `❌ エラー: ${e}`, ok: false });
    }
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
          <button className={styles.backBtn} onClick={() => router.push("/member")}>← メンバーページへ</button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inner}>
          <h1 className={styles.pageTitle}>管理者ページ</h1>

          {/* クラス選択 */}
          <div className={styles.classSelectBar}>
            <label className={styles.label}>対象クラス：</label>
            <select className={styles.select} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}（{c.id}）</option>)}
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
              <p className={styles.cardSub}>成績表の数値を入力して「保存」してください。既存データがある場合は上書きされます。</p>
              {SECTIONS.map(section => (
                <div key={section} className={styles.fieldSection}>
                  <h3 className={styles.fieldSectionTtl}>{section}</h3>
                  <div className={styles.formGrid}>
                    {RESULT_FIELDS.filter(f => f.section === section).map(f => (
                      <div key={f.key} className={styles.formField}>
                        <label className={styles.label}>{f.label}</label>
                        <input
                          className={styles.input}
                          type={f.type === "number" ? "number" : "text"}
                          step={["total_score","total_max","deviation_school","avg_school","deviation_grade","avg_grade"].includes(f.key) ? "0.1" : "1"}
                          value={resultForm[f.key] ?? ""}
                          onChange={e => setResultForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {resultMsg && <p className={resultMsg.ok ? styles.msgOk : styles.msgErr}>{resultMsg.text}</p>}
              <button className={styles.saveBtn} onClick={saveResult} disabled={resultLoading}>
                {resultLoading ? "保存中..." : "保存する"}
              </button>
            </div>
          )}

          {/* ── グラフ画像 ── */}
          {tab === "graph" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>グラフ画像アップロード</h2>
              <p className={styles.cardSub}>Supabase Storageに画像を保存します。同じ種類の画像は上書きされます。</p>
              <div className={styles.formField} style={{ marginBottom: 16 }}>
                <label className={styles.label}>グラフの種類</label>
                <select className={styles.select} value={graphType} onChange={e => setGraphType(e.target.value)}>
                  {GRAPH_TYPES.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
                </select>
              </div>
              <div className={styles.formField} style={{ marginBottom: 20 }}>
                <label className={styles.label}>画像ファイル（PNG / JPG）</label>
                <input type="file" accept="image/*" className={styles.fileInput}
                  onChange={e => setGraphFile(e.target.files?.[0] ?? null)} />
                {graphFile && <p className={styles.fileName}>選択中: {graphFile.name}</p>}
              </div>
              {graphMsg && <p className={graphMsg.ok ? styles.msgOk : styles.msgErr}>{graphMsg.text}</p>}
              <button className={styles.saveBtn} onClick={uploadGraph} disabled={graphLoading || !graphFile}>
                {graphLoading ? "アップロード中..." : "アップロード"}
              </button>
            </div>
          )}

          {/* ── 来場者コメント ── */}
          {tab === "comment" && (
            <div className={styles.card}>
              <h2 className={styles.cardTtl}>来場者コメント管理</h2>
              <p className={styles.cardSub}>来場者からのコメントを追加・削除できます。</p>
              <div className={styles.commentInputWrap}>
                <textarea
                  className={styles.textarea}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="来場者のコメントを入力..."
                  rows={3}
                />
                <button className={styles.addBtn} onClick={addComment} disabled={!newComment.trim()}>追加</button>
              </div>
              {commentMsg && <p className={commentMsg.ok ? styles.msgOk : styles.msgErr}>{commentMsg.text}</p>}

              <div className={styles.commentCount}>{comments.length}件のコメント</div>
              <ul className={styles.commentList}>
                {comments.map(c => (
                  <li key={c.id} className={styles.commentItem}>
                    <p className={styles.commentText}>{c.comment}</p>
                    <div className={styles.commentMeta}>
                      <span className={styles.commentDate}>
                        {new Date(c.created_at).toLocaleDateString("ja-JP", { year:"numeric", month:"long", day:"numeric" })}
                      </span>
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
