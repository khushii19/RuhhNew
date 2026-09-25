"use client";

import { Photo } from "@/components/photo";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ItemPicker } from "@/components/item-picker";
import { CartBar } from "@/components/cart-bar";
import { Toast } from "@/components/toast";
import { categoryArt } from "@/lib/category-art";
import { useCart } from "@/components/cart-context";
import { itemHasOptions, itemMinPrice, categoryLeadTime } from "@/lib/data";
import { aed } from "@/lib/format";
import type { Category, MenuItem, Settings } from "@/lib/types";

/** Pastel grounds behind each photo, cycled so adjacent tiles differ. */
const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];


export function MenuBrowser({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  const params = useSearchParams();
  const initialCat = params.get("cat");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>(initialCat && categories.some((c) => c.id === initialCat) ? initialCat : "all");
  const [picking, setPicking] = useState<MenuItem | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const { add } = useCart();
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name;

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

  function choose(m: MenuItem) {
    if (itemHasOptions(m)) {
      setPicking(m);
      return;
    }
    const s = m.item_sizes[0];
    if (!s) return;
    const category = categories.find((c) => c.id === m.category_id);
    add({
      kind: "item",
      itemId: m.id,
      sizeId: s.id,
      qty: 1,
      name: m.name,
      emoji: m.emoji,
      sizeLabel: s.label,
      unitPrice: Number(s.price_aed),
      leadTimeHours: categoryLeadTime(category, settings),
    });
    setFlash(m.id);
    setToast(`${m.name} added`);
    setTimeout(() => setFlash(null), 900);
  }

  const current = cat === "all" ? "Everything" : catName(cat) ?? "Everything";
  const countFor = (id: string) => items.filter((m) => m.category_id === id).length;

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
            <div key={`${cat}-${q}`} className="m-stagger mb-20 grid grid-cols-2 md:mb-0 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
              {list.map((m, i) => {
                const multi = m.item_sizes.length > 1;
                const flav = m.item_flavours.slice(0, 3).map((f) => f.name).join(", ") + (m.item_flavours.length > 3 ? "\u2026" : "");
                return (
                  <div
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => choose(m)}
                    onKeyDown={(e) => e.key === "Enter" && choose(m)}
                    style={{ "--i": Math.min(i, 12) } as React.CSSProperties}
                    className="card lift group flex cursor-pointer flex-col overflow-hidden hover:border-rose-mid"
                  >
                    <div className={`relative aspect-square overflow-hidden ${TILE_BG[i % 4]}`}>
                      <Photo
                        src={m.image_url ?? categoryArt(catName(m.category_id))}
                        alt={m.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-3.5 md:p-4">
                      <div className="text-[14px] font-semibold leading-snug md:text-[15px]">{m.name}</div>
                      <div className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted md:text-[13px]">{m.description}</div>
                      {flav && <div className="mt-1 line-clamp-1 text-[12px] text-lav-deep">{flav}</div>}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-[14px] font-semibold text-rose-deep md:text-[15px]">
                          {multi && <span className="font-normal text-muted">from </span>}
                          {aed(itemMinPrice(m))}
                        </span>
                        <button
                          aria-label={itemHasOptions(m) ? `Choose options for ${m.name}` : `Add ${m.name} to cart`}
                          onClick={(e) => {
                            e.stopPropagation();
                            choose(m);
                          }}
                          className={`press flex h-8 w-8 items-center justify-center rounded-full text-[17px] leading-none transition ${flash === m.id ? "m-pop bg-sage text-sage-deep" : "bg-rose-deep text-on-accent"}`}
                        >
                          {flash === m.id ? "\u2713" : "+"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {picking && (
        <ItemPicker
          item={picking}
          artUrl={categoryArt(catName(picking.category_id))}
          leadTimeHours={categoryLeadTime(categories.find((c) => c.id === picking.category_id), settings)}
          onClose={() => setPicking(null)}
          onAdded={(name) => setToast(`${name} added`)}
        />
      )}
      <Toast message={toast} onDone={clearToast} />
      <CartBar />
    </>
  );
}
