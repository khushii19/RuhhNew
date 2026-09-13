"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades a block up when it scrolls into view. Content is visible for
 * server rendering and for anyone with JS disabled or reduced motion; the
 * hide-then-reveal only starts once the component has mounted.
 */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "hidden" | "shown">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return; // already on screen: leave it alone
    setState("hidden");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    // Safety net: never leave content hidden if the observer never fires.
    const t = setTimeout(() => setState("shown"), 2500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${state === "hidden" ? "reveal-hidden" : state === "shown" ? "reveal-shown" : ""}`}
      style={state === "shown" ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
