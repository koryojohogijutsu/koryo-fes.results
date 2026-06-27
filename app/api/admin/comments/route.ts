import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const classId = req.nextUrl.searchParams.get("classId");
  const year    = req.nextUrl.searchParams.get("year") ?? "2026";

  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin!
    .from("koryo_comments")
    .select("id, comment, created_at")
    .eq("class_id", classId)
    .eq("year", Number(year))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { classId, year, comment } = await req.json();
  if (!classId || !comment)
    return NextResponse.json({ error: "classId and comment required" }, { status: 400 });

  const { data, error } = await supabaseAdmin!
    .from("koryo_comments")
    .insert({ class_id: classId, year: Number(year ?? 2026), comment })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin!
    .from("koryo_comments")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
