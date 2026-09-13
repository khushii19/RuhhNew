import { env } from "@/lib/env";

/**
 * Owner alerts by email through Resend's REST API. Silently skipped when
 * RESEND_API_KEY or ORDER_ALERT_EMAIL are not set.
 */
export function isEmailConfigured() {
  return Boolean(env.email.apiKey && env.email.alertTo);
}

export async function sendOwnerEmail(subject: string, html: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.email.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.email.from, to: env.email.alertTo.split(",").map((s) => s.trim()), subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const esc = (s: string | null | undefined) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export function orderAlertHtml(o: {
  ref: string;
  customer_name: string;
  phone: string;
  mode: string;
  zone_name: string | null;
  address: string | null;
  slot_date: string;
  slot_label: string;
  total: number;
  payment_method: string;
  notes: string | null;
  is_gift: boolean;
  order_items?: { qty: number; item_name: string; size_label: string; flavour_text: string }[];
}) {
  const items = (o.order_items ?? [])
    .map((i) => `<li>${i.qty}× ${esc(i.item_name)}${i.size_label ? ` (${esc(i.size_label)})` : ""}${i.flavour_text ? ` — ${esc(i.flavour_text)}` : ""}</li>`)
    .join("");
  return `<div style="font-family:Georgia,serif;color:#2c1a1a;max-width:520px">
<h2 style="color:#9b4b6b;margin:0 0 8px">New order ${esc(o.ref)}</h2>
<p><b>${esc(o.customer_name)}</b> · ${esc(o.phone)}<br>
${o.mode === "delivery" ? `Delivery · ${esc(o.zone_name)}<br>${esc(o.address)}` : "Pickup"}<br>
<b>${esc(o.slot_date)}, ${esc(o.slot_label)}</b></p>
<ul>${items}</ul>
<p><b>Total AED ${Number(o.total)}</b> · ${o.payment_method === "cash" ? "Cash" : "Bank transfer"}${o.is_gift ? " · 🎁 gift" : ""}</p>
${o.notes ? `<p style="color:#8b5230">Note: ${esc(o.notes)}</p>` : ""}
<p><a href="${env.siteUrl}/admin" style="color:#9b4b6b">Open the orders board</a></p>
</div>`;
}

export function enquiryAlertHtml(e: { name: string; phone: string; occasion: string | null; event_date: string | null; servings: string | null; budget_aed: number | null; description: string }) {
  return `<div style="font-family:Georgia,serif;color:#2c1a1a;max-width:520px">
<h2 style="color:#9b4b6b;margin:0 0 8px">Custom cake enquiry</h2>
<p><b>${esc(e.name)}</b> · ${esc(e.phone)}<br>${esc(e.occasion)} · ${esc(e.event_date) || "date flexible"} · ${esc(e.servings) || "servings —"} · ${e.budget_aed ? `AED ${e.budget_aed}` : "budget —"}</p>
<p style="white-space:pre-wrap">${esc(e.description)}</p>
<p><a href="${env.siteUrl}/admin/enquiries" style="color:#9b4b6b">Open enquiries</a></p>
</div>`;
}
