import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.classId !== "admin") return NextResponse.json({}, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File;
  const classId = form.get("classId") as string;
  const year = form.get("year") as string;
  const graphType = form.get("graphType") as string;

  if (!file || !classId || !year || !graphType) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "png";
  const path = `graphs/${classId}/${year}/${graphType}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin!.storage
    .from("koryo-graphs").upload(path, buffer, { contentType: file.type, upsert: true });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { error: dbError } = await supabaseAdmin!.from("koryo_graphs").upsert(
    { class_id: classId, year: Number(year), graph_type: graphType, storage_path: path },
    { onConflict: "class_id,year,graph_type" }
  );
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ ok: true, path });
}
