"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const noop = () => () => {};

/**
 * The one dialog shell for the storefront: a bottom sheet on phones and a
 * centred card from `sm` up, under the first build's pastel top bar.
 * Focus stays inside while it is open and returns to the opener after,
 * Escape and the backdrop close it, the page behind cannot scroll, and on
 * phones it can be dragged down by its handle to close.
 */
export function Sheet({
  labelledBy,
  onClose,
  children,
  footer,
}: {
  labelledBy: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Pinned under the scrolling content, e.g. the price and add button. */
  footer?: React.ReactNode;
}) {
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!mounted) return;
    const opener = document.activeElement as HTMLElement | null;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [mounted]);

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { y: e.clientY, dy: 0 };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !panel.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    panel.current.style.transform = `translateY(${drag.current.dy}px)`;
  }
  function onPointerUp() {
    if (!drag.current || !panel.current) return;
    const { dy } = drag.current;
    drag.current = null;
    if (dy > 90) close.current();
    else panel.current.style.transform = "";
  }

  if (!mounted) return null;
  return createPortal(
    <div
      className="m-fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={(e) => e.target === e.currentTarget && close.current()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="m-sheet relative flex max-h-[92dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[22px] bg-surface shadow-[0_-20px_50px_-30px_rgba(155,75,107,0.6)] transition-transform duration-200 sm:rounded-[16px]"
      >
        <div aria-hidden className="h-1.5 shrink-0 bg-gradient-to-r from-rose via-lav to-peach" />
        {/* Drag handle: phones only. */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-1.5 z-20 flex h-6 cursor-grab touch-none justify-center pt-2 sm:hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className="h-1 w-10 rounded-full bg-ink/20" />
        </div>
        <button
          type="button"
          onClick={() => close.current()}
          aria-label="Close"
          className="absolute right-3 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-[22px] leading-none text-ink shadow-sm backdrop-blur hover:bg-rose"
        >
          ×
        </button>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-line bg-surface px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
