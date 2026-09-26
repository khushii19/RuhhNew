"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Basket, Cake, Cookie, House, Truck } from "@phosphor-icons/react";
import { useCart } from "@/components/cart-context";

function isActive(path: string, href: string) {
  return href === "/" ? path === "/" : path.startsWith(href);
}

/** Desktop links. Home is the logo, and the order page is the cart button. */
const DESKTOP_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/custom-cakes", label: "Custom cakes" },
  { href: "/reviews", label: "Reviews" },
  { href: "/track", label: "Track order" },
];

export function DesktopNav() {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-6 md:flex lg:gap-8">
      {DESKTOP_LINKS.map((l) => {
        const active = isActive(path, l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 text-[13.5px] tracking-[0.02em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-rose-deep after:transition-transform ${
              active ? "text-rose-deep after:scale-x-100" : "text-ink/75 after:scale-x-0 hover:text-rose-deep hover:after:scale-x-100"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CartPill() {
  const { count, hydrated } = useCart();
  return (
    <Link
      href="/order"
      className={`press flex shrink-0 items-center gap-2 rounded-full border border-ink/15 py-1.5 pl-3.5 text-[13px] ${hydrated && count > 0 ? "pr-1.5" : "pr-4"} text-ink transition hover:border-rose-deep hover:text-rose-deep`}
      aria-label={`View basket, ${hydrated ? count : 0} ${hydrated && count === 1 ? "item" : "items"}`}
    >
      <Basket size={17} aria-hidden />
      Basket
      {hydrated && count > 0 && (
        <span
          key={count}
          className="price m-bump flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-rose-deep px-1.5 text-[11px] font-bold text-on-accent"
        >
          {count}
        </span>
      )}
    </Link>
  );
}

const TABS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/menu", label: "Menu", Icon: Cookie },
  { href: "/order", label: "Basket", Icon: Basket },
  { href: "/track", label: "Track", Icon: Truck },
  { href: "/custom-cakes", label: "Custom", Icon: Cake },
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
                className={`relative flex flex-col items-center gap-0.5 pb-2 pt-2.5 text-[10.5px] transition-colors ${active ? "text-rose-deep" : "text-muted"}`}
              >
                <Icon size={22} weight={active ? "fill" : "regular"} aria-hidden />
                {label}
                {href === "/order" && hydrated && count > 0 && (
                  <span
                    key={count}
                    className="m-pop absolute left-1/2 top-1 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-deep px-1 text-[9px] font-bold text-on-accent"
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
