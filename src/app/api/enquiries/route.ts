import { NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { isValidPhone } from "@/lib/format";
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit";
import { enquiryAlertHtml, sendOwnerEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(25).refine(isValidPhone, "Please enter a valid WhatsApp number."),
  occasion: z.string().trim().max(60).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  servings: z.string().trim().max(60).optional(),
  description: z.string().trim().min(10).max(2000),
  budget: z.number().min(0).max(100000).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`enquiries:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) return tooMany(rl.retryAfter);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  const d = parsed.data;
  const { data, error } = await adminClient()
    .from("enquiries")
    .insert({
      name: d.name,
      phone: d.phone,
      occasion: d.occasion ?? null,
      event_date: d.eventDate ?? null,
      servings: d.servings ?? null,
      description: d.description,
      budget_aed: d.budget ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return NextResponse.json({ error: "Could not send your enquiry. Please try again." }, { status: 500 });
  void sendOwnerEmail(`Custom cake enquiry — ${d.name}`, enquiryAlertHtml(data));
  return NextResponse.json({ id: data.id }, { status: 201 });
}
