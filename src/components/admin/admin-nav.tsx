"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Orders", icon: "🧾" },
  { href: "/admin/menu", label: "Menu", icon: "🍪" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/specials", label: "Specials", icon: "✨" },
  { href: "/admin/zones", label: "Delivery areas", icon: "🚗" },
  { href: "/admin/enquiries", label: "Custom cakes", icon: "🎂" },
  { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  { href: "/admin/admins", label: "Admins", icon: "👥" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto md:w-[200px] md:shrink-0 md:flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? path === "/admin" || path.startsWith("/admin/orders") : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-[13px] transition ${active ? "bg-rose font-bold text-rose-deep" : "text-muted hover:bg-surface"}`}
          >
            <span aria-hidden>{l.icon}</span> {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
