import { describe, expect, it } from "vitest";
import { isSpecialLive } from "@/lib/specials";
import { trackSteps } from "@/lib/track";
import { parseMix, reorderLines } from "@/lib/reorder";
import { itemOrderable, itemUnpriced, normalizeSettings } from "@/lib/data";
import { shortDate } from "@/lib/orders-format";
import type { MenuItem, Order } from "@/lib/types";

const box: MenuItem = {
  id: "m1",
  category_id: "c1",
  name: "Build Your Own Cookie Box",
  description: "",
  emoji: "🍪",
  image_url: null,
  mixable: true,
  is_available: true,
  is_featured: false,
  sort_order: 1,
  item_sizes: [
    { id: "s6", item_id: "m1", label: "Box of 6", piece_count: 6, price_aed: 60, sort_order: 1 },
    { id: "s12", item_id: "m1", label: "Box of 12", piece_count: 12, price_aed: 110, sort_order: 2 },
  ],
  item_flavours: [
    { id: "f1", item_id: "m1", name: "Dark", sort_order: 1 },
    { id: "f2", item_id: "m1", name: "White", sort_order: 2 },
  ],
};
const bark: MenuItem = { ...box, id: "m2", name: "Bark", mixable: false, item_flavours: [], item_sizes: [{ id: "b1", item_id: "m2", label: "100g", piece_count: 1, price_aed: 0, sort_order: 1 }] };

describe("specials", () => {
  it("shows a special only inside its optional dates", () => {
    const s = { is_active: true, starts_on: "2026-09-20", ends_on: "2026-09-27" };
    expect(isSpecialLive(s, "2026-09-19")).toBe(false);
    expect(isSpecialLive(s, "2026-09-20")).toBe(true);
    expect(isSpecialLive(s, "2026-09-27")).toBe(true);
    expect(isSpecialLive(s, "2026-09-28")).toBe(false);
    expect(isSpecialLive({ is_active: true, starts_on: null, ends_on: null }, "2030-01-01")).toBe(true);
    expect(isSpecialLive({ is_active: false }, "2026-09-21")).toBe(false);
  });
});

describe("price on request and sold out", () => {
  it("won't let unpriced or sold-out bakes into the basket", () => {
    expect(itemUnpriced(bark)).toBe(true);
    expect(itemOrderable(bark)).toBe(false);
    expect(itemOrderable(box)).toBe(true);
    expect(itemOrderable({ ...box, is_sold_out: true })).toBe(false);
  });
});

describe("track steps", () => {
  it("maps statuses onto the four customer steps", () => {
    expect(trackSteps("pending", "delivery")).toEqual({ steps: ["Confirmed", "Baking", "On the way", "Delivered"], index: 0 });
    expect(trackSteps("baking", "delivery").index).toBe(1);
    expect(trackSteps("out_for_delivery", "delivery").index).toBe(2);
    expect(trackSteps("ready_for_pickup", "pickup")).toEqual({ steps: ["Confirmed", "Baking", "Ready for pickup", "Collected"], index: 2 });
    expect(trackSteps("delivered", "pickup").index).toBe(4);
    expect(trackSteps("cancelled", "delivery").index).toBe(-1);
  });
});

describe("order again", () => {
  it("parses a mixed box line", () => {
    expect(parseMix("3× Dark, 3× White")).toEqual({ Dark: 3, White: 3 });
    expect(parseMix("Dark")).toBeNull();
  });

  it("re-adds lines at today's prices and skips what can't be ordered", () => {
    const order = {
      order_items: [
        { id: "1", order_id: "o", item_id: "m1", special_id: null, item_name: "Build Your Own Cookie Box", emoji: "🍪", size_label: "Box of 6", flavour_text: "3× Dark, 3× White", unit_price: 55, qty: 2, line_total: 110 },
        { id: "2", order_id: "o", item_id: "m2", special_id: null, item_name: "Bark", emoji: "🍫", size_label: "100g", flavour_text: "", unit_price: 0, qty: 1, line_total: 0 },
        { id: "3", order_id: "o", item_id: null, special_id: "sp", item_name: "Special", emoji: "✨", size_label: "", flavour_text: "", unit_price: 85, qty: 1, line_total: 85 },
      ],
    } as unknown as Order;
    const { lines, skipped } = reorderLines(order, [box, bark], [], normalizeSettings(null));
    expect(skipped).toBe(2);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ itemId: "m1", sizeId: "s6", mix: { Dark: 3, White: 3 }, qty: 2, unitPrice: 60 });
  });
});

describe("dates in messages", () => {
  it("formats the same way on every server", () => {
    expect(shortDate("2026-09-27")).toBe("Sun 27 Sep");
  });
});
