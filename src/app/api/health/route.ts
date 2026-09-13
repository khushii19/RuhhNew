import { NextResponse } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";

/**
 * Daily keep-alive (see vercel.json). Writes one row so a free-tier Supabase
 * project never goes idle. Protected by CRON_SECRET when set.
 */
export async function GET(req: Request) {
  if (env.cronSecret && req.headers.get("authorization") !== `Bearer ${env.cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, reason: "supabase not configured" });
  const { error } = await adminClient().from("heartbeats").upsert({ id: 1, last_seen: new Date().toISOString() });
  return NextResponse.json({ ok: !error, at: new Date().toISOString() });
}
