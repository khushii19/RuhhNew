"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, updatePaymentStatus } from "@/app/admin/actions";
import { STATUS_LABELS, type FulfilmentMode, type OrderStatus, type PaymentStatus } from "@/lib/types";

const FLOW: Record<FulfilmentMode, OrderStatus[]> = {
  delivery: ["pending", "confirmed", "baking", "out_for_delivery", "delivered"],
  pickup: ["pending", "confirmed", "baking", "ready_for_pickup", "delivered"],
};

export function nextStatus(mode: FulfilmentMode, current: OrderStatus): OrderStatus | null {
  const flow = FLOW[mode];
  const i = flow.indexOf(current);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1] : null;
}

export function OrderControls({ orderId, mode, status, paymentStatus, compact = false }: { orderId: string; mode: FulfilmentMode; status: OrderStatus; paymentStatus: PaymentStatus; compact?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const next = nextStatus(mode, status);

  function setStatus(s: OrderStatus) {
    if (s === "cancelled" && !confirm("Cancel this order? The customer will be notified if WhatsApp updates are on.")) return;
    start(async () => {
      const r = await updateOrderStatus(orderId, s);
      setMsg(r.whatsapp.ok ? "Customer notified on WhatsApp" : r.whatsapp.error === "skipped" ? "" : `Saved (WhatsApp: ${r.whatsapp.error})`);
      setTimeout(() => setMsg(""), 4000);
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-2"}`}>
      {next && status !== "cancelled" && (
        <button className="btn-p px-3 py-1.5 text-[12px]" disabled={pending} onClick={() => setStatus(next)}>
          → {STATUS_LABELS[next]}
        </button>
      )}
      <select
        aria-label="Set status"
        className="admin-input w-auto py-1.5 text-[12px]"
        value={status}
        disabled={pending}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
      >
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {!compact && (
        <select
          aria-label="Payment status"
          className="admin-input w-auto py-1.5 text-[12px]"
          value={paymentStatus}
          disabled={pending}
          onChange={(e) => start(() => updatePaymentStatus(orderId, e.target.value as PaymentStatus))}
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      )}
      {msg && <span className="text-[11px] text-sage-deep">{msg}</span>}
    </div>
  );
}
