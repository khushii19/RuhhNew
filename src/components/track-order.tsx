"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Package } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-context";
import { Toast, type ToastMessage } from "@/components/toast";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aed, fmtDate, fmtDateTime } from "@/lib/format";
import { lineLabel } from "@/lib/orders-format";
import { reorderLines } from "@/lib/reorder";
import { isFinished, trackSteps } from "@/lib/track";
import { STATUS_LABELS, type Category, type MenuItem, type Order, type Settings } from "@/lib/types";

const RECENT_KEY = "ruhh_recent_orders";
/** How many of this device's orders to look up on arrival. */
const RECENT_LIMIT = 4;

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

async function fetchOrder(ref: string, phone: string): Promise<{ order?: Order; error?: string }> {
  const res = await fetch("/api/orders/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: ref.trim(), phone: phone.trim() }),
  });
  const json = (await res.json()) as { order?: Order; error?: string };
  return res.ok && json.order ? { order: json.order } : { error: json.error ?? "We couldn't find that order. Check the reference and phone number." };
}

const itemCount = (o: Order) => o.order_items?.reduce((a, i) => a + i.qty, 0) ?? 0;

export function TrackOrder({ settings, items, categories }: { settings: Settings; items: MenuItem[]; categories: Category[] }) {
  const params = useSearchParams();
  const cart = useCart();
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [phone, setPhone] = useState(params.get("phone") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [past, setPast] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const recentRaw = useSyncExternalStore(subscribeStorage, readRecent, () => "[]");
  const recent = useMemo<{ ref: string; phone: string }[]>(() => {
    try {
      const parsed = JSON.parse(recentRaw);
      return Array.isArray(parsed) ? parsed.filter((r) => r && r.ref && r.phone).slice(0, RECENT_LIMIT) : [];
    } catch {
      return [];
    }
  }, [recentRaw]);

  const lookup = useCallback(async (r: string, p: string) => {
    if (!r.trim() || !p.trim()) {
      setError("Enter your order reference and WhatsApp number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetchOrder(r, p);
      setOrder(res.order ?? null);
      if (res.error) setError(res.error);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // On arrival: show the order from the confirmation link, or else this
  // device's latest unfinished order, and list the rest underneath.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    const r = params.get("ref");
    const p = params.get("phone");
    if (!(r && p) && !recent.length) return;
    started.current = true;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const results = await Promise.all(recent.map((x) => fetchOrder(x.ref, x.phone).catch(() => ({}) as { order?: Order })));
        const found = results.map((x) => x.order).filter((o): o is Order => Boolean(o));
        let current: Order | null = null;
        if (r && p) {
          current = found.find((o) => o.ref === r) ?? null;
          if (!current) {
            const res = await fetchOrder(r, p);
            current = res.order ?? null;
            if (res.error && !cancelled) setError(res.error);
          }
        } else {
          current = found.find((o) => !isFinished(o.status)) ?? found[0] ?? null;
          if (current) {
            setRef(current.ref);
            setPhone(recent.find((x) => x.ref === current!.ref)?.phone ?? "");
          }
        }
        if (cancelled) return;
        setOrder(current);
        setPast(found);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, recent]);

  function orderAgain(o: Order) {
    const { lines, skipped } = reorderLines(o, items, categories, settings);
    lines.forEach((l) => cart.add(l));
    const note = skipped ? ` (${skipped} no longer on the menu)` : "";
    setToast(
      lines.length
        ? { text: `Added to your basket${note}`, action: { label: "View basket", href: "/order" } }
        : { text: "Those bakes aren't on the menu right now" },
    );
  }

  const others = past.filter((o) => o.ref !== order?.ref);

  return (
    <>
      {order ? (
        <CurrentOrder key={order.id} order={order} settings={settings} onOrderAgain={() => orderAgain(order)} />
      ) : (
        !loading &&
        !recent.length &&
        !params.get("ref") && (
          <div className="mb-6 rounded-[16px] border border-line bg-surface px-6 py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose text-rose-deep">
              <Package size={28} aria-hidden />
            </span>
            <p className="mt-3 text-[14.5px] text-muted">No orders yet. Once you place an order it&rsquo;ll appear here.</p>
            <Link href="/menu" className="btn-p press mt-5 px-6 py-3 text-[14px] font-semibold">
              Browse the menu
            </Link>
          </div>
        )
      )}

      {loading && !order && <div className="skeleton mb-6 h-40 w-full" aria-label="Loading your order" />}

      <form
        className="card mb-6 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(ref, phone);
        }}
      >
        <p className="mb-3 text-[13px] text-muted">{order ? "Looking for another order?" : "Find an order"}</p>
        <label className="block">
          <span className="label">Order reference</span>
          <input className="field mb-3" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RUH-260927-001" autoCapitalize="characters" />
        </label>
        <label className="block">
          <span className="label">WhatsApp number used</span>
          <input className="field mb-3" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
        </label>
        <button type="submit" className="btn-p w-full py-3.5 text-[14.5px] font-semibold" disabled={loading}>
          {loading ? "Looking up…" : "Find my order"}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-[12.5px] text-danger">
            {error}
          </p>
        )}
      </form>

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-[20px]">Past orders</h2>
          <div className="grid gap-2">
            {others.map((o) => {
              const first = o.order_items?.[0];
              const n = itemCount(o);
              return (
                <div key={o.id} className="card flex items-center gap-3 p-3">
                  <span className="text-[26px]" aria-hidden>
                    {first?.emoji || "🧁"}
                  </span>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      setOrder(o);
                      setRef(o.ref);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <span className="block truncate text-[13px] font-semibold">{(o.order_items ?? []).map((i) => i.item_name).join(", ")}</span>
                    <span className="block text-[11.5px] text-muted">
                      {fmtDate(o.slot_date)} · {n} item{n === 1 ? "" : "s"} · {aed(o.total)}
                    </span>
                  </button>
                  <span className={`tag shrink-0 ${o.status === "delivered" ? "bg-sage text-sage-deep" : o.status === "cancelled" ? "bg-cream2 text-muted" : "bg-peach text-peach-deep"}`}>
                    {o.status === "delivered" ? "Delivered" : o.status === "cancelled" ? "Cancelled" : "In progress"}
                  </span>
                  <button type="button" onClick={() => orderAgain(o)} className="shrink-0 rounded-full bg-rose px-3 py-1.5 text-[11.5px] font-semibold text-rose-deep hover:bg-rose-deep hover:text-white">
                    Order again
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Toast message={toast} onDone={clearToast} />
    </>
  );
}

function CurrentOrder({ order: o, settings: st, onOrderAgain }: { order: Order; settings: Settings; onOrderAgain: () => void }) {
  const owner = st.owner_name;
  const { steps, index } = trackSteps(o.status, o.mode);
  const n = itemCount(o);
  const done = o.status === "delivered";
  return (
    <div key={o.id} className="m-fade-up mb-6">
      <div className="card mb-5 p-4">
        <div className="text-[11.5px] text-muted">Order #{o.ref}</div>
        <div className="price mt-0.5 text-[15px] font-semibold">
          {n} item{n === 1 ? "" : "s"} · {aed(o.total)}
        </div>
        <div className="mt-0.5 text-[12.5px] text-sage-deep">
          {o.mode === "delivery" ? "Delivery" : "Pickup"} · {fmtDate(o.slot_date)} · {o.slot_label}
        </div>
        <details className="mt-2 border-t border-line pt-2 text-[12.5px] text-muted">
          <summary className="cursor-pointer select-none text-rose-deep">Receipt</summary>
          <ul className="mt-2">
            {o.order_items?.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-0.5">
                <span>
                  {i.qty}× {lineLabel(i)}
                </span>
                <span className="price shrink-0">{aed(i.line_total)}</span>
              </li>
            ))}
            <li className="mt-1 flex justify-between border-t border-line pt-1">
              <span>Delivery</span>
              <span className="price">{Number(o.delivery_fee) ? aed(o.delivery_fee) : "Free"}</span>
            </li>
            {Number(o.adjustment_aed) !== 0 && (
              <li className="flex justify-between">
                <span>{o.adjustment_note || "Adjustment"}</span>
                <span className="price">
                  {Number(o.adjustment_aed) > 0 ? "+" : ""}
                  {aed(o.adjustment_aed)}
                </span>
              </li>
            )}
            <li className="flex justify-between font-semibold text-ink">
              <span>Total</span>
              <span className="price">{aed(o.total)}</span>
            </li>
          </ul>
          {st.tax_note && <div className="mt-1 text-[11px]">{st.tax_note}</div>}
          {o.order_events && o.order_events.length > 0 && (
            <ul className="mt-2 border-t border-line pt-2">
              {o.order_events.map((e) => (
                <li key={e.id} className="flex justify-between py-0.5">
                  <span>{STATUS_LABELS[e.status]}</span>
                  <span>{fmtDateTime(e.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={() => window.print()} className="print:hidden mt-2 text-[12px] text-rose-deep underline">
            Print receipt
          </button>
        </details>
      </div>

      {o.status === "cancelled" ? (
        <div className="mb-4 rounded-[10px] bg-danger/10 p-3 text-[13px] text-danger">This order was cancelled. Message {owner} if this is unexpected.</div>
      ) : (
        <ol className="relative mb-5 grid grid-cols-4" aria-label="Order progress">
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[17px] h-0.5 bg-line" />
          <div
            aria-hidden
            className="absolute left-[12.5%] top-[17px] h-0.5 bg-sage-deep transition-[width] duration-700 ease-out"
            style={{ width: `${(Math.min(index, steps.length - 1) / (steps.length - 1)) * 75}%` }}
          />
          {steps.map((label, idx) => {
            const isDone = idx < index;
            const isNow = idx === index;
            return (
              <li key={label} className="relative flex flex-col items-center text-center" aria-current={isNow ? "step" : undefined}>
                <span
                  className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-500 ${
                    isDone ? "bg-sage-deep text-white" : isNow ? "m-pulse bg-rose-deep text-white" : "border border-line bg-cream2 text-muted"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </span>
                <span className={`px-1 text-[11px] leading-tight ${isNow ? "font-bold text-rose-deep" : isDone ? "text-sage-deep" : "text-muted"}`}>{label}</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mb-4 rounded-[10px] bg-peach p-3.5 text-[13px] leading-[1.6] text-peach-deep">
        {done ? "Delivered. We hope you enjoyed it." : `${owner} has your order. You'll get a WhatsApp message with each update.`}
      </p>

      <WhatsAppButton number={st.whatsapp_number} message={`Hi ${owner}! Just checking on my order #${o.ref}.`}>
        Message {owner}
      </WhatsAppButton>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={onOrderAgain} className="btn-o py-3 text-[13.5px]">
          Order again
        </button>
        {done ? (
          <Link href={`/reviews?ref=${o.ref}`} className="btn-o py-3 text-[13.5px]">
            Leave a review
          </Link>
        ) : (
          <Link href="/menu" className="btn-o py-3 text-[13.5px]">
            Browse the menu
          </Link>
        )}
      </div>
    </div>
  );
}
