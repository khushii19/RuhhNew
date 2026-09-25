"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";

/** Sticky "view cart" bar shown at the bottom of the menu once something is in the cart. */
export function CartBar() {
  const { count, subtotal, hydrated } = useCart();
  if (!hydrated || count === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 md:bottom-6 flex justify-center px-4">
      <Link
        href="/order"
        className="m-slide-up press pointer-events-auto flex w-full max-w-[640px] items-center justify-between rounded-full bg-rose-deep py-3 pl-5 pr-4 text-on-accent shadow-[0_16px_32px_-16px_rgba(155,75,107,0.7)] transition hover:brightness-105"
      >
        <span className="flex items-center gap-2 text-[13px]">
          <span key={count} className="m-pop flex h-6 min-w-6 items-center justify-center rounded-full bg-on-accent px-1.5 text-[11px] font-bold text-rose-deep">
            {count}
          </span>
          {count === 1 ? "item" : "items"} in your box
        </span>
        <span className="flex items-center gap-2 text-[13px] font-bold">
          {aed(subtotal)} <span aria-hidden>→</span>
        </span>
      </Link>
    </div>
  );
}
