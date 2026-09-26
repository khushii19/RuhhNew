"use client";

import Link from "next/link";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export type ToastMessage = {
  text: string;
  /** A link ("View basket") or a button ("Undo") at the end of the toast. */
  action?: { label: string; href?: string; onClick?: () => void };
};

export function Toast({ message, onDone }: { message: ToastMessage | string | null; onDone: () => void }) {
  const msg = typeof message === "string" ? { text: message } : message;
  // Give people time to reach an action before it goes.
  const ms = msg?.action ? 4000 : 2000;
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [message, ms, onDone]);
  if (!msg) return null;
  const actionCls = "shrink-0 rounded-full px-2 py-0.5 font-semibold text-rose-deep underline-offset-2 hover:underline";
  // Portalled to <body> so no animated or transformed ancestor can become
  // its containing block and pin it inside a card.
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="m-toast fixed bottom-[calc(136px+env(safe-area-inset-bottom))] left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-surface py-2.5 pl-4 pr-3 text-[13px] text-ink shadow-[0_14px_30px_-14px_rgba(155,75,107,0.55)] md:bottom-10"
    >
      <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d6b3d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12l5 5L20 7" className="check-draw" />
      </svg>
      <span className="truncate">{msg.text}</span>
      {msg.action &&
        (msg.action.href ? (
          <Link href={msg.action.href} onClick={onDone} className={actionCls}>
            {msg.action.label}
          </Link>
        ) : (
          <button
            type="button"
            className={actionCls}
            onClick={() => {
              msg.action?.onClick?.();
              onDone();
            }}
          >
            {msg.action.label}
          </button>
        ))}
    </div>,
    document.body,
  );
}
