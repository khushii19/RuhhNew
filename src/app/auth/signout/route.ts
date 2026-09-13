import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", new URL(req.url).origin), { status: 303 });
}
