// 来場者コメントのアンケート項目定義
// 実際の設問文に合わせて question の文言を変更してください。
export const COMMENT_QUESTIONS = [
  { key: "q1", label: "Q1", question: "よかったところ" },
  { key: "q2", label: "Q2", question: "改善すべき点" },
  { key: "q3", label: "Q3", question: "意見・感想" },
] as const;

export type CommentQuestionKey = (typeof COMMENT_QUESTIONS)[number]["key"];
