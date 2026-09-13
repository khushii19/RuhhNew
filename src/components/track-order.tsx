"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { STATUS_LABELS, type Order, type OrderStatus, type Settings } from "@/lib/types";

const RECENT_KEY = "ruhh_recent_orders";
function subscribeStorage(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function readRecent() {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

const DELIVERY_STEPS: OrderStatus[] = ["pending", "confirmed", "baking", "out_for_delivery", "delivered"];
const PICKUP_STEPS: OrderStatus[] = ["pending", "confirmed", "baking", "ready_for_pickup", "delivered"];

export function TrackOrder({ settings }: { settings: Settings }) {
  const params = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const recentRaw = useSyncExternalStore(subscribeStorage, readRecent, () => "[]");
  const recent = useMemo<{ ref: string; phone: string }[]>(() => {
    try {
      const parsed = JSON.parse(recentRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [recentRaw]);

  const lookup = useCallback(async (r: string, p: string) => {
    if (!r || !p) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: r.trim(), phone: p.trim() }),
      });
      const json = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !json.order) {
        setOrder(null);
        setError(json.error ?? "We couldn't find that order. Check the reference and phone number.");
      } else {
        setOrder(json.order);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-lookup when arriving from the order confirmation link (?ref=&phone=).
  useEffect(() => {
    const r = params.get("ref");
    const p = params.get("phone");
    if (!r || !p) return;
    const t = setTimeout(() => lookup(r, p), 0);
    return () => clearTimeout(t);
  }, [params, lookup]);

  const steps = order?.mode === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const stepIdx = order ? (order.status === "cancelled" ? -1 : steps.indexOf(order.status)) : -1;

  return (
    <>
      <h2 className="sec-head">Track your order</h2>
      <form
        className="card mb-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(ref, phone);
        }}
      >
        <label className="label">Order reference</label>
        <input className="field mb-3" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RUH-1042" />
        <label className="label">WhatsApp number used</label>
        <input className="field mb-3" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
        <button className="btn-p w-full rounded-[10px]" disabled={loading}>
          {loading ? "Looking up…" : "Find my order"}
        </button>
        {error && <p className="mt-2 text-[12px] text-danger">{error}</p>}
      </form>

      {order && (
        <div key={order.id} className="m-fade-up mb-6">
          <div className="card mb-4 p-4">
            <div className="text-[11px] text-muted">Order {order.ref}</div>
            <div className="text-[14px] font-bold">
              {order.order_items?.reduce((a, i) => a + i.qty, 0)} item(s) · {aed(order.total)}
            </div>
            <div className="text-[12px] text-sage-deep">
              {order.mode === "delivery" ? "Delivery" : "Pickup"} · {fmtDate(order.slot_date)}, {order.slot_label}
            </div>
            <ul className="mt-2 border-t border-line pt-2 text-[12px] text-muted">
              {order.order_items?.map((i) => (
                <li key={i.id} className="flex justify-between gap-2">
                  <span>
                    {i.qty}× {i.item_name}
                    {i.size_label ? ` (${i.size_label})` : ""}
                    {i.flavour_text ? `, ${i.flavour_text}` : ""}
                  </span>
                  <span>{aed(i.line_total)}</span>
                </li>
              ))}
              <li className="mt-1 flex justify-between border-t border-line pt-1">
                <span>Delivery</span>
                <span>{Number(order.delivery_fee) ? aed(order.delivery_fee) : "Free"}</span>
              </li>
              {Number(order.adjustment_aed) !== 0 && (
                <li className="flex justify-between">
                  <span>{order.adjustment_note || "Adjustment"}</span>
                  <span>{Number(order.adjustment_aed) > 0 ? "+" : ""}{aed(order.adjustment_aed)}</span>
                </li>
              )}
              <li className="flex justify-between font-bold text-ink">
                <span>Total</span>
                <span>{aed(order.total)}</span>
              </li>
            </ul>
            {settings.tax_note && <div className="mt-1 text-[10px] text-muted">{settings.tax_note}</div>}
            <button type="button" onClick={() => window.print()} className="print:hidden mt-2 text-[11px] text-rose-deep underline">
              Print receipt
            </button>
          </div>

          {order.status === "cancelled" ? (
            <div className="mb-4 rounded-[10px] bg-danger/10 p-3 text-[12px] text-danger">This order was cancelled. Message {settings.owner_name} if this is unexpected.</div>
          ) : (
            <div className="relative mb-4 flex justify-between">
              <div aria-hidden className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-line" />
              <div
                aria-hidden
                className="absolute left-[10%] top-4 h-0.5 bg-sage-deep transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(0, stepIdx) * 20}%` }}
              />
              {steps.map((s, idx) => {
                const done = idx < stepIdx;
                const now = idx === stepIdx;
                return (
                  <div key={s} className="m-stagger relative flex flex-1 flex-col items-center text-center" style={{ "--i": idx } as React.CSSProperties}>
                    <div
                      className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full text-[12px] transition-colors duration-500 ${done ? "bg-sage-deep text-on-accent" : now ? "m-pulse bg-rose-deep text-on-accent" : "border border-line bg-surface text-muted"}`}
                    >
                      {done ? "✓" : idx + 1}
                    </div>
                    <div className={`text-[10px] leading-tight ${now ? "font-bold text-rose-deep" : done ? "text-sage-deep" : "text-muted"}`}>{STATUS_LABELS[s]}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mb-4 rounded-[10px] bg-rose/50 p-3 text-[12px] leading-[1.6] text-rose-deep">
            {order.status === "delivered"
              ? "Delivered. Hope you enjoyed it!"
              : order.status === "pending"
                ? `${settings.owner_name} has received your order and will confirm on WhatsApp shortly.`
                : `${settings.owner_name} is on it. You'll get a WhatsApp message with each update.`}
          </div>

          {order.order_events && order.order_events.length > 0 && (
            <div className="mb-4">
              <div className="label">History</div>
              <ul className="text-[12px] text-muted">
                {order.order_events.map((e) => (
                  <li key={e.id} className="flex justify-between border-b border-line py-1 last:border-0">
                    <span>{STATUS_LABELS[e.status]}</span>
                    <span>{fmtDateTime(e.created_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <WhatsAppButton number={settings.whatsapp_number} message={`Hi ${settings.owner_name}! Just checking on my order ${order.ref}.`}>
            Message {settings.owner_name}
          </WhatsAppButton>
          {order.status === "delivered" && (
            <Link href={`/reviews?ref=${order.ref}`} className="btn-o mt-2 w-full">
              Leave a review
            </Link>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <>
          <h2 className="sec-head">Your recent orders</h2>
          <div className="grid gap-2">
            {recent.map((r) => (
              <button
                key={r.ref}
                onClick={() => {
                  setRef(r.ref);
                  setPhone(r.phone);
                  lookup(r.ref, r.phone);
                }}
                className="card flex items-center justify-between p-3 text-left text-[13px] hover:border-rose-mid"
              >
                <span className="font-bold">{r.ref}</span>
                <span className="text-[11px] text-rose-deep">View →</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
