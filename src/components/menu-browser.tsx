"use client";

import { Photo } from "@/components/photo";
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

  return (
    <>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${settings.business_name}'s menu...`}
        aria-label="Search menu"
        className="field mb-3 border-rose-mid"
      />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button className={`chip shrink-0 ${cat === "all" ? "chip-sel" : ""}`} onClick={() => setCat("all")}>
          All
        </button>
        {usedCats.map((c) => (
          <button key={c.id} className={`chip shrink-0 ${cat === c.id ? "chip-sel" : ""}`} onClick={() => setCat(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="p-7 text-center text-[13px] text-muted">No treats found.</div>
      ) : (
        <div key={`${cat}-${q}`} className="m-stagger mb-24 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {list.map((m, i) => {
            const multi = m.item_sizes.length > 1;
            const flav = m.item_flavours.slice(0, 3).map((f) => f.name).join(" · ") + (m.item_flavours.length > 3 ? "…" : "");
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
                <div className={`relative flex h-[110px] items-center justify-center overflow-hidden text-[40px] ${TILE_BG[i % 4]}`}>
                  <Photo
                    src={m.image_url ?? categoryArt(catName(m.category_id))}
                    alt={m.name}
                    fill
                    sizes="(max-width: 680px) 50vw, 220px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                   
                  />
                  {itemHasOptions(m) && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-surface/85 px-1.5 py-0.5 text-[9px] font-bold text-rose-deep">options</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-2.5 px-3">
                  <div className="text-[12px] font-bold">{m.name}</div>
                  <div className="text-[11px] text-muted">{m.description}</div>
                  {flav && <div className="mt-0.5 text-[10px] text-lav-deep">{flav}</div>}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-[13px] font-bold text-rose-deep">
                      {multi && <small className="font-normal text-muted">from </small>}
                      {aed(itemMinPrice(m))}
                    </span>
                    <button
                      aria-label={`Add ${m.name} to cart`}
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(m);
                      }}
                      className={`press flex h-7 w-7 items-center justify-center rounded-full text-[16px] leading-none text-on-accent transition ${flash === m.id ? "m-pop bg-sage text-sage-deep" : "bg-rose-deep"}`}
                    >
                      {flash === m.id ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
