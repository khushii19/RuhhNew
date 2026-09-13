import type { Settings } from "@/lib/types";

/** Dubai is UTC+4 with no DST. Dates are computed in that zone. */
export const TZ = "Asia/Dubai";

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function toISODate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): number {
  return new Date(iso + "T00:00:00Z").getUTCDay();
}

/** Earliest date on which an order needing `leadHours` notice can be fulfilled. */
export function earliestDate(leadHours: number, now = new Date()): string {
  const ready = new Date(now.getTime() + leadHours * 3600 * 1000);
  return toISODate(ready);
}

export function isClosedDate(iso: string, settings: Pick<Settings, "closed_weekdays" | "closed_dates">) {
  if (settings.closed_weekdays.includes(weekdayOf(iso))) return true;
  return settings.closed_dates.includes(iso);
}

/** Next `count` selectable dates starting from the earliest allowed date. */
export function availableDates(
  leadHours: number,
  settings: Pick<Settings, "closed_weekdays" | "closed_dates">,
  count = 14,
  now = new Date(),
): string[] {
  const out: string[] = [];
  let d = earliestDate(leadHours, now);
  let guard = 0;
  while (out.length < count && guard < 60) {
    if (!isClosedDate(d, settings)) out.push(d);
    d = addDays(d, 1);
    guard++;
  }
  return out;
}

export function isDateAllowed(
  iso: string,
  leadHours: number,
  settings: Pick<Settings, "closed_weekdays" | "closed_dates">,
  now = new Date(),
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  if (iso < earliestDate(leadHours, now)) return false;
  if (isClosedDate(iso, settings)) return false;
  return true;
}
