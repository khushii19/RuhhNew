import Link from "next/link";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { STATUS_LABELS, type Order } from "@/lib/types";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { updateOrderAdjustment } from "@/app/admin/actions";

interface WaMsg {
  id: string;
  direction: "in" | "out";
  body: string | null;
  status: string | null;
  template_name: string | null;
  created_at: string;
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = adminClient();
  const [{ data }, { data: wa }] = await Promise.all([
    db.from("orders").select("*, order_items(*), order_events(*)").eq("id", id).maybeSingle(),
    db.from("whatsapp_messages").select("id, direction, body, status, template_name, created_at").eq("order_id", id).order("created_at"),
  ]);
  if (!data) notFound();
  const o = data as Order;
  const events = [...(o.order_events ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <>
      <Link href="/admin" className="text-[12px] text-muted hover:text-rose-deep">
        ← All orders
      </Link>
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-[20px] font-bold text-rose-deep">{o.ref}</h1>
        <StatusBadge status={o.status} />
        <PaymentBadge status={o.payment_status} />
        {o.is_gift && <span className="tag bg-lav text-lav-deep">🎁 gift</span>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <div className="label">Customer</div>
          <div className="text-[14px] font-bold">{o.customer_name}</div>
          <a className="text-[13px] text-lav-deep" href={`https://wa.me/${o.phone_normalized}`} target="_blank" rel="noopener noreferrer">
            {o.phone} (open WhatsApp)
          </a>
          <div className="label mt-3">Fulfilment</div>
          <div className="text-[13px]">
            {o.mode === "delivery" ? (
              <>
                Delivery · {o.zone_name}
                <br />
                {o.address}
              </>
            ) : (
              "Pickup"
            )}
          </div>
          <div className="mt-1 text-[13px] font-bold">
            {fmtDate(o.slot_date, { weekday: "long", day: "numeric", month: "long" })}, {o.slot_label}
          </div>
          <div className="label mt-3">Payment</div>
          <div className="text-[13px]">{o.payment_method === "cash" ? "Cash on delivery / pickup" : "Bank transfer"}</div>
          {o.notes && (
            <>
              <div className="label mt-3">Special requests</div>
              <div className="text-[13px] text-peach-deep">{o.notes}</div>
            </>
          )}
          {o.is_gift && (
            <>
              <div className="label mt-3">Gift card</div>
              <div className="text-[13px]">
                To: {o.gift_recipient || "—"}
                <br />
                <span className="italic">{o.gift_message || "—"}</span>
              </div>
            </>
          )}
          <div className="mt-2 text-[11px] text-muted">
            WhatsApp updates {o.whatsapp_updates ? "on" : "off"} · Marketing {o.marketing_opt_in ? "yes" : "no"} · Placed {fmtDateTime(o.created_at)}
          </div>
        </div>

        <div className="card p-4">
          <div className="label">Items</div>
          <table className="w-full text-[13px]">
            <tbody>
              {o.order_items?.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="py-1.5">
                    {i.qty}× {i.emoji} {i.item_name}
                    {i.size_label && <span className="text-muted"> · {i.size_label}</span>}
                    {i.flavour_text && <div className="text-[11px] text-lav-deep">{i.flavour_text}</div>}
                  </td>
                  <td className="py-1.5 text-right">{aed(i.line_total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-[12px] text-muted">
              <tr>
                <td className="pt-2">Subtotal</td>
                <td className="pt-2 text-right">{aed(o.subtotal)}</td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td className="text-right">{aed(o.delivery_fee)}</td>
              </tr>
              {Number(o.adjustment_aed) !== 0 && (
                <tr>
                  <td>{o.adjustment_note || "Adjustment"}</td>
                  <td className="text-right">{Number(o.adjustment_aed) > 0 ? "+" : ""}{aed(o.adjustment_aed)}</td>
                </tr>
              )}
              <tr className="text-[15px] font-bold text-rose-deep">
                <td className="pt-1">Total</td>
                <td className="pt-1 text-right">{aed(o.total)}</td>
              </tr>
            </tfoot>
          </table>
          <div className="label mt-4">Update status</div>
          <OrderControls orderId={o.id} mode={o.mode} status={o.status} paymentStatus={o.payment_status} />
          <details className="mt-4">
            <summary className="cursor-pointer text-[12px] text-rose-deep">Adjust delivery fee or add a discount / extra</summary>
            <form action={updateOrderAdjustment} className="mt-2 grid gap-2 sm:grid-cols-[110px_110px_1fr_auto]">
              <input type="hidden" name="id" value={o.id} />
              <div>
                <label className="label">Delivery AED</label>
                <input name="delivery_fee" type="number" step="0.5" min={0} defaultValue={Number(o.delivery_fee)} className="admin-input" />
              </div>
              <div>
                <label className="label">Adjust AED (±)</label>
                <input name="adjustment_aed" type="number" step="0.5" defaultValue={Number(o.adjustment_aed)} className="admin-input" />
              </div>
              <div>
                <label className="label">Reason (shown to customer)</label>
                <input name="adjustment_note" defaultValue={o.adjustment_note ?? ""} placeholder="e.g. Custom topper, Loyalty discount" className="admin-input" />
              </div>
              <button className="btn-o self-end px-3 py-1.5 text-[12px]">Save</button>
            </form>
          </details>
        </div>

        <div className="card p-4">
          <div className="label">History</div>
          <ul className="text-[12px]">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between border-b border-line py-1.5 last:border-0">
                <span>
                  {STATUS_LABELS[e.status]} <span className="text-muted">· {e.actor}</span>
                </span>
                <span className="text-muted">{fmtDateTime(e.created_at)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <div className="label">WhatsApp API log</div>
          {(wa as WaMsg[] | null)?.length ? (
            <ul className="text-[12px]">
              {(wa as WaMsg[]).map((m) => (
                <li key={m.id} className="border-b border-line py-1.5 last:border-0">
                  <span className={m.direction === "out" ? "text-sage-deep" : "text-lav-deep"}>{m.direction === "out" ? "→ sent" : "← received"}</span>{" "}
                  <span className="text-muted">{fmtDateTime(m.created_at)}</span> {m.status && <span className="tag bg-cream2 text-muted">{m.status}</span>}
                  <div>{m.template_name ? `[${m.template_name}] ` : ""}{m.body}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-muted">No API messages for this order yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
