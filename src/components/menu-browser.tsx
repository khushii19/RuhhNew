"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CartBar } from "@/components/cart-bar";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { ProductCard } from "@/components/product-card";
import { QuickAddLayer, useQuickAdd } from "@/components/use-quick-add";
import { categoryArt } from "@/lib/category-art";
import type { Category, MenuItem, Settings } from "@/lib/types";

export function MenuBrowser({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  const params = useSearchParams();
  const initialCat = params.get("cat");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(initialCat && categories.some((c) => c.id === initialCat) ? initialCat : "all");
  // /menu?item=<id> (from the home page) opens that bake's product view.
  const shop = useQuickAdd(
    categories,
    settings,
    items.find((m) => m.id === params.get("item")) ?? null,
  );
  const { catName } = shop;

  const usedCats = categories.filter((c) => items.some((i) => i.category_id === c.id));

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((m) => {
      if (cat !== "all" && m.category_id !== cat) return false;
      if (!ql) return true;
      return (
        m.name.toLowerCase().includes(ql) ||
        m.description.toLowerCase().includes(ql) ||
        m.item_flavours.some((f) => f.name.toLowerCase().includes(ql))
      );
    });
  }, [items, q, cat]);

  const current = cat === "all" ? "Everything" : catName(cat) ?? "Everything";
  const countFor = (id: string) => items.filter((m) => m.category_id === id).length;

  // Nothing listed (or the database is unreachable): no filters to show.
  if (items.length === 0) return <MenuUnavailable ownerName={settings.owner_name} whatsappNumber={settings.whatsapp_number} />;

  return (
    <>
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-12">
        {/* Filters: chips on phones, a sticky rail on desktop. */}
        <aside className="mb-6 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
          <label className="relative block">
            <span className="sr-only">Search menu</span>
            <MagnifyingGlass size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search the menu"
              className="field rounded-full py-3 pl-10 pr-4 text-[14px]"
            />
          </label>

          <div className="-mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
            <button className={`chip shrink-0 ${cat === "all" ? "chip-sel" : ""}`} onClick={() => setCat("all")}>
              All
            </button>
            {usedCats.map((c) => (
              <button key={c.id} className={`chip shrink-0 ${cat === c.id ? "chip-sel" : ""}`} onClick={() => setCat(c.id)}>
                {c.name}
              </button>
            ))}
          </div>

          <nav aria-label="Categories" className="mt-6 hidden flex-col gap-1 lg:flex">
            {[{ id: "all", name: "Everything", n: items.length }, ...usedCats.map((c) => ({ id: c.id, name: c.name, n: countFor(c.id) }))].map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                aria-current={cat === c.id ? "true" : undefined}
                className={`flex items-center justify-between rounded-[10px] px-3.5 py-2.5 text-left text-[14px] transition-colors ${
                  cat === c.id ? "bg-rose font-semibold text-rose-deep" : "text-ink/80 hover:bg-rose/50 hover:text-rose-deep"
                }`}
              >
                {c.name}
                <span className={`text-[12px] ${cat === c.id ? "text-rose-deep" : "text-muted"}`}>{c.n}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="text-[22px] leading-tight md:text-[26px]">{q.trim() ? `Results for \u201c${q.trim()}\u201d` : current}</h2>
            <span className="shrink-0 text-[13px] text-muted">
              {list.length} {list.length === 1 ? "bake" : "bakes"}
            </span>
          </div>

          {list.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-line px-6 py-14 text-center">
              <p className="text-[15px] text-ink">Nothing matches that search.</p>
              <button
                className="btn-o mt-4"
                onClick={() => {
                  setQ("");
                  setCat("all");
                }}
              >
                Show everything
              </button>
            </div>
          ) : (
            <div key={`${cat}-${q}`} className="m-stagger mb-20 grid grid-cols-2 gap-x-4 gap-y-9 md:mb-0 md:grid-cols-3 md:gap-x-6 md:gap-y-12">
              {list.map((m, i) => (
                <div key={m.id} style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
                  <ProductCard
                    item={m}
                    index={i}
                    artUrl={categoryArt(catName(m.category_id))}
                    flashing={shop.flash === m.id}
                    onOpen={() => shop.setPicking(m)}
                    onQuickAdd={() => shop.quickAdd(m)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <QuickAddLayer shop={shop} categories={categories} settings={settings} />
      <CartBar />
    </>
  );
}
