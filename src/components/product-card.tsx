"use client";

import { Photo } from "@/components/photo";
import { WhatsAppIcon } from "@/components/icons";
import { itemHasOptions, itemMinPrice, itemUnpriced } from "@/lib/data";
import { aed } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** Pastel grounds that show behind a photo while it loads. */
const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

/**
 * A bake in a grid: the photo does the selling, with the name and price
 * underneath and one round action on the photo. Tapping the photo or the
 * name opens the item picker; the photo copy is skipped by keyboard and
 * screen readers so each card has one focus stop plus its action.
 */
export function ProductCard({
  item: m,
  index,
  artUrl,
  flashing,
  askUrl,
  onOpen,
  onQuickAdd,
}: {
  item: MenuItem;
  index: number;
  artUrl: string;
  flashing: boolean;
  /** WhatsApp link for bakes without a price yet. */
  askUrl?: string | null;
  onOpen: () => void;
  onQuickAdd: () => void;
}) {
  const multi = m.item_sizes.length > 1;
  const unpriced = itemUnpriced(m);
  const soldOut = Boolean(m.is_sold_out);
  const action = "press absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full shadow-[0_10px_22px_-10px_rgba(44,26,26,0.55)] transition";

  return (
    <article className="group">
      <div className="relative">
        <button type="button" tabIndex={-1} aria-hidden onClick={onOpen} className="block w-full">
          <div className={`relative aspect-square overflow-hidden rounded-[18px] ${TILE_BG[index % 4]}`}>
            <Photo
              src={m.image_url ?? artUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 260px"
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] ${soldOut ? "opacity-55 grayscale-[40%]" : ""}`}
            />
            {soldOut && <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/95 px-2.5 py-1 text-[11px] font-semibold text-muted">Sold out</span>}
          </div>
        </button>
        {unpriced
          ? askUrl && (
              <a href={askUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${m.name} on WhatsApp`} className={`${action} bg-[#15803d] text-white hover:brightness-110`}>
                <WhatsAppIcon />
              </a>
            )
          : !soldOut && (
              <button
                type="button"
                aria-label={itemHasOptions(m) ? `Choose options for ${m.name}` : `Add ${m.name} to basket`}
                onClick={onQuickAdd}
                className={`${action} text-[22px] leading-none ${flashing ? "m-pop bg-sage-deep text-white" : "bg-surface text-rose-deep hover:bg-rose-deep hover:text-white"}`}
              >
                {flashing ? "✓" : "+"}
              </button>
            )}
      </div>

      <button type="button" onClick={onOpen} className="mt-2.5 block w-full px-0.5 text-left outline-offset-4">
        <span className="line-clamp-2 font-display text-[16px] leading-snug text-ink transition-colors group-hover:text-rose-deep md:text-[17px]">{m.name}</span>
        <span className="price mt-1 block text-[13.5px] text-ink/75">
          {unpriced ? (
            "Price on request"
          ) : (
            <>
              {multi && "From "}
              <span className="font-semibold text-ink">{aed(itemMinPrice(m))}</span>
            </>
          )}
        </span>
      </button>
    </article>
  );
}
