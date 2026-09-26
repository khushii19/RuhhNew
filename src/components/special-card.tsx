"use client";

import { useRouter } from "next/navigation";
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

/** The first build's special card: dashed accent border, pastel image tile, one action. */
export function SpecialCard({ special: s, leadTimeHours }: { special: Special; leadTimeHours: number }) {
  const order = useOrderSpecial(leadTimeHours);
  const a = ACCENT[s.accent] ?? ACCENT.rose;
  return (
    <article className={`flex gap-3.5 rounded-[16px] border-[1.5px] border-dashed bg-surface p-3.5 ${a.border}`}>
      <div className={`relative flex h-[92px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[40px] ${a.bg}`}>
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="92px" className="object-cover" /> : <span aria-hidden>{s.emoji}</span>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[17px] leading-snug">
          {s.name}
          {s.tag && <span className={`tag font-body uppercase tracking-[0.08em] ${a.bg} ${a.text}`}>{s.tag}</span>}
        </h3>
        {s.description && <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{s.description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className={`price text-[15px] font-semibold ${a.text}`}>{aed(s.price_aed)}</span>
          {s.old_price_aed != null && <span className="price text-[12.5px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          <button
            type="button"
            onClick={() => order(s)}
            disabled={s.price_aed <= 0}
            aria-label={`Order ${s.name} now`}
            className={`press ml-auto whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50 ${a.btn}`}
          >
            Order now
          </button>
        </div>
      </div>
    </article>
  );
}
