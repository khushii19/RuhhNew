import type { Special } from "@/lib/types";

/**
 * Whether a special should show today. Both dates are optional and
 * inclusive; `today` is an ISO date in Dubai time.
 */
export function isSpecialLive(s: Pick<Special, "is_active" | "starts_on" | "ends_on">, today: string) {
  if (!s.is_active) return false;
  if (s.starts_on && today < s.starts_on) return false;
  if (s.ends_on && today > s.ends_on) return false;
  return true;
}
