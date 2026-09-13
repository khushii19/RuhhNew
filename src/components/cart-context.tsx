"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "@/lib/types";

const KEY = "ruhh_cart_v1";
const EMPTY: CartLine[] = [];

/* A tiny external store backed by localStorage. useSyncExternalStore keeps
   the server render empty and swaps in the saved cart after hydration. */
let state: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    if (Array.isArray(parsed)) state = parsed.filter((l) => l && l.key && l.qty > 0);
  } catch {
    state = EMPTY;
  }
}

function setState(next: CartLine[]) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  leadHours: number;
  add: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  hydrated: boolean;
}

const CartContext = createContext<CartApi | null>(null);

export function lineKey(l: Omit<CartLine, "key">) {
  return [l.kind, l.itemId ?? l.specialId ?? "", l.sizeId ?? "", l.flavour ?? "", JSON.stringify(l.mix ?? {})].join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  const add = useCallback((line: Omit<CartLine, "key">) => {
    const key = lineKey(line);
    const prev = getSnapshot();
    const ex = prev.find((l) => l.key === key);
    setState(ex ? prev.map((l) => (l.key === key ? { ...l, qty: l.qty + line.qty } : l)) : [...prev, { ...line, key }]);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    const prev = getSnapshot();
    setState(qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l)));
  }, []);

  const remove = useCallback((key: string) => setState(getSnapshot().filter((l) => l.key !== key)), []);
  const clear = useCallback(() => setState([]), []);

  const value = useMemo<CartApi>(() => {
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
    const leadHours = lines.reduce((a, l) => Math.max(a, l.leadTimeHours || 0), 0);
    return { lines, count, subtotal, leadHours, add, setQty, remove, clear, hydrated };
  }, [lines, add, setQty, remove, clear, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
