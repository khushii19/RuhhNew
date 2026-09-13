import { describe, expect, it } from "vitest";
import { aed, isValidPhone, normalizePhone, waLink } from "@/lib/format";

describe("phone normalisation", () => {
  it("converts UAE local numbers to international digits", () => {
    expect(normalizePhone("050 123 4567")).toBe("971501234567");
    expect(normalizePhone("+971 50 123 4567")).toBe("971501234567");
    expect(normalizePhone("00971501234567")).toBe("971501234567");
    expect(normalizePhone("501234567")).toBe("971501234567");
  });
  it("validates plausible lengths", () => {
    expect(isValidPhone("0501234567")).toBe(true);
    expect(isValidPhone("+44 7700 900123")).toBe(true);
    expect(isValidPhone("12345")).toBe(false);
  });
  it("builds a wa.me link with encoded text", () => {
    expect(waLink("+971 50 000 0000", "Hi Shweta!")).toBe("https://wa.me/971500000000?text=Hi%20Shweta!");
  });
});

describe("currency", () => {
  it("formats whole and fractional amounts", () => {
    expect(aed(85)).toBe("AED 85");
    expect(aed("85.00")).toBe("AED 85");
    expect(aed(12.5)).toBe("AED 12.50");
    expect(aed(null)).toBe("AED 0");
  });
});
