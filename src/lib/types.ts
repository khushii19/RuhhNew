export type Accent = "rose" | "lav" | "sage" | "peach";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "baking"
  | "out_for_delivery"
  | "ready_for_pickup"
  | "delivered"
  | "cancelled";

export type FulfilmentMode = "delivery" | "pickup";
export type PaymentMethod = "cash" | "bank_transfer" | "card";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Settings {
  id: number;
  business_name: string;
  tagline: string;
  owner_name: string;
  about_text: string;
  whatsapp_number: string;
  instagram_handle: string | null;
  pickup_address: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  about_image_url: string | null;
  bank_details: string | null;
  closed_weekdays: number[];
  closed_dates: string[];
  slots: string[];
  daily_order_cap: number | null;
  slot_capacity: number | null;
  tax_note: string | null;
  default_lead_time_hours: number;
  free_delivery_over: number | null;
  accept_cash: boolean;
  accept_bank_transfer: boolean;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  lead_time_hours: number | null;
}

export interface ItemSize {
  id: string;
  item_id: string;
  label: string;
  piece_count: number;
  price_aed: number;
  sort_order: number;
}

export interface ItemFlavour {
  id: string;
  item_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  emoji: string;
  image_url: string | null;
  mixable: boolean;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  item_sizes: ItemSize[];
  item_flavours: ItemFlavour[];
}

export interface Special {
  id: string;
  name: string;
  description: string;
  emoji: string;
  price_aed: number;
  old_price_aed: number | null;
  tag: string | null;
  accent: Accent;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee_aed: number;
  min_order_aed: number;
  is_active: boolean;
  sort_order: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string | null;
  special_id: string | null;
  item_name: string;
  emoji: string;
  size_label: string;
  flavour_text: string;
  unit_price: number;
  qty: number;
  line_total: number;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  actor: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  ref: string;
  status: OrderStatus;
  mode: FulfilmentMode;
  customer_name: string;
  phone: string;
  phone_normalized: string;
  address: string | null;
  zone_id: string | null;
  zone_name: string | null;
  slot_date: string;
  slot_label: string;
  notes: string | null;
  is_gift: boolean;
  gift_recipient: string | null;
  gift_message: string | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  delivery_fee: number;
  adjustment_aed: number;
  adjustment_note: string | null;
  total: number;
  whatsapp_updates: boolean;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_events?: OrderEvent[];
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  occasion: string | null;
  event_date: string | null;
  servings: string | null;
  description: string;
  budget_aed: number | null;
  reference_image_url: string | null;
  status: "new" | "quoted" | "confirmed" | "closed";
  admin_notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  rating: number;
  body: string;
  order_ref: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  added_by: string | null;
  created_at: string;
}

/** A line in the client-side cart. Prices are re-computed on the server. */
export interface CartLine {
  key: string;
  kind: "item" | "special";
  itemId?: string;
  sizeId?: string;
  specialId?: string;
  flavour?: string;
  /** flavour name → count, for mix-your-box sizes */
  mix?: Record<string, number>;
  qty: number;
  // display snapshot
  name: string;
  emoji: string;
  sizeLabel: string;
  unitPrice: number;
  leadTimeHours: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Received",
  confirmed: "Confirmed",
  baking: "Baking",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash on delivery / pickup",
  bank_transfer: "Bank transfer",
  card: "Card",
};
