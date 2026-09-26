"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Toast, type ToastMessage } from "@/components/toast";
import { Photo } from "@/components/photo";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { Accent, Special } from "@/lib/types";

/** Each special carries a pastel accent chosen in admin (full class names for Tailwind). */
export const ACCENT: Record<Accent, { border: string; bg: string; text: string; btn: string }> = {
  rose: { border: "border-rose-mid", bg: "bg-rose", text: "text-rose-deep", btn: "bg-rose-deep" },
  lav: { border: "border-lav-mid", bg: "bg-lav", text: "text-lav-deep", btn: "bg-lav-deep" },
  sage: { border: "border-sage-mid", bg: "bg-sage", text: "text-sage-deep", btn: "bg-sage-deep" },
  peach: { border: "border-peach-mid", bg: "bg-peach", text: "text-peach-deep", btn: "bg-peach-deep" },
};

/** Adds a special to the basket and goes to the order page. */
export function useOrderSpecial(leadTimeHours: number) {
  const { add } = useCart();
  const router = useRouter();
  return (s: Special) => {
    if (s.price_aed <= 0) return;
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
    router.push("/order");
  };
}

/** A special: dashed accent border, photo, one "Add" that keeps you browsing. */
export function SpecialCard({ special: s, leadTimeHours }: { special: Special; leadTimeHours: number }) {
  const { add } = useCart();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const a = ACCENT[s.accent] ?? ACCENT.rose;

  function addIt() {
    if (s.price_aed <= 0) return;
    add({ kind: "special", specialId: s.id, qty: 1, name: s.name, emoji: s.emoji, image: s.image_url, sizeLabel: "", unitPrice: s.price_aed, leadTimeHours });
    setToast({ text: `Added ${s.name}`, action: { label: "View basket", href: "/order" } });
  }

  return (
    <article className="flex items-center gap-4 rounded-[16px] border border-line bg-surface p-3 pr-4">
      <div className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[40px] md:h-28 md:w-28 ${a.bg}`}>
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="112px" className="object-cover" /> : <span aria-hidden>{s.emoji}</span>}
      </div>
      <div className="min-w-0 flex-1">
        {s.tag && <span className={`mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] ${a.text}`}>{s.tag}</span>}
        <h3 className="text-[18px] leading-snug">{s.name}</h3>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-2">
            <span className="price text-[15px] font-semibold text-ink">{aed(s.price_aed)}</span>
            {s.old_price_aed != null && <span className="price text-[12.5px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          </span>
          <button
            type="button"
            onClick={addIt}
            disabled={s.price_aed <= 0}
            aria-label={`Add ${s.name} to basket`}
            className="btn-o press min-h-10 whitespace-nowrap px-4 py-2 text-[13.5px]"
          >
            Add
          </button>
        </div>
      </div>
      <Toast message={toast} onDone={clearToast} />
    </article>
  );
}
