"use client";

import { useEffect } from "react";

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="m-toast fixed bottom-[76px] left-1/2 z-40 flex items-center gap-2 rounded-full bg-ink/90 px-4 py-2 text-[12px] text-white shadow-lg"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8cbf8c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12l5 5L20 7" className="check-draw" />
      </svg>
      {message}
    </div>
  );
}
