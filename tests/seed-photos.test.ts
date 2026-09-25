import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_ABOUT, SEED_HERO, seedPhoto } from "@/lib/seed-photos";

const seed = readFileSync(join(import.meta.dirname, "../supabase/seed.sql"), "utf8");

describe("seedPhoto", () => {
  it("matches names regardless of case and stray spaces", () => {
    expect(seedPhoto("Classic Tiramisu")).toMatch(/^https:\/\/mcp\.portermetrics\.com\//);
    expect(seedPhoto("  classic tiramisu ")).toBe(seedPhoto("Classic Tiramisu"));
  });

  it("has nothing for bakes added after launch", () => {
    expect(seedPhoto("Saffron Pistachio Loaf")).toBeNull();
  });

  it("stays in step with every photo in seed.sql", () => {
    const rows = [...seed.matchAll(/update (?:menu_items|specials) set image_url = '([^']+)'[^;]*where name = '([^']+)';/g)];
    expect(rows.length).toBeGreaterThan(0);
    for (const [, url, name] of rows) expect(seedPhoto(name), name).toBe(url);
    expect(seed).toContain(`hero_image_url = '${SEED_HERO}'`);
    expect(seed).toContain(`about_image_url = '${SEED_ABOUT}'`);
  });
});
