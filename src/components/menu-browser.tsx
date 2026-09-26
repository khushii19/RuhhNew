"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { ProductCard } from "@/components/product-card";
import { QuickAddLayer, useQuickAdd } from "@/components/use-quick-add";
import { categoryArt } from "@/lib/category-art";
import { waLink } from "@/lib/format";
import type { Category, MenuItem, Settings } from "@/lib/types";

export function MenuBrowser({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  const params = useSearchParams();
  const initialCat = params.get("cat");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(initialCat && categories.some((c) => c.id === initialCat) ? initialCat : "all");
  // /menu?item=<id> (from the home page) opens that bake's item picker.
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

  // Nothing listed (or the database is unreachable): no filters to show.
  if (items.length === 0) return <MenuUnavailable ownerName={settings.owner_name} whatsappNumber={settings.whatsapp_number} />;

  const ask = (m: MenuItem) =>
    settings.whatsapp_number ? waLink(settings.whatsapp_number, `Hi ${settings.owner_name}! Could you tell me the price for ${m.name}?`) : null;

  return (
    <>
      {/* Search and category chips stay under the header while scrolling. */}
      <div className="sticky top-16 z-30 -mx-4 mb-5 bg-cream/95 px-4 pb-3 pt-2 backdrop-blur md:top-[102px] md:-mx-6 md:px-6">
        <label className="relative block">
          <span className="sr-only">Search the menu</span>
          <MagnifyingGlass size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${settings.business_name}’s menu…`}
            className="field rounded-full py-3 pl-11 pr-4"
          />
        </label>
        <div
          role="group"
          aria-label="Categories"
          className="-mx-4 mt-2.5 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
        >
          {[{ id: "all", name: "All" }, ...usedCats].map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              className={`chip shrink-0 ${cat === c.id ? "chip-sel" : ""}`}
              onClick={() => setCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="mx-auto max-w-[680px] rounded-[16px] border-[1.5px] border-dashed border-rose-mid/70 bg-surface px-6 py-14 text-center">
          <p className="text-[15px] text-ink">{q.trim() ? `No treats found for ‘${q.trim()}’.` : "No treats here yet."}</p>
          <button
            type="button"
            className="btn-o mt-4"
            onClick={() => {
              setQ("");
              setCat("all");
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        <div key={`${cat}-${q}`} className="m-stagger grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9 lg:grid-cols-4">
          {list.map((m, i) => (
            <div key={m.id} style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
              <ProductCard
                item={m}
                index={i}
                artUrl={categoryArt(catName(m.category_id))}
                flashing={shop.flash === m.id}
                askUrl={ask(m)}
                onOpen={() => shop.setPicking(m)}
                onQuickAdd={() => shop.quickAdd(m)}
              />
            </div>
          ))}
        </div>
      )}

      <QuickAddLayer shop={shop} categories={categories} settings={settings} />
    </>
  );
}
