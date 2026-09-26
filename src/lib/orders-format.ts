/* Order text helpers with no server imports, so client components can use them too. */
import type { OrderItem } from "@/lib/types";

/** "Build Your Own Cookie Box (Box of 6 — 3× Dark, 3× White)" */
export function lineLabel(i: Pick<OrderItem, "item_name" | "size_label" | "flavour_text">) {
  const extra = [i.size_label, i.flavour_text].filter(Boolean).join(" — ");
  return extra ? `${i.item_name} (${extra})` : i.item_name;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sat 27 Sep": fixed words, so the message reads the same on every server. */
export function shortDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
