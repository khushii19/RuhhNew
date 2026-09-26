"use client";

import { useCallback, useState } from "react";
import { ItemPicker } from "@/components/item-picker";
import { Toast, type ToastMessage } from "@/components/toast";
import { useCart } from "@/components/cart-context";
import { categoryArt } from "@/lib/category-art";
import { categoryLeadTime, itemHasOptions, itemOrderable } from "@/lib/data";
import type { Category, MenuItem, Settings } from "@/lib/types";

/**
 * Shared add-to-basket behaviour for product grids (home and menu): "+"
 * adds single-size bakes straight away, anything with options opens the
 * product view, and both confirm with a toast.
 */
export function useQuickAdd(categories: Category[], settings: Settings, initial: MenuItem | null = null) {
  const { add } = useCart();
  const [picking, setPicking] = useState<MenuItem | null>(initial);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const clearToast = useCallback(() => setToast(null), []);
  const catName = useCallback((id: string | null) => categories.find((c) => c.id === id)?.name, [categories]);

  const added = useCallback((name: string) => setToast({ text: `Added ${name}`, action: { label: "View basket", href: "/order" } }), []);

  function quickAdd(m: MenuItem) {
    // Unpriced and sold-out bakes can't go in the basket; the card offers
    // WhatsApp instead.
    if (!itemOrderable(m)) return;
    if (itemHasOptions(m)) {
      setPicking(m);
      return;
    }
    const s = m.item_sizes[0];
    if (!s) return;
    add({
      kind: "item",
      itemId: m.id,
      sizeId: s.id,
      qty: 1,
      name: m.name,
      emoji: m.emoji,
      image: m.image_url,
      sizeLabel: s.label,
      unitPrice: Number(s.price_aed),
      leadTimeHours: categoryLeadTime(
        categories.find((c) => c.id === m.category_id),
        settings,
      ),
    });
    setFlash(m.id);
    added(m.name);
    setTimeout(() => setFlash(null), 900);
  }

  return { picking, setPicking, flash, toast, added, clearToast, quickAdd, catName };
}

export type QuickAdd = ReturnType<typeof useQuickAdd>;

/** The product view and toast that go with a useQuickAdd grid. */
export function QuickAddLayer({ shop, categories, settings }: { shop: QuickAdd; categories: Category[]; settings: Settings }) {
  const { picking } = shop;
  return (
    <>
      {picking && (
        <ItemPicker
          item={picking}
          artUrl={categoryArt(shop.catName(picking.category_id))}
          leadTimeHours={categoryLeadTime(
            categories.find((c) => c.id === picking.category_id),
            settings,
          )}
          onClose={() => shop.setPicking(null)}
          onAdded={shop.added}
        />
      )}
      <Toast message={shop.toast} onDone={shop.clearToast} />
    </>
  );
}
