import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const form      = await req.formData();
  const file      = form.get("file")      as File   | null;
  const classId   = form.get("classId")   as string | null;
  const year      = form.get("year")      as string | null;
  const graphType = form.get("graphType") as string | null;

  if (!file || !classId || !year || !graphType)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const ext    = file.name.split(".").pop() ?? "png";
  const path   = `graphs/${classId}/${year}/${graphType}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await supabaseAdmin.storage
    .from("koryo-graphs").upload(path, buffer, { contentType: file.type, upsert: true });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { error: dbErr } = await supabaseAdmin.from("koryo_graphs").upsert(
    { class_id: classId, year: Number(year), graph_type: graphType, storage_path: path },
    { onConflict: "class_id,year,graph_type" }
  );
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, path });
}
