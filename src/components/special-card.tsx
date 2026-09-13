"use client";

import { Photo } from "@/components/photo";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { Special } from "@/lib/types";

const ACCENT = {
  rose: { bg: "bg-rose", text: "text-rose-deep" },
  lav: { bg: "bg-lav", text: "text-lav-deep" },
  sage: { bg: "bg-sage", text: "text-sage-deep" },
  peach: { bg: "bg-peach", text: "text-peach-deep" },
};

export function SpecialCard({ special: s, leadTimeHours }: { special: Special; leadTimeHours: number }) {
  const { add } = useCart();
  const router = useRouter();
  const a = ACCENT[s.accent] ?? ACCENT.rose;

  function order() {
    add({
      kind: "special",
      specialId: s.id,
      qty: 1,
      name: s.name,
      emoji: s.emoji,
      sizeLabel: "",
      unitPrice: s.price_aed,
      leadTimeHours,
    });
    router.push("/order");
  }

  return (
    <div className="lift mb-3.5 flex items-center gap-4 rounded-[16px] border border-line bg-surface p-4">
      <div className={`relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] text-[30px] ${a.bg}`}>
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="72px" className="object-cover" /> : s.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-0.5 text-[15px]">
          {s.name}
          {s.tag && <span className={`tag ml-1.5 ${a.bg} ${a.text}`}>{s.tag}</span>}
        </h3>
        <p className="mb-2 text-[12px] leading-[1.6] text-muted">{s.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[17px] text-rose-deep">{aed(s.price_aed)}</span>
          {s.old_price_aed != null && <span className="text-[12px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          <button onClick={order} className="btn-p press ml-auto px-3.5 py-1.5 text-[11.5px]" disabled={s.price_aed <= 0}>
            Order now
          </button>
        </div>
      </div>
    </div>
  );
}
