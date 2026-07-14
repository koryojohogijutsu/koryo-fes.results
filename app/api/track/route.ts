import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_PAGES = new Set([
  "member",
  "privacypolicy",
  "forgetPassword",
  "schoolGuideClick",
]);

// 閲覧・クリックを1件記録する。未ログインの訪問者からも呼ばれるため認証は不要。
// 失敗してもユーザー体験に影響を与えないよう、常に200系を返す。
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const page = body?.page;
    const classId = body?.classId ?? null;
    const visitorId = body?.visitorId;
    const year = Number(body?.year ?? 2026);

    if (!page || !ALLOWED_PAGES.has(page) || !visitorId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: false }, { status: 200 });
    }

    await supabaseAdmin.from("koryo_page_views").insert({
      page,
      class_id: page === "member" && classId ? String(classId) : null,
      visitor_id: String(visitorId),
      year,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
