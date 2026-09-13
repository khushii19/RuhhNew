export function aed(n: number | string | null | undefined): string {
  const v = Number(n ?? 0);
  return `AED ${Number.isInteger(v) ? v : v.toFixed(2)}`;
}

export function fmtDate(iso: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const d = typeof iso === "string" ? new Date(iso.length === 10 ? iso + "T00:00:00" : iso) : iso;
  return d.toLocaleDateString("en-GB", opts ?? { weekday: "short", day: "numeric", month: "short" });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Digits only, with UAE local numbers (05x…) converted to international 971. */
export function normalizePhone(raw: string): string {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("05")) d = "971" + d.slice(1);
  if (d.length === 9 && d.startsWith("5")) d = "971" + d;
  return d;
}

export function isValidPhone(raw: string) {
  const d = normalizePhone(raw);
  return d.length >= 9 && d.length <= 15;
}

export function waLink(number: string, message: string) {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`;
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
