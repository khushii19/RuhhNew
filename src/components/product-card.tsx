"use client";

import { Photo } from "@/components/photo";
import { itemHasOptions, itemMinPrice } from "@/lib/data";
import { aed } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** Pastel grounds that show behind a photo while it loads. */
const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

/**
 * A bake in a product grid. The photo and the text both open the product
 * view; the photo copy is skipped by keyboard and screen readers so each
 * card has one focus stop plus its add button (no nested controls).
 */
export function ProductCard({
  item: m,
  index,
  artUrl,
  flashing,
  onOpen,
  onQuickAdd,
  size = "default",
}: {
  item: MenuItem;
  index: number;
  artUrl: string;
  flashing: boolean;
  onOpen: () => void;
  onQuickAdd: () => void;
  size?: "default" | "large";
}) {
  const multi = m.item_sizes.length > 1;
  const flav = m.item_flavours.slice(0, 3).map((f) => f.name).join(", ") + (m.item_flavours.length > 3 ? "…" : "");
  const large = size === "large";
  return (
    <div className="group flex flex-col">
      <div className="relative">
        <button type="button" tabIndex={-1} aria-hidden onClick={onOpen} className="block w-full">
          <div className={`relative aspect-[4/5] overflow-hidden rounded-[14px] ${TILE_BG[index % 4]}`}>
            <Photo
              src={m.image_url ?? artUrl}
              alt=""
              fill
              sizes={large ? "(max-width: 768px) 72vw, 300px" : "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"}
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>
        </button>
        {itemHasOptions(m) ? (
          <button
            type="button"
            aria-label={`Choose options for ${m.name}`}
            onClick={onOpen}
            className="press absolute bottom-3 right-3 rounded-full bg-surface px-3.5 py-1.5 text-[12.5px] font-semibold text-ink shadow-[0_8px_18px_-8px_rgba(44,26,26,0.5)] transition hover:bg-rose-deep hover:text-on-accent md:px-4 md:py-2 md:text-[13px]"
          >
            Choose
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Add ${m.name} to basket`}
            onClick={onQuickAdd}
            className={`press absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full text-[19px] leading-none shadow-[0_8px_18px_-8px_rgba(44,26,26,0.5)] transition ${
              flashing ? "m-pop bg-sage text-sage-deep" : "bg-surface text-ink hover:bg-rose-deep hover:text-on-accent"
            }`}
          >
            {flashing ? "✓" : "+"}
          </button>
        )}
      </div>
      <button type="button" onClick={onOpen} className="mt-3.5 flex flex-1 flex-col rounded-[6px] text-left outline-offset-4">
        <span className={`font-display leading-snug transition-colors group-hover:text-rose-deep ${large ? "text-[18px] md:text-[20px]" : "text-[16.5px] md:text-[18px]"}`}>
          {m.name}
        </span>
        <span className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{m.description}</span>
        {flav && <span className="mt-1 line-clamp-1 text-[12px] text-lav-deep">{flav}</span>}
        <span className="price mt-2 text-[14px] font-semibold text-ink">
          {multi && <span className="font-normal text-muted">From </span>}
          {aed(itemMinPrice(m))}
        </span>
      </button>
    </div>
  );
}
