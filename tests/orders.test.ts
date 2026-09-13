import { describe, expect, it } from "vitest";
import { buildCustomerWhatsAppMessage, lineLabel, orderInputSchema } from "@/lib/orders";
import { normalizeSettings } from "@/lib/data";
import type { Order } from "@/lib/types";

const order: Order = {
  id: "o1",
  ref: "RUH-1042",
  status: "pending",
  mode: "delivery",
  customer_name: "Aisha Khan",
  phone: "050 123 4567",
  phone_normalized: "971501234567",
  address: "Villa 12, Street 4",
  zone_id: "z1",
  zone_name: "Jumeirah",
  slot_date: "2026-09-08",
  slot_label: "4 PM – 6 PM",
  notes: "No nuts please",
  is_gift: true,
  gift_recipient: "Mum",
  gift_message: "Happy birthday!",
  payment_method: "bank_transfer",
  payment_status: "unpaid",
  subtotal: 145,
  delivery_fee: 15,
  adjustment_aed: 0,
  adjustment_note: null,
  total: 160,
  whatsapp_updates: true,
  marketing_opt_in: true,
  created_at: "2026-09-07T06:00:00Z",
  updated_at: "2026-09-07T06:00:00Z",
  order_items: [
    { id: "i1", order_id: "o1", item_id: "m1", special_id: null, item_name: "Build Your Own Cookie Box", emoji: "🍪", size_label: "Box of 6", flavour_text: "4× Dark Chocolate Chip, 2× Milk Chocolate Chip", unit_price: 60, qty: 1, line_total: 60 },
    { id: "i2", order_id: "o1", item_id: "m2", special_id: null, item_name: "Classic Tiramisu", emoji: "☕", size_label: "500g", flavour_text: "", unit_price: 85, qty: 1, line_total: 85 },
  ],
};

describe("order helpers", () => {
  it("labels lines with flavour and size", () => {
    expect(lineLabel(order.order_items![0])).toBe("Build Your Own Cookie Box (4× Dark Chocolate Chip, 2× Milk Chocolate Chip, Box of 6)");
    expect(lineLabel({ item_name: "Tiramisu", size_label: "", flavour_text: "" })).toBe("Tiramisu");
  });

  it("builds the WhatsApp hand-off message with all order details", () => {
    const msg = buildCustomerWhatsAppMessage(order, normalizeSettings({ business_name: "Ruhh" }));
    expect(msg).toContain("Order RUH-1042");
    expect(msg).toContain("Delivery to: Villa 12, Street 4");
    expect(msg).toContain("Area: Jumeirah");
    expect(msg).toContain("☕ Classic Tiramisu (500g) x1 = AED 85");
    expect(msg).toContain("*Total: AED 160*");
    expect(msg).toContain("Payment: Bank transfer");
    expect(msg).toContain("🎁 Gift for: Mum");
    expect(msg).toContain("Special requests: No nuts please");
  });

  it("rejects malformed order input", () => {
    expect(orderInputSchema.safeParse({}).success).toBe(false);
    expect(
      orderInputSchema.safeParse({
        lines: [{ kind: "item", itemId: "not-a-uuid", qty: 1 }],
        mode: "pickup",
        customerName: "A",
        phone: "0501234567",
        slotDate: "2026-09-08",
        slotLabel: "10 AM – 12 PM",
        paymentMethod: "cash",
      }).success,
    ).toBe(false);
    expect(
      orderInputSchema.safeParse({
        lines: [{ kind: "item", itemId: "3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5b", sizeId: "3f2a1b4c-5d6e-4f70-8a9b-0c1d2e3f4a5c", qty: 2 }],
        mode: "pickup",
        customerName: "Aisha",
        phone: "0501234567",
        slotDate: "2026-09-08",
        slotLabel: "10 AM – 12 PM",
        paymentMethod: "cash",
      }).success,
    ).toBe(true);
  });
});
