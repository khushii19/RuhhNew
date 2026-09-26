"use client";

import { useEffect, useRef, useState } from "react";
import { CartBar } from "@/components/cart-bar";
import { ProductCard } from "@/components/product-card";
import { SpecialCard } from "@/components/special-card";
import { QuickAddLayer, useQuickAdd } from "@/components/use-quick-add";
import { categoryArt } from "@/lib/category-art";
import type { Category, MenuItem, Settings, Special } from "@/lib/types";

type Section = { id: string; label: string };

/**
 * The shop on the home page, arranged like an ordering app: a sticky row of
 * section pills (highlighting whichever section is on screen), the most
 * loved bakes, this week's specials, then every category in turn.
 */
export function HomeShop({
  items,
  featured,
  categories,
  specials,
  settings,
}: {
  items: MenuItem[];
  featured: MenuItem[];
  categories: Category[];
  specials: Special[];
  settings: Settings;
}) {
  const shop = useQuickAdd(categories, settings);
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));
  const sections: Section[] = [
    ...(featured.length ? [{ id: "most-loved", label: "Bestsellers" }] : []),
    ...(specials.length ? [{ id: "this-week", label: "Specials" }] : []),
    ...cats.map((c) => ({ id: `cat-${c.id}`, label: c.name })),
  ];
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: the section crossing the upper-middle of the screen is active.
  const sectionKey = sections.map((s) => s.id).join("|");
  useEffect(() => {
    const els = sectionKey.split("|").map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
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

  // Keep the active pill in view inside the sideways-scrolling bar.
  useEffect(() => {
    const bar = barRef.current;
    const pill = bar?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (bar && pill) bar.scrollTo({ left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const card = (m: MenuItem, i: number, size?: "large") => (
    <ProductCard
      item={m}
      index={i}
      size={size}
      artUrl={categoryArt(shop.catName(m.category_id))}
      flashing={shop.flash === m.id}
      onOpen={() => shop.setPicking(m)}
      onQuickAdd={() => shop.quickAdd(m)}
    />
  );

  return (
    <div id="bakes" className="scroll-mt-14 md:scroll-mt-[84px]">
      {/* ---------- sticky section pills ---------- */}
      <nav aria-label="Menu sections" className="bleed sticky top-14 z-30 border-b border-line bg-cream/95 backdrop-blur-md md:top-[84px]">
        <div
          ref={barRef}
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-section={s.id}
              aria-current={active === s.id ? "true" : undefined}
              onClick={() => setActive(s.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] transition-colors ${
                active === s.id ? "bg-ink font-semibold text-cream" : "bg-surface text-ink/80 ring-1 ring-line hover:text-rose-deep"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------- bestsellers ---------- */}
      {featured.length > 0 && (
        <section id="most-loved" aria-labelledby="most-loved-title" className="scroll-mt-[124px] pt-10 md:scroll-mt-[156px] md:pt-14">
          <h2 id="most-loved-title" className="mb-6 text-[28px] leading-tight md:text-[36px]">
            Bestsellers
          </h2>
          <div className="-mx-5 flex scroll-px-5 snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
            {featured.slice(0, 4).map((m, i) => (
              <div key={m.id} className="w-[68vw] max-w-[280px] shrink-0 snap-start md:w-auto md:max-w-none">
                {card(m, i, "large")}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- this week ---------- */}
      {specials.length > 0 && (
        <section id="this-week" aria-labelledby="this-week-title" className="scroll-mt-[124px] pt-12 md:scroll-mt-[156px] md:pt-16">
          <h2 id="this-week-title" className="mb-6 text-[28px] leading-tight md:text-[36px]">
            This week&rsquo;s specials
          </h2>
          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            {specials.map((s) => (
              <SpecialCard key={s.id} special={s} leadTimeHours={settings.default_lead_time_hours} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- every category ---------- */}
      {cats.map((c) => {
        const list = items.filter((m) => m.category_id === c.id);
        return (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`cat-${c.id}-title`} className="scroll-mt-[124px] pt-12 md:scroll-mt-[156px] md:pt-16">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 id={`cat-${c.id}-title`} className="text-[28px] leading-tight md:text-[36px]">
                {c.name}
              </h2>
              <span className="text-[13px] text-muted">
                {list.length} {list.length === 1 ? "bake" : "bakes"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
              {list.map((m, i) => (
                <div key={m.id}>{card(m, i)}</div>
              ))}
            </div>
          </section>
        );
      })}

      <QuickAddLayer shop={shop} categories={categories} settings={settings} />
      <CartBar />
    </div>
  );
}
