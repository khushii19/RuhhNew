"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun, Desktop } from "@phosphor-icons/react/dist/ssr";

type Mode = "system" | "light" | "dark";
const KEY = "ruhh_theme";
const listeners = new Set<() => void>();

function read(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function write(mode: Mode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

/** Auto / light / dark. The saved choice is applied before paint by the inline script in layout.tsx. */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, read, () => "system" as Mode);
  const order: Mode[] = ["system", "light", "dark"];
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : Desktop;
  return (
    <button
      onClick={() => write(order[(order.indexOf(mode) + 1) % order.length])}
      className="inline-flex items-center gap-1 text-muted hover:text-rose-deep"
      aria-label={`Theme: ${mode}. Click to change`}
      title="Theme"
    >
      <Icon size={14} aria-hidden="true" /> {mode === "system" ? "Auto" : mode === "light" ? "Light" : "Dark"}
    </button>
  );
}
