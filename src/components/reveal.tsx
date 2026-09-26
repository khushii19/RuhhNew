"use client";

import { useEffect, useRef, useState } from "react";

type RevealState = "static" | "hidden" | "shown";

/**
 * Scroll-reveal state for one element. Content is visible for server
 * rendering, with JS disabled, with reduced motion, without
 * IntersectionObserver, and when it is already on screen at mount; only
 * content further down the page is hidden until it scrolls into view.
 */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
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
    return () => io.disconnect();
  }, []);

  return [ref, state] as const;
}

/** Fades a block up when it scrolls into view. */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, state] = useScrollReveal<HTMLDivElement>();
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

/**
 * A grid or row whose children fade up one after another when it scrolls
 * into view. Give each child `style={{ "--i": index }}` to set its place in
 * the sequence.
 */
export function RevealGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, state] = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`${className} ${state === "hidden" ? "rg-hidden" : state === "shown" ? "rg-shown" : ""}`}>
      {children}
    </div>
  );
}
