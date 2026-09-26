"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { RevealGroup } from "@/components/reveal";
import { QuickAddLayer, useQuickAdd } from "@/components/use-quick-add";
import { categoryArt } from "@/lib/category-art";
import { waLink } from "@/lib/format";
import type { Category, MenuItem, Settings } from "@/lib/types";

type Section = { id: string; label: string };

/**
 * The whole menu on the home page, like an ordering app: a sticky row of
 * section chips that follows the section on screen, the bestsellers, then
 * every category in turn. "+" adds straight to the basket.
 */
export function HomeShop({ items, featured, categories, settings }: { items: MenuItem[]; featured: MenuItem[]; categories: Category[]; settings: Settings }) {
  const shop = useQuickAdd(categories, settings);
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));
  const sections: Section[] = [
    ...(featured.length ? [{ id: "bestsellers", label: "Bestsellers" }] : []),
    ...cats.map((c) => ({ id: `cat-${c.id}`, label: c.name })),
  ];
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: the section crossing the upper part of the screen is active.
  const sectionKey = sections.map((s) => s.id).join("|");
  useEffect(() => {
    const els = sectionKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sectionKey]);

  // Keep the active chip in view inside the sideways-scrolling bar.
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (bar && chip) bar.scrollTo({ left: chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const ask = (m: MenuItem) =>
    settings.whatsapp_number ? waLink(settings.whatsapp_number, `Hi ${settings.owner_name}! Could you tell me the price for ${m.name}?`) : null;
  const card = (m: MenuItem, i: number) => (
    <ProductCard
      item={m}
      index={i}
      artUrl={categoryArt(shop.catName(m.category_id))}
      flashing={shop.flash === m.id}
      askUrl={ask(m)}
      onOpen={() => shop.setPicking(m)}
      onQuickAdd={() => shop.quickAdd(m)}
    />
  );
  const grid = "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4";
  const sectionCls = "scroll-mt-[124px] pt-8 md:scroll-mt-[164px] md:pt-10";

  return (
    <div id="shop" className="scroll-mt-40 md:scroll-mt-52">
      <nav aria-label="Menu sections" className="sticky top-16 z-30 -mx-4 bg-cream/95 px-4 py-2.5 backdrop-blur md:top-[105px] md:-mx-6 md:px-6">
        <div ref={barRef} className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-section={s.id}
              aria-current={active === s.id ? "true" : undefined}
              onClick={() => setActive(s.id)}
              className={`chip shrink-0 ${active === s.id ? "chip-sel" : ""}`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {featured.length > 0 && (
        <section id="bestsellers" aria-labelledby="bestsellers-title" className={sectionCls}>
          <h3 id="bestsellers-title" className="mb-4 text-[21px] leading-tight md:text-[24px]">
            Bestsellers
          </h3>
          <RevealGroup className={grid}>
            {featured.map((m, i) => (
              <div key={m.id} style={{ "--i": i } as React.CSSProperties}>
                {card(m, i)}
              </div>
            ))}
          </RevealGroup>
        </section>
      )}

      {cats.map((c) => {
        const list = items.filter((m) => m.category_id === c.id);
        return (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`cat-${c.id}-title`} className={sectionCls}>
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h3 id={`cat-${c.id}-title`} className="text-[21px] leading-tight md:text-[24px]">
                {c.name}
              </h3>
              <span className="text-[12.5px] text-muted">
                {list.length} {list.length === 1 ? "bake" : "bakes"}
              </span>
            </div>
            <RevealGroup className={grid}>
              {list.map((m, i) => (
                <div key={m.id} style={{ "--i": i } as React.CSSProperties}>
                  {card(m, i)}
                </div>
              ))}
            </RevealGroup>
          </section>
        );
      })}

      <QuickAddLayer shop={shop} categories={categories} settings={settings} />
    </div>
  );
}
