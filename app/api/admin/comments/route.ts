import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const classId = req.nextUrl.searchParams.get("classId");
  const year    = req.nextUrl.searchParams.get("year") ?? "2026";
  if (!classId) return NextResponse.json({ error: "classId required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("koryo_comments").select("id, comment, created_at")
    .eq("class_id", classId).eq("year", Number(year))
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { classId, year, comment } = await req.json();
  if (!classId || !comment)
    return NextResponse.json({ error: "classId and comment required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("koryo_comments")
    .insert({ class_id: classId, year: Number(year ?? 2026), comment })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)   return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("koryo_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
