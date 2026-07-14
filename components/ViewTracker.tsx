"use client";

import { useEffect } from "react";
import { trackPageView, TrackedPage } from "@/lib/pageViews";

interface Props {
  page: TrackedPage;
  classId?: string;
}

/** マウント時に1回だけ閲覧計測を送信する。画面には何も表示しない。 */
export function ViewTracker({ page, classId }: Props) {
  useEffect(() => {
    trackPageView(page, classId);
    // ページ遷移のたびに1回だけ送りたいので依存配列はこれで固定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, classId]);

  return null;
}
