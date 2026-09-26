"use client";

import { Photo } from "@/components/photo";
import { WhatsAppIcon } from "@/components/icons";
import { itemHasOptions, itemMinPrice, itemUnpriced } from "@/lib/data";
import { aed } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** Pastel grounds that show behind a photo while it loads, as in the first build. */
const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

/**
 * A bake in a menu grid, after the first build's menu card: photo on a
 * pastel tile, name, one line, flavours, price and a round "+". The photo
 * and the text open the item picker; the photo copy is skipped by keyboard
 * and screen readers so each card has one focus stop plus its action.
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
  const flav = m.item_flavours.slice(0, 3).map((f) => f.name).join(" · ") + (m.item_flavours.length > 3 ? " …" : "");
  const unpriced = itemUnpriced(m);
  const soldOut = Boolean(m.is_sold_out);

  return (
    <article className="lift group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-surface">
      <button type="button" tabIndex={-1} aria-hidden onClick={onOpen} className="block w-full">
        <div className={`relative aspect-[4/3] overflow-hidden ${TILE_BG[index % 4]}`}>
          <Photo
            src={m.image_url ?? artUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 260px"
            className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${soldOut ? "opacity-60 grayscale-[35%]" : ""}`}
          />
          {soldOut ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/95 px-2.5 py-1 text-[10.5px] font-semibold text-muted">Sold out</span>
          ) : (
            itemHasOptions(m) &&
            !unpriced && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-surface/95 px-2.5 py-1 text-[10.5px] font-semibold text-rose-deep">options</span>
            )
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <button type="button" onClick={onOpen} className="flex flex-1 flex-col text-left outline-offset-4">
          <span className="font-display text-[15.5px] leading-snug text-ink transition-colors group-hover:text-rose-deep md:text-[17px]">{m.name}</span>
          {m.description && <span className="mt-0.5 line-clamp-1 text-[12.5px] text-muted">{m.description}</span>}
          {flav && <span className="mt-1 line-clamp-1 text-[12px] text-lav-deep">{flav}</span>}
        </button>

        <div className="mt-2.5 flex min-h-10 items-center justify-between gap-2">
          {unpriced ? (
            <>
              <span className="text-[12.5px] text-muted">Price on request</span>
              {askUrl && (
                <a
                  href={askUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ask about ${m.name} on WhatsApp`}
                  className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white transition hover:brightness-110"
                >
                  <WhatsAppIcon />
                </a>
              )}
            </>
          ) : (
            <>
              <span className="price text-[14.5px] font-semibold text-ink">
                {multi && <small className="mr-0.5 text-[11.5px] font-normal text-muted">from</small>} {aed(itemMinPrice(m))}
              </span>
              {!soldOut && (
                <button
                  type="button"
                  aria-label={itemHasOptions(m) ? `Choose options for ${m.name}` : `Add ${m.name} to basket`}
                  onClick={onQuickAdd}
                  className={`press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[20px] leading-none transition ${
                    flashing ? "m-pop bg-sage text-sage-deep" : "bg-rose-deep text-white hover:brightness-110"
                  }`}
                >
                  {flashing ? "✓" : "+"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
