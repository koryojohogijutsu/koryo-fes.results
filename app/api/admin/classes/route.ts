import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.classId !== "admin") return NextResponse.json({}, { status: 401 });
  const { data } = await supabaseAdmin!.from("koryo_classes").select("id, name").neq("id", "admin").order("id");
  return NextResponse.json({ classes: data ?? [] });
}
