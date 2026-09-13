import { createHmac, timingSafeEqual } from "node:crypto";
import { env, isWhatsAppApiConfigured } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";

const GRAPH = "https://graph.facebook.com/v21.0";

interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

async function graphPost(body: unknown): Promise<SendResult> {
  const res = await fetch(`${GRAPH}/${env.whatsapp.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    messages?: { id: string }[];
    error?: { message?: string };
  };
  if (!res.ok) return { ok: false, error: json.error?.message ?? `HTTP ${res.status}` };
  return { ok: true, messageId: json.messages?.[0]?.id };
}

async function log(entry: {
  order_id?: string | null;
  direction: "in" | "out";
  wa_message_id?: string | null;
  phone?: string;
  body?: string;
  template_name?: string | null;
  status?: string;
  payload?: unknown;
}) {
  try {
    await adminClient().from("whatsapp_messages").insert(entry);
  } catch {
    // logging must never break the request
  }
}

/** Free-form text. Only delivered if the customer messaged within the last 24 h. */
export async function sendText(to: string, body: string, orderId?: string): Promise<SendResult> {
  if (!isWhatsAppApiConfigured()) return { ok: false, error: "WhatsApp API not configured" };
  const result = await graphPost({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
  await log({
    order_id: orderId ?? null,
    direction: "out",
    wa_message_id: result.messageId ?? null,
    phone: to,
    body,
    status: result.ok ? "sent" : `failed: ${result.error}`,
  });
  return result;
}

/** Pre-approved template. Works outside the 24 h window. */
export async function sendTemplate(
  to: string,
  name: string,
  params: string[],
  orderId?: string,
): Promise<SendResult> {
  if (!isWhatsAppApiConfigured()) return { ok: false, error: "WhatsApp API not configured" };
  const result = await graphPost({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name,
      language: { code: env.whatsapp.templateLang },
      components: params.length
        ? [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }]
        : [],
    },
  });
  await log({
    order_id: orderId ?? null,
    direction: "out",
    wa_message_id: result.messageId ?? null,
    phone: to,
    body: params.join(" | "),
    template_name: name,
    status: result.ok ? "sent" : `failed: ${result.error}`,
  });
  return result;
}

export function statusMessage(o: Order, status: OrderStatus, businessName: string) {
  const lines: Record<OrderStatus, string> = {
    pending: `We've received your order ${o.ref}. We'll confirm shortly.`,
    confirmed: `Your order ${o.ref} is confirmed for ${o.slot_date}, ${o.slot_label}. Thank you!`,
    baking: `Good news: your order ${o.ref} is in the oven right now.`,
    out_for_delivery: `Your order ${o.ref} is on its way to you.`,
    ready_for_pickup: `Your order ${o.ref} is ready for pickup.`,
    delivered: `Your order ${o.ref} has been delivered. Enjoy, and thank you for choosing ${businessName}!`,
    cancelled: `Your order ${o.ref} has been cancelled. Message us if this is unexpected.`,
  };
  return `Hi ${o.customer_name.split(" ")[0]}, ${lines[status]}`;
}

/**
 * Notify a customer of a status change. Uses the status template if one is
 * configured (reliable outside the 24 h window), otherwise free-form text.
 */
export async function notifyStatus(o: Order, status: OrderStatus, businessName: string) {
  if (!o.whatsapp_updates || !isWhatsAppApiConfigured()) return { ok: false, error: "skipped" };
  const to = o.phone_normalized;
  if (env.whatsapp.statusTemplate) {
    return sendTemplate(
      to,
      env.whatsapp.statusTemplate,
      [o.customer_name.split(" ")[0], o.ref, STATUS_LABELS[status]],
      o.id,
    );
  }
  return sendText(to, statusMessage(o, status, businessName), o.id);
}

/** Business-initiated acknowledgement right after checkout (template only). */
export async function notifyNewOrder(o: Order) {
  if (!o.whatsapp_updates || !isWhatsAppApiConfigured() || !env.whatsapp.orderTemplate) return;
  await sendTemplate(
    o.phone_normalized,
    env.whatsapp.orderTemplate,
    [o.customer_name.split(" ")[0], o.ref, `AED ${Number(o.total)}`],
    o.id,
  );
}

/** Alert the owner's own phone about a new order (free-form; needs an open window or a template). */
export async function alertOwner(o: Order) {
  if (!isWhatsAppApiConfigured() || !env.whatsapp.ownerAlertNumber) return;
  const items = (o.order_items ?? []).map((i) => `${i.qty}× ${i.item_name}${i.size_label ? ` (${i.size_label})` : ""}`).join(", ");
  await sendText(
    env.whatsapp.ownerAlertNumber,
    `New order ${o.ref} — ${o.customer_name}, AED ${Number(o.total)}, ${o.mode} on ${o.slot_date} ${o.slot_label}. ${items}`,
    o.id,
  );
}

export function verifySignature(rawBody: string, header: string | null) {
  if (!env.whatsapp.appSecret) return process.env.NODE_ENV !== "production"; // unsigned only in development
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", env.whatsapp.appSecret).update(rawBody).digest("hex");
  const got = header.slice(7);
  if (expected.length !== got.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(got));
}

export async function logInbound(payload: unknown) {
  const db = adminClient();
  type Entry = {
    changes?: {
      value?: {
        messages?: { id: string; from: string; text?: { body: string }; type: string }[];
        statuses?: { id: string; status: string; recipient_id: string }[];
      };
    }[];
  };
  const entries = ((payload as { entry?: Entry[] })?.entry ?? []) as Entry[];
  for (const e of entries) {
    for (const c of e.changes ?? []) {
      for (const m of c.value?.messages ?? []) {
        const { data: order } = await db
          .from("orders")
          .select("id")
          .eq("phone_normalized", m.from)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        await db.from("whatsapp_messages").upsert(
          {
            order_id: order?.id ?? null,
            direction: "in",
            wa_message_id: m.id,
            phone: m.from,
            body: m.text?.body ?? `[${m.type}]`,
            status: "received",
            payload: m,
          },
          { onConflict: "wa_message_id" },
        );
      }
      for (const s of c.value?.statuses ?? []) {
        await db.from("whatsapp_messages").update({ status: s.status }).eq("wa_message_id", s.id);
      }
    }
  }
}
