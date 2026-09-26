import { describe, expect, it } from "vitest";
import { categoryCover } from "@/lib/data";
import type { MenuItem } from "@/lib/types";

const item = (id: string, category_id: string, image_url: string | null): MenuItem => ({
  id,
  category_id,
  name: id,
  description: "",
  emoji: "",
  image_url,
  mixable: false,
  is_available: true,
  is_featured: false,
  sort_order: 0,
  item_sizes: [],
  item_flavours: [],
});

const items = [item("a", "cookies", "a.jpg"), item("b", "cookies", null), item("c", "cookies", "c.jpg"), item("d", "cakes", "d.jpg")];

describe("categoryCover", () => {
  it("uses the first photographed item in the category", () => {
    expect(categoryCover(items, "cookies")).toBe("a.jpg");
  });

  it("skips photos already shown elsewhere on the page", () => {
    expect(categoryCover(items, "cookies", new Set(["a.jpg"]))).toBe("c.jpg");
  });

  it("falls back to a shown photo rather than none", () => {
    expect(categoryCover(items, "cakes", new Set(["d.jpg"]))).toBe("d.jpg");
  });

  it("returns null when the category has no photos", () => {
    expect(categoryCover([item("x", "empty", null)], "empty")).toBeNull();
  });
});
