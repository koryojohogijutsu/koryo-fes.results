// 来場者コメントのアンケート項目定義
// 実際の設問文に合わせて question の文言を変更してください。
export const COMMENT_QUESTIONS = [
  { key: "q1", label: "Q1", question: "企画内容でよかったところはどこですか？" },
  { key: "q2", label: "Q2", question: "企画内容で改善すべき点を教えてください。" },
  { key: "q3", label: "Q3", question: "その他ご意見ご感想あればご記入ください。" },
] as const;

export type CommentQuestionKey = (typeof COMMENT_QUESTIONS)[number]["key"];
