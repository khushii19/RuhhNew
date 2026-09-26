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
  return (
    <article className={`group grid h-full overflow-hidden rounded-[14px] sm:grid-cols-[1.05fr_0.95fr] ${a.bg}`}>
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden text-[48px] sm:aspect-auto sm:min-h-[300px]">
        {s.image_url ? (
          <Photo
            src={s.image_url}
            alt={s.name}
            fill
            sizes="(max-width: 640px) 100vw, 320px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          s.emoji
        )}
      </div>
      <div className="flex flex-col p-6 md:p-8">
        {s.tag && <span className={`mb-4 self-start text-[11px] font-semibold uppercase tracking-[0.2em] ${a.text}`}>{s.tag}</span>}
        <h3 className="text-[24px] leading-tight md:text-[26px]">{s.name}</h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-4 pt-7">
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="price font-display text-[22px] text-ink">{aed(s.price_aed)}</span>
            {s.old_price_aed != null && <span className="text-[13px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          </span>
          <button onClick={order} className="btn-p press whitespace-nowrap px-5 py-2.5 text-[13px] font-semibold" disabled={s.price_aed <= 0}>
            Add to basket
          </button>
        </div>
      </div>
      <Toast message={toast} onDone={clearToast} />
    </article>
  );
}
