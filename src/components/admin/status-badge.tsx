import { STATUS_LABELS, type OrderStatus, type PaymentStatus } from "@/lib/types";

const COLORS: Record<OrderStatus, string> = {
  pending: "bg-peach text-peach-deep",
  confirmed: "bg-lav text-lav-deep",
  baking: "bg-rose text-rose-deep",
  out_for_delivery: "bg-sage text-sage-deep",
  ready_for_pickup: "bg-sage text-sage-deep",
  delivered: "bg-sage-deep text-on-accent",
  cancelled: "bg-danger/15 text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`tag ${COLORS[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const c = status === "paid" ? "bg-sage text-sage-deep" : status === "refunded" ? "bg-lav text-lav-deep" : "bg-cream2 text-muted";
  return <span className={`tag ${c}`}>{status}</span>;
}
