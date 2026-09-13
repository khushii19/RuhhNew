import Link from "next/link";
import { adminClient } from "@/lib/supabase/admin";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { STATUS_LABELS, type Order, type OrderStatus } from "@/lib/types";
import { PaymentBadge, StatusBadge } from "@/components/admin/status-badge";
import { OrderControls } from "@/components/admin/order-controls";
import { todayISO } from "@/lib/availability";
import { LaunchChecklist } from "@/components/admin/launch-checklist";

const FILTERS: { key: string; label: string; statuses?: OrderStatus[] }[] = [
  { key: "active", label: "Active", statuses: ["pending", "confirmed", "baking", "out_for_delivery", "ready_for_pickup"] },
  { key: "today", label: "Today" },
  { key: "pending", label: "New", statuses: ["pending"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
  { key: "all", label: "All" },
];

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  const sp = await searchParams;
  const f = FILTERS.find((x) => x.key === sp.f) ?? FILTERS[0];
  const db = adminClient();
  let query = db.from("orders").select("*, order_items(*)").order("slot_date", { ascending: true }).order("created_at", { ascending: false }).limit(200);
  if (f.statuses) query = query.in("status", f.statuses);
  if (f.key === "today") query = query.eq("slot_date", todayISO()).neq("status", "cancelled");
  if (f.key === "delivered" || f.key === "cancelled" || f.key === "all") query = db.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(200).in("status", f.statuses ?? (Object.keys(STATUS_LABELS) as OrderStatus[]));
  if (sp.q) query = query.or(`ref.ilike.%${sp.q}%,customer_name.ilike.%${sp.q}%,phone_normalized.ilike.%${sp.q.replace(/[^0-9]/g, "")}%`);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  const { count: newCount } = await db.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending");

  return (
    <>
      <LaunchChecklist />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[18px] font-bold">
          Orders {newCount ? <span className="tag ml-1 bg-peach text-peach-deep">{newCount} new</span> : null}
        </h1>
        <form className="flex gap-1.5">
          <input type="hidden" name="f" value={f.key} />
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search ref, name, phone" className="admin-input w-[220px]" />
          <button className="btn-o px-3 py-1.5 text-[12px]">Search</button>
        </form>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((x) => (
          <Link key={x.key} href={`/admin?f=${x.key}`} className={`chip ${x.key === f.key ? "chip-sel" : ""}`}>
            {x.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center text-[13px] text-muted">No orders here.</div>
      ) : (
        <div className="grid gap-2.5">
          {orders.map((o) => (
            <div key={o.id} className="card p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/orders/${o.id}`} className="text-[14px] font-bold text-rose-deep hover:underline">
                      {o.ref}
                    </Link>
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.payment_status} />
                    {o.is_gift && <span className="tag bg-lav text-lav-deep">🎁 gift</span>}
                  </div>
                  <div className="text-[13px]">
                    {o.customer_name} · <a className="text-lav-deep" href={`https://wa.me/${o.phone_normalized}`} target="_blank" rel="noopener noreferrer">{o.phone}</a>
                  </div>
                  <div className="text-[12px] text-muted">
                    {o.mode === "delivery" ? `Delivery · ${o.zone_name ?? ""}` : "Pickup"} · <b className="text-ink">{fmtDate(o.slot_date)}, {o.slot_label}</b> · placed {fmtDateTime(o.created_at)}
                  </div>
                  <ul className="mt-1 text-[12px] text-muted">
                    {o.order_items?.map((i) => (
                      <li key={i.id}>
                        {i.qty}× {i.item_name}
                        {i.size_label ? ` (${i.size_label})` : ""}
                        {i.flavour_text ? ` — ${i.flavour_text}` : ""}
                      </li>
                    ))}
                  </ul>
                  {o.notes && <div className="mt-1 text-[12px] text-peach-deep">Note: {o.notes}</div>}
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold">{aed(o.total)}</div>
                  <div className="text-[11px] text-muted">{o.payment_method === "cash" ? "Cash" : "Bank transfer"}</div>
                </div>
              </div>
              <OrderControls orderId={o.id} mode={o.mode} status={o.status} paymentStatus={o.payment_status} compact />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
