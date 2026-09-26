"use client";

import { Photo } from "@/components/photo";
import { useEffect, useId, useRef, useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { ItemSize, MenuItem } from "@/lib/types";

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
  const [size, setSize] = useState<ItemSize>(m.item_sizes[0]);
  const [flavour, setFlavour] = useState<string>(m.item_flavours[0]?.name ?? "");
  const [mix, setMix] = useState<Record<string, number>>({});
  const [qty, setQty] = useState(1);

  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the dialog so keyboard and screen-reader users land in it.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const flavours = m.item_flavours.map((f) => f.name);
  const mixMode = m.mixable && flavours.length > 0 && size.piece_count > 1;
  const mixSum = Object.values(mix).reduce((a, b) => a + b, 0);
  const remaining = size.piece_count - mixSum;
  const unit = Number(size.price_aed);
  const blocked = (mixMode && mixSum !== size.piece_count) || unit <= 0;

  function changeMix(f: string, d: number) {
    setMix((prev) => {
      const cur = prev[f] ?? 0;
      if (d > 0 && mixSum >= size.piece_count) return prev;
      const next = Math.max(0, cur + d);
      const out = { ...prev };
      if (next === 0) delete out[f];
      else out[f] = next;
      return out;
    });
  }

  function confirm() {
    if (blocked) return;
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

  return (
    <div
      className="m-fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-3 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="m-slide-up relative max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-[18px] bg-surface">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream2">
          <Photo src={m.image_url ?? artUrl} alt={m.name} fill sizes="460px" className="object-cover" />
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-[20px] text-ink shadow-sm backdrop-blur hover:bg-surface"
        >
          ×
        </button>

        <div className="p-6">
          <h2 id={titleId} className="text-[26px] leading-tight">
            {m.name}
          </h2>
          {m.description && <p className="mt-2 text-[15px] leading-relaxed text-muted">{m.description}</p>}
          {m.allergens && (
            <p className="mt-3 flex items-start gap-2 rounded-[10px] bg-peach/60 px-3 py-2 text-[13px] text-peach-deep">
              <Warning size={16} className="mt-0.5 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">Contains:</span> {m.allergens}
              </span>
            </p>
          )}

          {m.item_sizes.length > 1 && (
            <div className="mt-5">
              <div className="label">Size</div>
              <div className="flex flex-wrap gap-2">
                {m.item_sizes.map((s) => (
                  <button
                    key={s.id}
                    className={`chip ${s.id === size.id ? "chip-sel" : ""}`}
                    onClick={() => {
                      setSize(s);
                      setMix({});
                    }}
                  >
                    {s.label} <span className="price ml-1 opacity-70">{aed(Number(s.price_aed))}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mixMode ? (
            <div className="mt-5">
              <div className="label">
                Mix your box ·{" "}
                <span className={remaining === 0 ? "text-sage-deep" : "text-rose-deep"}>
                  {mixSum} of {size.piece_count} chosen{remaining > 0 ? ` (${remaining} left)` : " ✓"}
                </span>
              </div>
              {flavours.map((f) => (
                <div key={f} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                  <span className="text-[14px]">{f}</span>
                  <div className="flex items-center gap-2">
                    <button className="qbtn" aria-label={`Less ${f}`} onClick={() => changeMix(f, -1)} disabled={!mix[f]}>
                      −
                    </button>
                    <span className="w-5 text-center text-[14px] font-semibold">{mix[f] ?? 0}</span>
                    <button className="qbtn" aria-label={`More ${f}`} onClick={() => changeMix(f, 1)} disabled={remaining <= 0}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            flavours.length > 0 && (
              <div className="mt-5">
                <div className="label">Flavour</div>
                <div className="flex flex-wrap gap-2">
                  {flavours.map((f) => (
                    <button key={f} className={`chip ${f === flavour ? "chip-sel" : ""}`} onClick={() => setFlavour(f)}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-line px-1.5 py-1">
              <button className="qbtn border-0" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span className="price w-6 text-center text-[15px] font-semibold" aria-live="polite">
                {qty}
              </span>
              <button className="qbtn border-0" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(50, q + 1))}>
                +
              </button>
            </div>
            <button className="btn-p press flex-1 py-3.5 text-[14.5px] font-semibold" disabled={blocked} onClick={confirm}>
              {unit <= 0 ? (
                "Price on request"
              ) : mixMode && remaining > 0 ? (
                `Choose ${remaining} more`
              ) : (
                <>
                  Add to basket · <span className="price">{aed(unit * qty)}</span>
                </>
              )}
            </button>
          </div>
          {mixMode && <p className="mt-2 text-[12.5px] text-muted">{qty > 1 ? `${qty} boxes` : "1 box"}</p>}
        </div>
      </div>
    </div>
  );
}
