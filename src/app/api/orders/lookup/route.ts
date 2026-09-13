import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/format";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const schema = z.object({ ref: z.string().trim().min(3).max(20), phone: z.string().trim().min(7).max(25) });

export async function POST(req: Request) {
  const rl = rateLimit(`lookup:${clientIp(req)}`, 30, 10 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter your order reference and phone number." }, { status: 400 });
  const ref = parsed.data.ref.toUpperCase().replace(/\s+/g, "");
  const phone = normalizePhone(parsed.data.phone);
  const { data } = await adminClient()
    .from("orders")
    .select("*, order_items(*), order_events(*)")
    .eq("ref", ref)
    .eq("phone_normalized", phone)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "We couldn't find that order. Check the reference and phone number." }, { status: 404 });
  const order = {
    ...data,
    order_events: [...(data.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)),
  };
  return NextResponse.json({ order });
}
