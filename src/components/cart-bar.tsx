"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { aed } from "@/lib/format";

/** Floating "View basket" bar on phones, on every page but the basket itself. */
export function CartBar() {
  const path = usePathname();
  const { count, subtotal, hydrated } = useCart();
  if (!hydrated || count === 0 || path.startsWith("/order")) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 md:hidden">
      <Link
        href="/order"
        className="m-slide-up press pointer-events-auto flex w-full max-w-[640px] items-center justify-between rounded-full bg-rose-deep py-3 pl-5 pr-4 text-[13.5px] text-white shadow-[0_16px_32px_-16px_rgba(155,75,107,0.7)] transition hover:brightness-105"
      >
        <span className="font-semibold">View basket</span>
        <span className="price">
          {count} {count === 1 ? "item" : "items"} · {aed(subtotal)}
        </span>
      </Link>
    </div>
  );
}
