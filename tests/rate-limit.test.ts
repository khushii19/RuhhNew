import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows up to the limit then blocks within the window", () => {
    const key = "t:" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimit(key, 3, 60_000).ok).toBe(true);
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });
  it("keeps keys independent", () => {
    const a = "a:" + Math.random();
    const b = "b:" + Math.random();
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000).ok).toBe(false);
    expect(rateLimit(b, 1, 60_000).ok).toBe(true);
  });
});
