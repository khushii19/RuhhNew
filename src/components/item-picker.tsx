"use client";

import { useId, useState } from "react";
import { Photo } from "@/components/photo";
import { Sheet } from "@/components/sheet";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { ItemSize, MenuItem } from "@/lib/types";

/**
 * The first build's item picker: size first (it decides whether the box
 * can be mixed), then flavours or the mix-your-box counter, then quantity.
 */
export function ItemPicker({
  item: m,
  artUrl,
  leadTimeHours,
  onClose,
  onAdded,
}: {
  item: MenuItem;
  artUrl: string;
  leadTimeHours: number;
  onClose: () => void;
  onAdded?: (name: string) => void;
}) {
  const { add } = useCart();
  const [size, setSize] = useState<ItemSize | undefined>(m.item_sizes[0]);
  const [flavour, setFlavour] = useState<string>(m.item_flavours[0]?.name ?? "");
  const [mix, setMix] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);
  const titleId = useId();

  const flavours = m.item_flavours.map((f) => f.name);
  const pieces = size?.piece_count ?? 1;
  const mixMode = m.mixable && flavours.length > 0 && pieces > 1;
  const mixSum = Object.values(mix).reduce((a, b) => a + b, 0);
  const remaining = pieces - mixSum;
  const unit = Number(size?.price_aed ?? 0);
  const soldOut = Boolean(m.is_sold_out);
  const blocked = !size || soldOut || unit <= 0 || (mixMode && remaining !== 0);

  function changeMix(f: string, d: number) {
    setMix((prev) => {
      const sum = Object.values(prev).reduce((a, b) => a + b, 0);
      if (d > 0 && sum >= pieces) return prev;
      const next = Math.max(0, (prev[f] ?? 0) + d);
      const out = { ...prev };
      if (next === 0) delete out[f];
      else out[f] = next;
      return out;
    });
  }

  function confirm() {
    if (blocked || !size) return;
    add({
      kind: "item",
      itemId: m.id,
      sizeId: size.id,
      flavour: mixMode ? undefined : flavour || undefined,
      mix: mixMode ? mix : undefined,
      qty,
      name: m.name,
      emoji: m.emoji,
      image: m.image_url,
      sizeLabel: size.label,
      unitPrice: unit,
      leadTimeHours,
    });
    onAdded?.(m.name);
    onClose();
  }

  const label = soldOut
    ? "Sold out"
    : unit <= 0
      ? "Price on request"
      : mixMode && remaining > 0
        ? `Choose ${remaining} more`
        : "Add to basket";

  return (
    <Sheet
      labelledBy={titleId}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-4">
          <div className="min-w-[84px]">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Total</div>
            <div className="price text-[20px] font-semibold text-ink">{unit > 0 ? aed(unit * qty) : "—"}</div>
          </div>
          <button type="button" className="btn-p press flex-1 py-3.5 text-[15px] font-semibold" disabled={blocked} onClick={confirm}>
            {label}
          </button>
        </div>
      }
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream2">
        <Photo src={m.image_url ?? artUrl} alt={m.name} fill sizes="480px" className="object-cover" />
      </div>

      <div className="px-5 pb-6 pt-5">
        <h2 id={titleId} className="text-[24px] leading-tight">
          {m.name}
        </h2>
        {m.description && <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{m.description}</p>}

        {m.item_sizes.length > 0 && (
          <Group label={m.item_sizes.length > 1 ? "Serving size" : "Size"}>
            <div className="flex flex-wrap gap-2">
              {m.item_sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={s.id === size?.id}
                  className={`chip ${s.id === size?.id ? "chip-sel" : ""}`}
                  onClick={() => {
                    setSize(s);
                    setMix({});
                  }}
                >
                  {s.label}
                  {Number(s.price_aed) > 0 && <span className="price ml-1.5 font-normal opacity-75">· {aed(Number(s.price_aed))}</span>}
                </button>
              ))}
            </div>
          </Group>
        )}

        {mixMode ? (
          <Group
            label={
              <>
                Mix your box ·{" "}
                <span className={remaining === 0 ? "text-sage-deep" : "text-rose-deep"} aria-live="polite">
                  {mixSum} of {pieces} chosen{remaining > 0 ? ` (${remaining} left)` : " ✓"}
                </span>
              </>
            }
          >
            <div className="rounded-[10px] border border-line px-3">
              {flavours.map((f) => (
                <div key={f} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-0">
                  <span className="text-[14.5px]">{f}</span>
                  <Stepper
                    value={mix[f] ?? 0}
                    onLess={() => changeMix(f, -1)}
                    onMore={() => changeMix(f, 1)}
                    lessDisabled={!mix[f]}
                    moreDisabled={remaining <= 0}
                    name={f}
                  />
                </div>
              ))}
            </div>
          </Group>
        ) : (
          flavours.length > 0 && (
            <Group label="Flavour">
              <div className="flex flex-wrap gap-2">
                {flavours.map((f) => (
                  <button key={f} type="button" aria-pressed={f === flavour} className={`chip ${f === flavour ? "chip-sel" : ""}`} onClick={() => setFlavour(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </Group>
          )
        )}

        <Group label={mixMode ? "Number of boxes" : "Quantity"}>
          <Stepper
            value={qty}
            onLess={() => setQty((q) => Math.max(1, q - 1))}
            onMore={() => setQty((q) => Math.min(50, q + 1))}
            lessDisabled={qty <= 1}
            moreDisabled={qty >= 50}
            name="quantity"
            large
          />
        </Group>
      </div>
    </Sheet>
  );
}

function Group({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</div>
      {children}
    </div>
  );
}

export function Stepper({
  value,
  onLess,
  onMore,
  lessDisabled,
  moreDisabled,
  name,
  large = false,
}: {
  value: number;
  onLess: () => void;
  onMore: () => void;
  lessDisabled?: boolean;
  moreDisabled?: boolean;
  name: string;
  large?: boolean;
}) {
  const btn = `flex items-center justify-center rounded-full border border-line bg-surface leading-none text-rose-deep transition hover:bg-rose disabled:opacity-35 disabled:hover:bg-surface ${
    large ? "h-11 w-11 text-[20px]" : "h-9 w-9 text-[17px]"
  }`;
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} aria-label={`Less ${name}`} onClick={onLess} disabled={lessDisabled}>
        −
      </button>
      <span className={`price text-center font-semibold ${large ? "w-8 text-[17px]" : "w-6 text-[15px]"}`}>{value}</span>
      <button type="button" className={btn} aria-label={`More ${name}`} onClick={onMore} disabled={moreDisabled}>
        +
      </button>
    </div>
  );
}
