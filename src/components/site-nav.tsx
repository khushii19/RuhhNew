"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart-context";

const TABS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/custom-cakes", label: "Custom" },
];

export function CartPill() {
  const { count, hydrated } = useCart();
  return (
    <Link href="/order" className="press flex shrink-0 items-center gap-1.5 rounded-full bg-rose-deep px-3.5 py-1.5 text-[12px] text-on-accent" aria-label="View cart">
      Cart
      <span
        key={hydrated ? count : -1}
        className={`flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-on-accent px-1 text-[10px] font-bold text-rose-deep ${hydrated && count > 0 ? "m-bump" : ""}`}
      >
        {hydrated ? count : 0}
      </span>
    </Link>
  );
}

export function NavTabs() {
  const path = usePathname();
  const activeIdx = Math.max(
    0,
    TABS.findIndex((t) => (t.href === "/" ? path === "/" : path.startsWith(t.href))),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelectorAll<HTMLElement>("[role=tab]")[activeIdx];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [activeIdx]);

  return (
    <div ref={listRef} className="relative order-3 flex w-full justify-between gap-0.5" role="tablist">
      {pill && <span aria-hidden className="nav-pill absolute top-0 h-full rounded-full bg-rose" style={{ left: pill.left, width: pill.width }} />}
      {TABS.map((t, i) => (
        <Link
          key={t.href}
          href={t.href}
          role="tab"
          aria-selected={i === activeIdx}
          className={`relative z-10 flex-1 rounded-full px-2 py-1.5 text-center text-[12px] transition-colors ${i === activeIdx ? "font-bold text-rose-deep" : "text-muted hover:text-rose-deep"} ${i === activeIdx && !pill ? "bg-rose" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
