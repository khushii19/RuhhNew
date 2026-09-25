"use client";

import { Photo } from "@/components/photo";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  const a = ACCENT[s.accent] ?? ACCENT.rose;
  return (
    <article className={`lift grid h-full overflow-hidden rounded-[16px] sm:grid-cols-[0.9fr_1.1fr] ${a.bg}`}>
      <div className="relative flex aspect-[4/3] items-center justify-center text-[48px] sm:aspect-auto sm:min-h-[240px]">
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="(max-width: 640px) 100vw, 280px" className="object-cover" /> : s.emoji}
      </div>
      <div className="flex flex-col p-6">
        {s.tag && <span className={`tag mb-3 self-start bg-surface/70 ${a.text}`}>{s.tag}</span>}
        <h3 className="text-[22px] leading-tight">{s.name}</h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink/70">{s.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="flex items-baseline gap-2">
            <span className="font-display text-[22px] text-rose-deep">{aed(s.price_aed)}</span>
            {s.old_price_aed != null && <span className="text-[13px] text-muted line-through">{aed(s.old_price_aed)}</span>}
          </span>
          <button onClick={order} className="btn-p press px-5 py-2.5 text-[13px]" disabled={s.price_aed <= 0}>
            Order now
          </button>
        </div>
      </div>
    </article>
  );
}
