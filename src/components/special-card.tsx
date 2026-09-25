"use client";

import { Photo } from "@/components/photo";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";
import type { Special } from "@/lib/types";

/**
 * A featured special. Specials still carry an `accent` in the data, but the
 * storefront no longer tints by it: the options were lavender, sage and
 * peach, which pulled the page off its cream and rose ground.
 */
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

  return (
    <article className="lift grid h-full overflow-hidden rounded-[16px] border border-line bg-surface sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-rose text-[48px] sm:aspect-auto sm:min-h-[260px]">
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="(max-width: 640px) 100vw, 280px" className="object-cover" /> : s.emoji}
      </div>
      <div className="flex flex-col p-6">
        {s.tag && <span className="tag mb-3 self-start bg-rose text-rose-deep">{s.tag}</span>}
        <h3 className="text-[22px] leading-tight">{s.name}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.description}</p>
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
