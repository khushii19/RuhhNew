import type { FulfilmentMode, OrderStatus } from "@/lib/types";

/**
 * The four customer-facing steps of an order and how far along it is.
 * `index` is the current step; it is `steps.length` once the order is
 * delivered (every step done) and -1 when it was cancelled.
 */
export function trackSteps(status: OrderStatus, mode: FulfilmentMode) {
  const steps =
    mode === "pickup" ? ["Confirmed", "Baking", "Ready for pickup", "Collected"] : ["Confirmed", "Baking", "On the way", "Delivered"];
  const index: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    baking: 1,
    out_for_delivery: 2,
    ready_for_pickup: 2,
    delivered: 4,
    cancelled: -1,
  };
  return { steps, index: index[status] };
}

export function isFinished(status: OrderStatus) {
  return status === "delivered" || status === "cancelled";
}
