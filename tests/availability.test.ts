import { describe, expect, it } from "vitest";
import { addDays, availableDates, earliestDate, isDateAllowed, toISODate, weekdayOf } from "@/lib/availability";

const settings = { closed_weekdays: [5], closed_dates: ["2026-09-10"] }; // closed Fridays + one date
const now = new Date("2026-09-07T06:00:00Z"); // Monday 10:00 Dubai

describe("availability", () => {
  it("formats dates in the Dubai timezone", () => {
    // 22:30 UTC is already the next day in Dubai (UTC+4)
    expect(toISODate(new Date("2026-09-07T22:30:00Z"))).toBe("2026-09-08");
  });

  it("computes the earliest date from lead time", () => {
    expect(earliestDate(0, now)).toBe("2026-09-07");
    expect(earliestDate(4, now)).toBe("2026-09-07");
    expect(earliestDate(24, now)).toBe("2026-09-08");
    expect(earliestDate(48, now)).toBe("2026-09-09");
  });

  it("skips closed weekdays and closed dates", () => {
    const dates = availableDates(0, settings, 7, now);
    expect(dates).toEqual(["2026-09-07", "2026-09-08", "2026-09-09", "2026-09-12", "2026-09-13", "2026-09-14", "2026-09-15"]);
    expect(dates.some((d) => weekdayOf(d) === 5)).toBe(false);
    expect(dates).not.toContain("2026-09-10");
  });

  it("validates a requested date against lead time and closures", () => {
    expect(isDateAllowed("2026-09-07", 24, settings, now)).toBe(false); // too soon
    expect(isDateAllowed("2026-09-08", 24, settings, now)).toBe(true);
    expect(isDateAllowed("2026-09-11", 24, settings, now)).toBe(false); // Friday
    expect(isDateAllowed("2026-09-10", 24, settings, now)).toBe(false); // closed date
    expect(isDateAllowed("not-a-date", 0, settings, now)).toBe(false);
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
  });
});
