import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(1000),
  orderRef: z.string().trim().max(20).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`reviews:${clientIp(req)}`, 3, 60 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  const d = parsed.data;
  const { error } = await adminClient().from("reviews").insert({
    customer_name: d.name,
    rating: d.rating,
    body: d.body,
    order_ref: d.orderRef?.toUpperCase() || null,
  });
  if (error) return NextResponse.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
