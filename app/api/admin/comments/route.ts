import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.classId === "admin";
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({}, { status: 401 });
  const classId = req.nextUrl.searchParams.get("classId");
  const year = req.nextUrl.searchParams.get("year") ?? "2026";
  const { data } = await supabaseAdmin!.from("koryo_comments")
    .select("id, comment, created_at").eq("class_id", classId).eq("year", year)
    .order("created_at", { ascending: false });
  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({}, { status: 401 });
  const { classId, year, comment } = await req.json();
  const { data, error } = await supabaseAdmin!.from("koryo_comments")
    .insert({ class_id: classId, year: Number(year), comment }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data });
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({}, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  const { error } = await supabaseAdmin!.from("koryo_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
