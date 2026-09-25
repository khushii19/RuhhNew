"use client";

import { Photo } from "@/components/photo";
import { useEffect, useState } from "react";
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
      aria-label={`Choose options for ${m.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="m-slide-up relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto rounded-[16px] bg-surface p-6 pt-5">
        <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-[16px] bg-rose-deep" />
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[20px] text-muted hover:bg-cream2">
          ×
        </button>
        <div className="mb-3 flex justify-center">
          <Photo src={m.image_url ?? artUrl} alt={m.name} width={150} height={112} className="h-[112px] w-[150px] rounded-[14px] bg-cream2 object-cover" />
        </div>
        <h3 className="text-center text-[17px] font-bold">{m.name}</h3>
        {m.description && <p className="mb-3 text-center text-[12px] text-muted">{m.description}</p>}

        <div className="mb-3">
          <div className="label">{m.item_sizes.length > 1 ? "Serving size" : "Size"}</div>
          <div className="flex flex-wrap gap-1.5">
            {m.item_sizes.map((s) => (
              <button
                key={s.id}
                className={`chip ${s.id === size.id ? "chip-sel" : ""}`}
                onClick={() => {
                  setSize(s);
                  setMix({});
                }}
              >
                {s.label} <span className="ml-1 text-[11px] opacity-70">{aed(Number(s.price_aed))}</span>
              </button>
            ))}
          </div>
        </div>

        {mixMode ? (
          <div className="mb-3">
            <div className="label">
              Mix your box ·{" "}
              <span className={remaining === 0 ? "text-sage-deep" : "text-rose-deep"}>
                {mixSum} of {size.piece_count} chosen{remaining > 0 ? ` (${remaining} left)` : " ✓"}
              </span>
            </div>
            {flavours.map((f) => (
              <div key={f} className="flex items-center justify-between border-b border-line py-1.5 last:border-0">
                <span className="text-[13px]">{f}</span>
                <div className="flex items-center gap-2">
                  <button className="qbtn" aria-label={`Less ${f}`} onClick={() => changeMix(f, -1)} disabled={!mix[f]}>
                    −
                  </button>
                  <span className="w-5 text-center text-[13px] font-bold">{mix[f] ?? 0}</span>
                  <button className="qbtn" aria-label={`More ${f}`} onClick={() => changeMix(f, 1)} disabled={remaining <= 0}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          flavours.length > 0 && (
            <div className="mb-3">
              <div className="label">Flavour</div>
              <div className="flex flex-wrap gap-1.5">
                {flavours.map((f) => (
                  <button key={f} className={`chip ${f === flavour ? "chip-sel" : ""}`} onClick={() => setFlavour(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        <div className="mb-4">
          <div className="label">{mixMode ? "Number of boxes" : "Quantity"}</div>
          <div className="flex items-center gap-3">
            <button className="qbtn" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="w-6 text-center text-[14px] font-bold">{qty}</span>
            <button className="qbtn" aria-label="Increase" onClick={() => setQty((q) => Math.min(50, q + 1))}>
              +
            </button>
          </div>
        </div>

        <div key={unit * qty} className="m-pop font-display mb-3 text-center text-[22px] font-bold text-rose-deep">{aed(unit * qty)}</div>
        <button className="btn-p press w-full rounded-[10px] py-3" disabled={blocked} onClick={confirm}>
          {unit <= 0 ? "Price on request. Ask on WhatsApp" : mixMode && remaining > 0 ? `Choose ${remaining} more` : "Add to cart"}
        </button>
      </div>
    </div>
  );
}
