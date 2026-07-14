// ブラウザ専用ヘルパー。ページ閲覧・クリックの計測に使う。
// サーバー側からは呼ばない（document / navigator を参照するため）。

const COOKIE_NAME = "koryo_vid";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type TrackedPage =
  | "member"
  | "privacypolicy"
  | "forgetPassword"
  | "schoolGuideClick";

/** Cookieから匿名訪問者IDを取得。無ければ発行してCookieに保存する。 */
export function getOrCreateVisitorId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (match) return decodeURIComponent(match[1]);

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; max-age=${ONE_YEAR_SECONDS}; path=/; samesite=lax`;
  return id;
}

/** 閲覧・クリックを /api/track に送信する。失敗しても画面には影響させない。 */
export function trackPageView(page: TrackedPage, classId?: string) {
  if (typeof window === "undefined") return;
  try {
    const visitorId = getOrCreateVisitorId();
    const payload = JSON.stringify({ page, classId: classId ?? null, visitorId });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track", blob);
      if (ok) return;
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // 計測失敗はユーザー体験に影響させない
  }
}
