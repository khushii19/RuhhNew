import { Suspense } from "react";
import { MenuBrowser } from "@/components/menu-browser";
import type { Category, MenuItem, Settings } from "@/lib/types";

export function MenuView({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  return (
    <>
      <header className="m-fade-up mb-8 md:mb-12">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">Baked to order</p>
        <h1 className="text-[40px] leading-[1.05] tracking-[-0.02em] md:text-[56px]">The menu</h1>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted md:text-[16px]">
          Pick a treat and a size. Everything is baked fresh for the date you choose.
        </p>
      </header>
      <Suspense fallback={null}>
        <MenuBrowser items={items} categories={categories} settings={settings} />
      </Suspense>
    </>
  );
}
