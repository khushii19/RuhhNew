"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { WhatsAppIcon } from "@/components/icons";
import { Confetti } from "@/components/confetti";
import { availableDates } from "@/lib/availability";
import { aed, fmtDate, isValidPhone } from "@/lib/format";
import type { CartLine, DeliveryZone, Order, Settings } from "@/lib/types";

interface PlacedOrder {
  order: Order;
  whatsappUrl: string;
}

export function lineDisplay(l: CartLine) {
  const mixText = l.mix
    ? Object.entries(l.mix)
        .filter(([, n]) => n > 0)
        .map(([f, n]) => `${n}× ${f}`)
        .join(", ")
    : "";
  return [mixText || l.flavour, l.sizeLabel].filter(Boolean).join(" · ");
}

export function Checkout({ settings, zones }: { settings: Settings; zones: DeliveryZone[] }) {
  const cart = useCart();
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? "");
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickedDate, setSlotDate] = useState("");
  const [slotLabel, setSlotLabel] = useState(settings.slots[0] ?? "");
  const [notes, setNotes] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [payment, setPayment] = useState<"cash" | "bank_transfer">(settings.accept_cash ? "cash" : "bank_transfer");
  const [waUpdates, setWaUpdates] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [website, setWebsite] = useState(""); // honeypot

  const dates = useMemo(() => availableDates(cart.leadHours, settings, 14), [cart.leadHours, settings]);
  // If the cart's lead time pushes the chosen date out of range, fall back to the earliest allowed date.
  const slotDate = dates.includes(pickedDate) ? pickedDate : dates[0] ?? "";

  const zone = zones.find((z) => z.id === zoneId);
  let deliveryFee = mode === "delivery" ? zone?.fee_aed ?? 0 : 0;
  if (mode === "delivery" && settings.free_delivery_over != null && cart.subtotal >= settings.free_delivery_over) deliveryFee = 0;
  const total = cart.subtotal + deliveryFee;
  const belowMin = mode === "delivery" && zone && cart.subtotal < zone.min_order_aed;

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Please enter your name.";
    if (!isValidPhone(phone)) e.phone = "Please enter a valid WhatsApp number.";
    if (mode === "delivery") {
      if (!zoneId) e.zone = "Please choose your area.";
      if (!address.trim()) e.address = "Please add a delivery address.";
      if (belowMin) e.zone = `Minimum order for this area is ${aed(zone!.min_order_aed)}.`;
    }
    if (!slotDate) e.date = "Please pick a date.";
    if (!slotLabel) e.slot = "Please pick a time slot.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!cart.lines.length || !validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: cart.lines.map((l) => ({
            kind: l.kind,
            itemId: l.itemId,
            sizeId: l.sizeId,
            specialId: l.specialId,
            flavour: l.flavour,
            mix: l.mix,
            qty: l.qty,
          })),
          mode,
          customerName: name.trim(),
          phone: phone.trim(),
          address: mode === "delivery" ? address.trim() : undefined,
          zoneId: mode === "delivery" ? zoneId : undefined,
          slotDate,
          slotLabel,
          notes: notes.trim() || undefined,
          isGift,
          giftRecipient: isGift ? giftRecipient.trim() : undefined,
          giftMessage: isGift ? giftMessage.trim() : undefined,
          paymentMethod: payment,
          whatsappUpdates: waUpdates,
          marketingOptIn: marketing,
          website,
        }),
      });
      const json = (await res.json()) as PlacedOrder & { error?: string; field?: string };
      if (!res.ok) {
        setErrors({ [json.field ?? "form"]: json.error ?? "Something went wrong. Please try again." });
        return;
      }
      setPlaced(json);
      try {
        const recent = JSON.parse(localStorage.getItem("ruhh_recent_orders") ?? "[]") as { ref: string; phone: string }[];
        localStorage.setItem("ruhh_recent_orders", JSON.stringify([{ ref: json.order.ref, phone: phone.trim() }, ...recent].slice(0, 10)));
      } catch {
        /* ignore */
      }
      cart.clear();
      window.open(json.whatsappUrl, "_blank", "noopener");
      window.scrollTo(0, 0);
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    const o = placed.order;
    return (
      <div className="m-slide-up rounded-[16px] border-[1.5px] border-sage-mid bg-sage/40 p-7 text-center">
        <Confetti />
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sage-deep text-on-accent shadow-[0_12px_24px_-12px_rgba(61,107,61,0.8)]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" className="check-draw" />
          </svg>
        </div>
        <h2 className="m-fade-up m-delay-1 mb-1 text-[22px] font-bold">Order {o.ref} placed!</h2>
        <p className="mb-1 text-[13px] leading-[1.6] text-muted">
          {settings.owner_name} has your order for {fmtDate(o.slot_date)}, {o.slot_label}. WhatsApp should have opened with the details ready to send. If it did not, tap the button below.
        </p>
        {o.payment_method === "bank_transfer" && settings.bank_details && (
          <div className="mx-auto my-3 max-w-[380px] rounded-[10px] bg-surface p-3 text-left text-[12px] leading-[1.6] text-ink">
            <div className="label">Bank transfer</div>
            <div className="whitespace-pre-wrap">{settings.bank_details}</div>
          </div>
        )}
        <a href={placed.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-wa mt-3">
          <WhatsAppIcon /> Open WhatsApp to send
        </a>
        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
          <Link href={`/track?ref=${encodeURIComponent(o.ref)}&phone=${encodeURIComponent(o.phone)}`} className="btn-o">
            Track my order
          </Link>
          <Link href="/menu" className="btn-o">
            Order more
          </Link>
        </div>
      </div>
    );
  }

  if (!cart.hydrated) return <div className="p-10 text-center text-[13px] text-muted">Loading your cart…</div>;

  if (!cart.lines.length) {
    return (
      <div className="p-10 text-center">
        <div className="mb-2 text-[40px]">🧁</div>
        <p className="mb-4 text-[13px] leading-[1.6] text-muted">
          Your cart is empty.
          <br />
          Browse {settings.business_name}&apos;s menu and add something with soul!
        </p>
        <Link href="/menu" className="btn-p">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="sec-head">Your cart</h2>
      <div className="mb-4">
        {cart.lines.map((l) => (
          <div key={l.key} className="card m-fade-up mb-2 flex items-center gap-3 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-cream2 text-[22px]">{l.emoji}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold">{l.name}</div>
              {lineDisplay(l) && <div className="text-[11px] text-lav-deep">{lineDisplay(l)}</div>}
              <div className="text-[11px] text-muted">{aed(l.unitPrice)} each</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="qbtn" aria-label="Decrease quantity" onClick={() => cart.setQty(l.key, l.qty - 1)}>
                −
              </button>
              <span className="w-5 text-center text-[13px] font-bold">{l.qty}</span>
              <button className="qbtn" aria-label="Increase quantity" onClick={() => cart.setQty(l.key, Math.min(50, l.qty + 1))}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-[12px] bg-cream2 p-4 text-[12px]">
        {cart.lines.map((l) => (
          <div key={l.key} className="flex justify-between py-0.5">
            <span>
              {l.emoji} {l.name}
              {lineDisplay(l) ? ` (${lineDisplay(l)})` : ""} ×{l.qty}
            </span>
            <span>{aed(l.unitPrice * l.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between py-0.5">
          <span>Delivery</span>
          <span>{mode === "pickup" ? "Free (pickup)" : deliveryFee ? aed(deliveryFee) : zone ? "Free" : "-"}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-line pt-2 text-[14px] font-bold text-rose-deep">
          <span>Total</span>
          <span>{aed(total)}</span>
        </div>
      </div>

      <h2 className="sec-head">Delivery details</h2>
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        {(
          [
            ["delivery", "🚗", "Delivery", "Fee by area"],
            ["pickup", "🏠", "Pickup", "Free"],
          ] as const
        ).map(([m, icon, label, sub]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-[12px] border-[1.5px] bg-surface p-3 text-center transition ${mode === m ? "border-rose-deep bg-rose/40" : "border-line"}`}
          >
            <div className="text-[22px]">{icon}</div>
            <div className="text-[13px] font-bold">{label}</div>
            <div className="text-[11px] text-muted">{sub}</div>
          </button>
        ))}
      </div>

      {mode === "delivery" ? (
        <>
          <Field label="Delivery area" error={errors.zone}>
            <select className={`field ${errors.zone ? "field-err" : ""}`} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}: {aed(z.fee_aed)}
                  {z.min_order_aed ? ` (min ${aed(z.min_order_aed)})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delivery address" error={errors.address}>
            <input className={`field ${errors.address ? "field-err" : ""}`} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building, street, apartment / villa" />
          </Field>
        </>
      ) : (
        settings.pickup_address && <p className="mb-3 rounded-[10px] bg-peach p-3 text-[12px] text-peach-deep">Pickup from: {settings.pickup_address}</p>
      )}

      <Field label="Your name" error={errors.name}>
        <input className={`field ${errors.name ? "field-err" : ""}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoComplete="name" />
      </Field>
      <Field label="WhatsApp number" error={errors.phone}>
        <input className={`field ${errors.phone ? "field-err" : ""}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 000 0000" autoComplete="tel" />
      </Field>

      <h2 className="sec-head mt-4">Pick a date &amp; time</h2>
      {cart.leadHours > 0 && (
        <p className="mb-2 text-[11px] text-muted">Items in your cart need {cart.leadHours} hours notice, so the earliest date is shown first.</p>
      )}
      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dates.map((d) => (
          <button key={d} className={`chip shrink-0 ${slotDate === d ? "chip-sel" : ""}`} onClick={() => setSlotDate(d)}>
            {fmtDate(d)}
          </button>
        ))}
      </div>
      {errors.date && <p className="mb-2 text-[11px] text-danger">{errors.date}</p>}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {settings.slots.map((s) => (
          <button key={s} className={`chip ${slotLabel === s ? "chip-sel" : ""}`} onClick={() => setSlotLabel(s)}>
            {s}
          </button>
        ))}
      </div>

      <Field label="Special requests">
        <textarea className="field min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={`Allergies, dedications, anything for ${settings.owner_name} to know...`} />
      </Field>

      <Toggle on={isGift} onChange={setIsGift} icon="🎁" title="This is a gift" sub="Add a handwritten card and we won't include prices" />
      {isGift && (
        <div className="mb-3 rounded-[12px] border border-line bg-surface p-3">
          <Field label="Recipient's name">
            <input className="field" value={giftRecipient} onChange={(e) => setGiftRecipient(e.target.value)} />
          </Field>
          <Field label="Card message">
            <textarea className="field min-h-[60px]" maxLength={300} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Happy birthday, with love…" />
          </Field>
        </div>
      )}

      <h2 className="sec-head mt-4">Payment</h2>
      <div className="mb-3 grid gap-2">
        {settings.accept_cash && <Radio checked={payment === "cash"} onChange={() => setPayment("cash")} title="Cash on delivery / pickup" sub="Pay when your order arrives" />}
        {settings.accept_bank_transfer && (
          <Radio checked={payment === "bank_transfer"} onChange={() => setPayment("bank_transfer")} title="Bank transfer" sub="Details shared after you order" />
        )}
      </div>

      <h2 className="sec-head mt-4">Notifications</h2>
      <Toggle on={waUpdates} onChange={setWaUpdates} icon="💬" title="WhatsApp updates" sub="Order confirmed, baking, out for delivery" />
      <Toggle on={marketing} onChange={setMarketing} icon="✨" title="Weekly specials" sub={`${settings.owner_name} messages when something new is baking`} />

      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      {settings.tax_note && <p className="mt-1 text-center text-[11px] text-muted">{settings.tax_note}</p>}
      {errors.form && <p className="mb-2 rounded-[10px] bg-danger/10 p-3 text-[12px] text-danger">{errors.form}</p>}
      <button className="btn-wa press mt-4" onClick={submit} disabled={submitting || Boolean(belowMin)}>
        <WhatsAppIcon /> {submitting ? "Placing order…" : `Confirm & send to ${settings.owner_name} on WhatsApp`}
      </button>
      <p className="mt-2 text-center text-[11px] leading-[1.5] text-muted">
        Your order is saved for {settings.owner_name} and WhatsApp opens with the details ready to send.
      </p>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}

function Toggle({ on, onChange, icon, title, sub }: { on: boolean; onChange: (v: boolean) => void; icon: string; title: string; sub: string }) {
  return (
    <div className="card mb-2 flex items-center gap-3 p-3">
      <div className="text-[20px]">{icon}</div>
      <div className="flex-1">
        <div className="text-[13px] font-bold">{title}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-sage-deep" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Radio({ checked, onChange, title, sub }: { checked: boolean; onChange: () => void; title: string; sub: string }) {
  return (
    <label className={`card flex cursor-pointer items-center gap-3 p-3 ${checked ? "border-rose-deep" : ""}`}>
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="accent-rose-deep" />
      <div>
        <div className="text-[13px] font-bold">{title}</div>
        <div className="text-[11px] text-muted">{sub}</div>
      </div>
    </label>
  );
}
