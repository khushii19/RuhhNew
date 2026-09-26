"use client";

import { Photo } from "@/components/photo";
import { useCallback, useState } from "react";
import { Toast } from "@/components/toast";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { Special } from "@/lib/types";

/** Each special carries a pastel accent chosen in admin. */
const ACCENT: Record<string, { bg: string; text: string }> = {
  rose: { bg: "bg-rose", text: "text-rose-deep" },
  lav: { bg: "bg-lav", text: "text-lav-deep" },
  sage: { bg: "bg-sage", text: "text-sage-deep" },
  peach: { bg: "bg-peach", text: "text-peach-deep" },
};

export function SpecialCard({ special: s, leadTimeHours }: { special: Special; leadTimeHours: number }) {
  const { add } = useCart();
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);

  function order() {
    add({
      kind: "special",
      specialId: s.id,
      qty: 1,
      name: s.name,
      emoji: s.emoji,
      image: s.image_url,
      sizeLabel: "",
      unitPrice: s.price_aed,
      leadTimeHours,
    });
    // Stay on the page, like adding from the menu; the basket count and
    // toast confirm it.
    setToast(`${s.name} added`);
  }

  const a = ACCENT[s.accent] ?? ACCENT.rose;
  // A compact strip: square photo, name, price and one action.
  return (
    <article className={`group grid h-full grid-cols-[112px_1fr] overflow-hidden rounded-[14px] sm:grid-cols-[150px_1fr] ${a.bg}`}>
      <div className="relative flex min-h-[124px] items-center justify-center overflow-hidden text-[40px]">
        {s.image_url ? (
          <Photo
            src={s.image_url}
            alt={s.name}
            fill
            sizes="150px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          s.emoji
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-1 p-4 sm:p-5">
        {s.tag && <span className={`text-[10.5px] font-semibold uppercase tracking-[0.2em] ${a.text}`}>{s.tag}</span>}
        <h3 className="truncate text-[19px] leading-tight sm:text-[21px]">{s.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="price text-[15px] font-semibold text-ink">{aed(s.price_aed)}</span>
            {s.old_price_aed != null && <span className="price text-[12.5px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          </span>
          <button
            onClick={order}
            aria-label={`Add ${s.name} to basket`}
            className="btn-p press whitespace-nowrap px-4 py-2 text-[12.5px] font-semibold"
            disabled={s.price_aed <= 0}
          >
            Add
          </button>
        </div>
      </div>
      <Toast message={toast} onDone={clearToast} />
    </article>
  );
}
