import { categoryLeadTime, itemOrderable } from "@/lib/data";
import type { CartLine, Category, MenuItem, Order, Settings } from "@/lib/types";

/** "3× Dark, 3× White" back into { Dark: 3, White: 3 }; null if it isn't a mix. */
export function parseMix(text: string): Record<string, number> | null {
  if (!text) return null;
  const out: Record<string, number> = {};
  for (const part of text.split(", ")) {
    const m = /^(\d+)× (.+)$/.exec(part.trim());
    if (!m) return null;
    out[m[2]] = Number(m[1]);
  }
  return out;
}

/**
 * Basket lines that repeat a past order at today's menu and prices. Lines
 * whose bake, size or flavour is gone, sold out or unpriced are skipped;
 * so are specials, which change every week.
 */
export function reorderLines(order: Order, items: MenuItem[], categories: Category[], settings: Settings) {
  const lines: Omit<CartLine, "key">[] = [];
  let skipped = 0;
  for (const oi of order.order_items ?? []) {
    const m = oi.item_id ? items.find((i) => i.id === oi.item_id) : undefined;
    const size = m?.item_sizes.find((s) => s.label === oi.size_label) ?? (m?.item_sizes.length === 1 ? m.item_sizes[0] : undefined);
    if (!m || !size || !itemOrderable(m) || Number(size.price_aed) <= 0) {
      skipped++;
      continue;
    }
    const flavours = m.item_flavours.map((f) => f.name);
    const mixMode = m.mixable && flavours.length > 0 && size.piece_count > 1;
    const mix = mixMode ? parseMix(oi.flavour_text) : null;
    if (mixMode) {
      const sum = mix ? Object.values(mix).reduce((a, b) => a + b, 0) : 0;
      if (!mix || sum !== size.piece_count || Object.keys(mix).some((f) => !flavours.includes(f))) {
        skipped++;
        continue;
      }
    } else if (flavours.length && !flavours.includes(oi.flavour_text)) {
      skipped++;
      continue;
    }
    lines.push({
      kind: "item",
      itemId: m.id,
      sizeId: size.id,
      flavour: !mixMode && oi.flavour_text ? oi.flavour_text : undefined,
      mix: mix ?? undefined,
      qty: oi.qty,
      name: m.name,
      emoji: m.emoji,
      image: m.image_url,
      sizeLabel: size.label,
      unitPrice: Number(size.price_aed),
      leadTimeHours: categoryLeadTime(
        categories.find((c) => c.id === m.category_id),
        settings,
      ),
    });
  }
  return { lines, skipped };
}
