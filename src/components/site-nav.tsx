"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Basket, Cake, Cookie, House, Truck } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-context";

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

const DESKTOP_TABS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/order", label: "Order" },
  { href: "/track", label: "Track" },
  { href: "/custom-cakes", label: "Custom cakes" },
  { href: "/reviews", label: "Reviews" },
];

/** The first build's tab row under the header; phones use the bottom bar. */
export function DesktopTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="mx-auto flex max-w-[1080px] items-center gap-7 px-6">
        {DESKTOP_TABS.map((t) => {
          const active = isActive(path, t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px block border-b-2 pb-3 pt-1 text-[14px] transition-colors ${
                  active ? "border-rose-deep font-semibold text-ink" : "border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function CartPill() {
  const { count, hydrated } = useCart();
  const n = hydrated ? count : 0;
  return (
    <Link
      href="/order"
      className="press flex shrink-0 items-center gap-2 rounded-[12px] border border-ink/15 py-2 pl-3 pr-2 text-[14px] font-semibold text-ink transition-colors hover:border-rose-deep hover:text-rose-deep"
      aria-label={`View basket, ${n} ${n === 1 ? "item" : "items"}`}
    >
      <Basket size={17} weight="bold" aria-hidden />
      Basket
      <span
        key={n}
        aria-live="polite"
        className={`price flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11.5px] font-bold ${n > 0 ? "m-bump bg-rose-deep text-white" : "bg-cream2 text-muted"}`}
      >
        {n}
      </span>
    </Link>
  );
}

const TABS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/menu", label: "Menu", Icon: Cookie },
  { href: "/order", label: "Order", Icon: Basket },
  { href: "/track", label: "Track", Icon: Truck },
  { href: "/custom-cakes", label: "Cakes", Icon: Cake },
];

/**
 * Phone navigation. Ordering is a thumb task, so on small screens the
 * sections live in a bottom bar rather than a second header row.
 */
export function MobileTabBar() {
  const path = usePathname();
  const { count, hydrated } = useCart();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(path, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] transition-colors ${active ? "font-semibold text-rose-deep" : "text-ink/55"}`}
              >
                <Icon size={23} weight={active ? "fill" : "regular"} aria-hidden />
                {label}
                {href === "/order" && hydrated && count > 0 && (
                  <span
                    key={count}
                    className="m-pop absolute left-1/2 top-1 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-deep px-1 text-[9px] font-bold text-white"
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
