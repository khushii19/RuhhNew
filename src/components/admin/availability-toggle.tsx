"use client";

import { useTransition } from "react";
import { toggleItemAvailability } from "@/app/admin/actions";

export function AvailabilityToggle({ id, available }: { id: string; available: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      role="switch"
      aria-checked={available}
      aria-label={available ? "Available — click to hide" : "Hidden — click to show"}
      disabled={pending}
      onClick={() => start(() => toggleItemAvailability(id, !available))}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${available ? "bg-sage-deep" : "bg-line"} disabled:opacity-50`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface transition ${available ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
