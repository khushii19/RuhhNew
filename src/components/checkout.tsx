"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useCart } from "@/components/cart-context";
import { WhatsAppIcon } from "@/components/icons";
import { Photo } from "@/components/photo";
import { Basket, ChatCircleDots, Gift, Moped, Sparkle, Storefront } from "@phosphor-icons/react";
import { Toast, type ToastMessage } from "@/components/toast";
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
  // No area preselected: a default would quietly price delivery for a zone
  // the customer may not live in.
  const [zoneId, setZoneId] = useState("");
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
  // Marketing is opt-in; order updates are transactional and stay on.
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  const dates = useMemo(() => availableDates(cart.leadHours, settings, 14), [cart.leadHours, settings]);
  // If the cart's lead time pushes the chosen date out of range, fall back to the earliest allowed date.
  const slotDate = dates.includes(pickedDate) ? pickedDate : dates[0] ?? "";

  const zone = zones.find((z) => z.id === zoneId);
  let deliveryFee = mode === "delivery" ? zone?.fee_aed ?? 0 : 0;
  if (mode === "delivery" && settings.free_delivery_over != null && cart.subtotal >= settings.free_delivery_over) deliveryFee = 0;
  const total = cart.subtotal + deliveryFee;
  const belowMin = mode === "delivery" && zone && cart.subtotal < zone.min_order_aed;

  function computeErrors() {
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
    return e;
  }

  function validate() {
    const e = computeErrors();
    setErrors(e);
    const ok = Object.keys(e).length === 0;
    if (!ok) {
      // Bring the first problem into view once the messages have rendered.
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"]');
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        el?.focus({ preventScroll: true });
      });
    }
    return ok;
  }

  /** Checks one field when the customer leaves it. */
  function check(field: string) {
    const msg = computeErrors()[field];
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  }

  /** "−" at one takes the line out, with a moment to undo it. */
  function decrease(l: CartLine, index: number) {
    if (l.qty > 1) {
      cart.setQty(l.key, l.qty - 1);
      return;
    }
    cart.remove(l.key);
    setToast({ text: `Removed ${l.name}`, action: { label: "Undo", onClick: () => cart.restore(l, index) } });
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
      <div className="m-slide-up rounded-[16px] border-[1.5px] border-sage-mid bg-sage p-7 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-sage-deep text-white shadow-[0_12px_24px_-12px_rgba(61,107,61,0.8)]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12l5 5L20 7" className="check-draw" />
          </svg>
        </div>
        <h2 className="m-fade-up m-delay-1 text-[26px] text-sage-deep">Thank you!</h2>
        <p className="mx-auto mt-2 max-w-[44ch] text-[14.5px] leading-relaxed text-ink/80">
          Order <strong className="price">{o.ref}</strong> is ready in WhatsApp &mdash; just press send to deliver it to {settings.owner_name}.
        </p>
        <p className="mt-1 text-[13px] text-sage-deep">
          {o.mode === "delivery" ? "Delivery" : "Pickup"} · {fmtDate(o.slot_date)} · {o.slot_label}
        </p>
        {o.payment_method === "bank_transfer" && settings.bank_details && (
          <div className="mx-auto mt-4 max-w-[380px] rounded-[10px] bg-surface p-3 text-left text-[12.5px] leading-[1.6] text-ink">
            <div className="label">Bank transfer</div>
            <div className="whitespace-pre-wrap">{settings.bank_details}</div>
          </div>
        )}
        <a href={placed.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-wa mt-5">
          <WhatsAppIcon /> Open WhatsApp again
        </a>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <Link href={`/track?ref=${encodeURIComponent(o.ref)}&phone=${encodeURIComponent(o.phone)}`} className="btn-o py-3 text-[13.5px]">
            Track this order
          </Link>
          <Link href="/menu" className="btn-o py-3 text-[13.5px]">
            Order more
          </Link>
        </div>
      </div>
    );
  }

  if (!cart.hydrated) return <div className="p-10 text-center text-[13px] text-muted">Loading your cart…</div>;

  if (!cart.lines.length) {
    return (
      <div className="rounded-[16px] border-[1.5px] border-dashed border-rose-mid/70 bg-surface px-6 py-14 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose text-rose-deep">
          <Basket size={30} aria-hidden />
        </span>
        <p className="mt-4 font-display text-[22px]">Your basket is empty</p>
        <p className="mx-auto mt-2 max-w-[36ch] text-[14.5px] leading-relaxed text-muted">
          Browse {settings.business_name}&rsquo;s menu and add something with soul!
        </p>
        <Link href="/menu" className="btn-p press mt-6 px-7 py-3.5 text-[14.5px] font-semibold">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="card mb-3 divide-y divide-line overflow-hidden">
        {cart.lines.map((l, i) => (
          <li key={l.key} className="flex gap-3.5 p-3.5">
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-rose text-[26px]">
              {l.image ? <Photo src={l.image} alt="" fill sizes="72px" className="object-cover" /> : l.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-[16px] leading-snug">{l.name}</div>
              {lineDisplay(l) && <div className="mt-0.5 text-[12.5px] leading-snug text-lav-deep">{lineDisplay(l)}</div>}
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="price text-[14px] font-semibold">{aed(l.unitPrice * l.qty)}</span>
                <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-[17px] text-rose-deep hover:bg-rose" aria-label={l.qty > 1 ? `Fewer ${l.name}` : `Remove ${l.name}`} onClick={() => decrease(l, i)}>
                    −
                  </button>
                  <span className="price w-6 text-center text-[14px] font-semibold">{l.qty}</span>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full text-[17px] text-rose-deep hover:bg-rose" aria-label={`More ${l.name}`} onClick={() => cart.setQty(l.key, Math.min(50, l.qty + 1))}>
                    +
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/menu" className="inline-flex text-[13.5px] font-semibold text-rose-deep underline-offset-4 hover:underline">
        + Add more treats
      </Link>

      <Step n={1} title="Delivery or pickup" />
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        {(
          [
            ["delivery", Moped, "Delivery", "Across Dubai, fee by area"],
            ["pickup", Storefront, "Pickup", "Free, from our kitchen"],
          ] as const
        ).map(([m, Icon, label, sub]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`flex flex-col items-start rounded-[12px] border p-4 text-left transition-colors ${mode === m ? "border-rose-deep bg-rose/40 ring-1 ring-rose-deep" : "border-ink/15 bg-surface hover:border-rose-deep"}`}
          >
            <Icon size={24} weight={mode === m ? "fill" : "regular"} className={mode === m ? "text-rose-deep" : "text-ink/60"} aria-hidden />
            <div className="mt-2 text-[14.5px] font-semibold">{label}</div>
            <div className="text-[12.5px] text-ink/60">{sub}</div>
          </button>
        ))}
      </div>

      {mode === "delivery" ? (
        <>
          <Field label="Delivery area" error={errors.zone}>
            <select
              className={`field ${errors.zone ? "field-err" : ""}`}
              aria-invalid={Boolean(errors.zone)}
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              onBlur={() => check("zone")}
            >
              <option value="" disabled>
                Choose your area
              </option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}: {aed(z.fee_aed)}
                  {z.min_order_aed ? ` (min ${aed(z.min_order_aed)})` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delivery address" error={errors.address}>
            <input
              className={`field ${errors.address ? "field-err" : ""}`}
              aria-invalid={Boolean(errors.address)}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onBlur={() => check("address")}
              placeholder="Building, street, area — Dubai"
              autoComplete="street-address"
            />
          </Field>
        </>
      ) : (
        <p className="mb-4 rounded-[10px] bg-lav p-3 text-[12.5px] text-lav-deep">
          Pickup from {settings.pickup_address || `${settings.owner_name}’s kitchen`} · the exact address comes on WhatsApp.
        </p>
      )}

      <Step n={2} title="Your details" />
      <Field label="Your name" error={errors.name}>
        <input
          className={`field ${errors.name ? "field-err" : ""}`}
          aria-invalid={Boolean(errors.name)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => check("name")}
          placeholder="Full name"
          autoComplete="name"
        />
      </Field>
      <Field label="WhatsApp number" error={errors.phone}>
        <input
          className={`field ${errors.phone ? "field-err" : ""}`}
          aria-invalid={Boolean(errors.phone)}
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => check("phone")}
          placeholder="+971 50 000 0000"
          autoComplete="tel"
        />
      </Field>

      <Step n={3} title="Date & time" />
      {cart.leadHours > 0 && (
        <p className="mb-2.5 text-[12.5px] text-muted">Baked fresh, so orders need {cart.leadHours} hours&rsquo; notice.</p>
      )}
      {/* The right-edge fade signals that more dates scroll into view. */}
      <div className="relative mb-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dates.map((d) => (
            <button key={d} type="button" aria-pressed={slotDate === d} className={`chip shrink-0 ${slotDate === d ? "chip-sel" : ""}`} onClick={() => setSlotDate(d)}>
              {fmtDate(d)}
            </button>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-cream to-transparent" />
      </div>
      {errors.date && (
        <p data-error="true" tabIndex={-1} className="mb-2 text-[12.5px] text-danger">
          {errors.date}
        </p>
      )}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {settings.slots.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={slotLabel === s}
            className={`chip ${slotLabel === s ? "border-lav-deep bg-lav font-bold text-lav-deep" : ""}`}
            onClick={() => setSlotLabel(s)}
          >
            {s}
          </button>
        ))}
      </div>
      {errors.slot && (
        <p data-error="true" tabIndex={-1} className="mb-2 text-[12.5px] text-danger">
          {errors.slot}
        </p>
      )}

      <Step n={4} title="Anything else?" />
      <Field label="Special requests">
        <textarea className="field min-h-[76px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={`Allergies, dedications, anything for ${settings.owner_name} to know\u2026`} />
      </Field>
      <div className="card divide-y divide-line">
        <Toggle on={isGift} onChange={setIsGift} icon={<Gift size={21} aria-hidden />} title="This is a gift" sub="A handwritten card, no prices inside" />
        {isGift && (
          <div className="px-4 pb-1 pt-4">
            <Field label="Recipient's name">
              <input className="field" value={giftRecipient} onChange={(e) => setGiftRecipient(e.target.value)} />
            </Field>
            <Field label="Card message">
              <textarea className="field min-h-[60px]" maxLength={300} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Happy birthday, with love…" />
            </Field>
          </div>
        )}
        <Toggle on={waUpdates} onChange={setWaUpdates} icon={<ChatCircleDots size={21} aria-hidden />} title="Order updates on WhatsApp" sub="Confirmed, baking, on the way" />
        <Toggle on={marketing} onChange={setMarketing} icon={<Sparkle size={21} aria-hidden />} title="Weekly specials" sub="One message on Thursdays" />
      </div>

      <Step n={5} title="Payment" />
      <div role="radiogroup" aria-label="Payment" className="card mb-8 divide-y divide-line">
        {settings.accept_cash && <Radio checked={payment === "cash"} onChange={() => setPayment("cash")} title="Cash on delivery or pickup" sub="Pay when your order arrives" />}
        {settings.accept_bank_transfer && <Radio checked={payment === "bank_transfer"} onChange={() => setPayment("bank_transfer")} title="Bank transfer" sub="Details come after you order" />}
      </div>

      <div className="mb-2 rounded-[16px] border-[1.5px] border-dashed border-rose-mid bg-rose/50 p-5 text-[14px] text-rose-deep">
        <div className="flex justify-between py-0.5">
          <span>
            Subtotal · {cart.count} {cart.count === 1 ? "item" : "items"}
          </span>
          <span className="price">{aed(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between py-0.5">
          <span>{mode === "pickup" ? "Pickup" : "Delivery"}</span>
          <span className="price">{mode === "pickup" ? "Free" : deliveryFee ? aed(deliveryFee) : zone ? "Free" : "Choose your area"}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-dashed border-rose-mid pt-3 text-[17px] font-semibold text-ink">
          <span>Total</span>
          <span className="price">{aed(total)}</span>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      {settings.tax_note && <p className="mt-1 text-center text-[11px] text-muted">{settings.tax_note}</p>}
      {errors.form && (
        <p data-error="true" tabIndex={-1} role="alert" className="mb-2 rounded-[10px] bg-danger/10 p-3 text-[12.5px] text-danger">
          {errors.form}
        </p>
      )}
      {/* Stays in reach above the tab bar while the form scrolls. */}
      <div className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 -mx-4 bg-gradient-to-t from-cream via-cream to-transparent px-4 pb-3 pt-5 md:bottom-0 md:mx-0 md:px-0">
        <button type="button" className="btn-p press w-full py-4 text-[15px] font-semibold shadow-[0_14px_30px_-14px_rgba(155,75,107,0.7)]" onClick={submit} disabled={submitting || Boolean(belowMin)} aria-busy={submitting}>
          <WhatsAppIcon /> {submitting ? "Saving your order…" : `Send order to ${settings.owner_name} · ${aed(total)}`}
        </button>
      </div>
      <Toast message={toast} onDone={clearToast} />
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {/* Wrapping the control ties the label to it for screen readers. */}
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {error && <p className="mt-1.5 text-[12.5px] text-danger">{error}</p>}
    </div>
  );
}

function Toggle({ on, onChange, icon, title, sub }: { on: boolean; onChange: (v: boolean) => void; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5">
      <div className="text-rose-deep">{icon}</div>
      <div className="flex-1">
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted">{sub}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={() => onChange(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-sage-deep" : "bg-ink/15"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function Radio({ checked, onChange, title, sub }: { checked: boolean; onChange: () => void; title: string; sub: string }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3.5 px-4 py-3.5 transition-colors ${checked ? "bg-rose/40" : ""}`}>
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="h-4 w-4 accent-rose-deep" />
      <div>
        <div className="text-[14px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-muted">{sub}</div>
      </div>
    </label>
  );
}

/** A numbered checkout step heading. */
function Step({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="mb-4 mt-10 flex items-center gap-3 text-[21px] leading-tight md:text-[23px]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose font-body text-[14px] font-semibold text-rose-deep">{n}</span>
      {title}
    </h2>
  );
}
