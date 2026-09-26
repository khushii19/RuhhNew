"use client";

import { ProductCard } from "@/components/product-card";
import { RevealGroup } from "@/components/reveal";
import { QuickAddLayer, useQuickAdd } from "@/components/use-quick-add";
import { categoryArt } from "@/lib/category-art";
import { waLink } from "@/lib/format";
import type { Category, MenuItem, Settings } from "@/lib/types";

/** The home page's bestsellers, with the menu's add-to-basket behaviour. */
export function HomeBestsellers({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  const shop = useQuickAdd(categories, settings);
  return (
    <>
      <RevealGroup className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-4 md:gap-x-5">
        {items.map((m, i) => (
          <div key={m.id} style={{ "--i": i } as React.CSSProperties}>
            <ProductCard
              item={m}
              index={i}
              artUrl={categoryArt(shop.catName(m.category_id))}
              flashing={shop.flash === m.id}
              askUrl={settings.whatsapp_number ? waLink(settings.whatsapp_number, `Hi ${settings.owner_name}! Could you tell me the price for ${m.name}?`) : null}
              onOpen={() => shop.setPicking(m)}
              onQuickAdd={() => shop.quickAdd(m)}
            />
          </div>
        ))}
      </RevealGroup>
      <QuickAddLayer shop={shop} categories={categories} settings={settings} />
    </>
  );
}
