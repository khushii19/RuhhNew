import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeSettings, ITEM_SELECT } from "@/lib/data";
import { isDateAllowed } from "@/lib/availability";
import { isValidPhone, normalizePhone } from "@/lib/format";
import type { Category, DeliveryZone, MenuItem, Order, OrderItem, Settings, Special } from "@/lib/types";

export const cartLineSchema = z.object({
  kind: z.enum(["item", "special"]),
  itemId: z.string().uuid().optional(),
  sizeId: z.string().uuid().optional(),
  specialId: z.string().uuid().optional(),
  flavour: z.string().max(80).optional(),
  mix: z.record(z.string().max(80), z.number().int().min(0).max(50)).optional(),
  qty: z.number().int().min(1).max(50),
});

export const orderInputSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(40),
  mode: z.enum(["delivery", "pickup"]),
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(25),
  address: z.string().trim().max(300).optional(),
  zoneId: z.string().uuid().optional(),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotLabel: z.string().trim().min(1).max(40),
  notes: z.string().trim().max(500).optional(),
  isGift: z.boolean().optional(),
  giftRecipient: z.string().trim().max(80).optional(),
  giftMessage: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(["cash", "bank_transfer"]),
  whatsappUpdates: z.boolean().optional(),
  marketingOptIn: z.boolean().optional(),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export class OrderError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
  }
}

interface PricedLine {
  item_id: string | null;
  special_id: string | null;
  item_name: string;
  emoji: string;
  size_label: string;
  flavour_text: string;
  unit_price: number;
  qty: number;
  line_total: number;
  lead_time_hours: number;
}

/**
 * Re-prices every cart line from the database and validates options.
 * The client's snapshot prices are never trusted.
 */
export async function priceLines(
  lines: OrderInput["lines"],
  settings: Settings,
): Promise<{ lines: PricedLine[]; subtotal: number; leadHours: number }> {
  const db = adminClient();
  const itemIds = [...new Set(lines.filter((l) => l.kind === "item").map((l) => l.itemId!).filter(Boolean))];
  const specialIds = [...new Set(lines.filter((l) => l.kind === "special").map((l) => l.specialId!).filter(Boolean))];

  const [{ data: items }, { data: specials }, { data: cats }] = await Promise.all([
    itemIds.length
      ? db.from("menu_items").select(ITEM_SELECT).in("id", itemIds)
      : Promise.resolve({ data: [] as MenuItem[] }),
    specialIds.length
      ? db.from("specials").select("*").in("id", specialIds)
      : Promise.resolve({ data: [] as Special[] }),
    db.from("categories").select("*"),
  ]);
  const itemMap = new Map((items as MenuItem[] | null)?.map((i) => [i.id, i]) ?? []);
  const specialMap = new Map((specials as Special[] | null)?.map((s) => [s.id, s]) ?? []);
  const catMap = new Map((cats as Category[] | null)?.map((c) => [c.id, c]) ?? []);

  const priced: PricedLine[] = [];
  let leadHours = 0;

  for (const l of lines) {
    if (l.kind === "special") {
      const s = l.specialId ? specialMap.get(l.specialId) : undefined;
      if (!s || !s.is_active) throw new OrderError("A special in your cart is no longer available.");
      const unit = Number(s.price_aed);
      priced.push({
        item_id: null,
        special_id: s.id,
        item_name: s.name,
        emoji: s.emoji,
        size_label: "",
        flavour_text: "",
        unit_price: unit,
        qty: l.qty,
        line_total: unit * l.qty,
        lead_time_hours: settings.default_lead_time_hours,
      });
      leadHours = Math.max(leadHours, settings.default_lead_time_hours);
      continue;
    }

    const m = l.itemId ? itemMap.get(l.itemId) : undefined;
    if (!m || !m.is_available) throw new OrderError("An item in your cart is no longer available.");
    const size = m.item_sizes.find((s) => s.id === l.sizeId) ?? (m.item_sizes.length === 1 ? m.item_sizes[0] : undefined);
    if (!size) throw new OrderError(`Please choose a size for ${m.name}.`);
    const unit = Number(size.price_aed);
    if (unit <= 0) throw new OrderError(`${m.name} is not priced yet. Please ask on WhatsApp.`);

    const flavourNames = m.item_flavours.map((f) => f.name);
    const mixMode = m.mixable && flavourNames.length > 0 && size.piece_count > 1;
    let flavourText = "";
    if (mixMode) {
      const mix = l.mix ?? {};
      const keys = Object.keys(mix).filter((k) => mix[k] > 0);
      if (keys.some((k) => !flavourNames.includes(k))) throw new OrderError(`Unknown flavour for ${m.name}.`);
      const sum = keys.reduce((a, k) => a + mix[k], 0);
      if (sum !== size.piece_count) {
        throw new OrderError(`${m.name} (${size.label}) must have exactly ${size.piece_count} pieces chosen.`);
      }
      flavourText = keys.map((k) => `${mix[k]}× ${k}`).join(", ");
    } else if (flavourNames.length) {
      if (!l.flavour || !flavourNames.includes(l.flavour)) throw new OrderError(`Please choose a flavour for ${m.name}.`);
      flavourText = l.flavour;
    }

    const cat = m.category_id ? catMap.get(m.category_id) : undefined;
    const lead = cat?.lead_time_hours ?? settings.default_lead_time_hours;
    leadHours = Math.max(leadHours, lead);
    priced.push({
      item_id: m.id,
      special_id: null,
      item_name: m.name,
      emoji: m.emoji,
      size_label: size.label,
      flavour_text: flavourText,
      unit_price: unit,
      qty: l.qty,
      line_total: unit * l.qty,
      lead_time_hours: lead,
    });
  }

  const subtotal = priced.reduce((a, p) => a + p.line_total, 0);
  return { lines: priced, subtotal, leadHours };
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const db = adminClient();
  const { data: settingsRow } = await db.from("settings").select("*").eq("id", 1).maybeSingle();
  const settings = normalizeSettings(settingsRow);

  if (!isValidPhone(input.phone)) throw new OrderError("Please enter a valid WhatsApp number.", "phone");
  if (!settings.slots.includes(input.slotLabel)) throw new OrderError("Please pick a valid time slot.", "slot");
  if (input.paymentMethod === "cash" && !settings.accept_cash) throw new OrderError("Cash is not accepted right now.", "payment");
  if (input.paymentMethod === "bank_transfer" && !settings.accept_bank_transfer) {
    throw new OrderError("Bank transfer is not accepted right now.", "payment");
  }

  const { lines, subtotal, leadHours } = await priceLines(input.lines, settings);

  if (!isDateAllowed(input.slotDate, leadHours, settings)) {
    throw new OrderError(
      `That date is not available. Items in your cart need ${leadHours} hours notice and we may be closed that day.`,
      "date",
    );
  }

  if (settings.slot_capacity) {
    const { count } = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("slot_date", input.slotDate)
      .eq("slot_label", input.slotLabel)
      .neq("status", "cancelled");
    if ((count ?? 0) >= settings.slot_capacity) {
      throw new OrderError("That time slot is full. Please choose another slot.", "slot");
    }
  }

  if (settings.daily_order_cap) {
    const { count } = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("slot_date", input.slotDate)
      .neq("status", "cancelled");
    if ((count ?? 0) >= settings.daily_order_cap) {
      throw new OrderError("We are fully booked for that date. Please choose another day.", "date");
    }
  }

  let deliveryFee = 0;
  let zone: DeliveryZone | null = null;
  if (input.mode === "delivery") {
    if (!input.address) throw new OrderError("Please add a delivery address.", "address");
    if (!input.zoneId) throw new OrderError("Please choose your delivery area.", "zone");
    const { data: z } = await db.from("delivery_zones").select("*").eq("id", input.zoneId).eq("is_active", true).maybeSingle();
    if (!z) throw new OrderError("Please choose your delivery area.", "zone");
    zone = { ...z, fee_aed: Number(z.fee_aed), min_order_aed: Number(z.min_order_aed) } as DeliveryZone;
    if (subtotal < zone.min_order_aed) {
      throw new OrderError(`Minimum order for ${zone.name} is AED ${zone.min_order_aed}.`, "zone");
    }
    deliveryFee = zone.fee_aed;
    if (settings.free_delivery_over != null && subtotal >= settings.free_delivery_over) deliveryFee = 0;
  }

  const total = subtotal + deliveryFee;

  const { data: order, error } = await db
    .from("orders")
    .insert({
      mode: input.mode,
      customer_name: input.customerName,
      phone: input.phone,
      phone_normalized: normalizePhone(input.phone),
      address: input.mode === "delivery" ? input.address : null,
      zone_id: zone?.id ?? null,
      zone_name: zone?.name ?? null,
      slot_date: input.slotDate,
      slot_label: input.slotLabel,
      notes: input.notes || null,
      is_gift: Boolean(input.isGift),
      gift_recipient: input.isGift ? input.giftRecipient || null : null,
      gift_message: input.isGift ? input.giftMessage || null : null,
      payment_method: input.paymentMethod,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      whatsapp_updates: input.whatsappUpdates ?? true,
      marketing_opt_in: input.marketingOptIn ?? true,
    })
    .select("*")
    .single();
  if (error || !order) throw new OrderError("Could not save your order. Please try again.");

  const { data: savedItems, error: itemsError } = await db
    .from("order_items")
    .insert(
      lines.map((l) => ({
        order_id: order.id,
        item_id: l.item_id,
        special_id: l.special_id,
        item_name: l.item_name,
        emoji: l.emoji,
        size_label: l.size_label,
        flavour_text: l.flavour_text,
        unit_price: l.unit_price,
        qty: l.qty,
        line_total: l.line_total,
      })),
    )
    .select("*");
  if (itemsError) {
    await db.from("orders").delete().eq("id", order.id);
    throw new OrderError("Could not save your order. Please try again.");
  }
  await db.from("order_events").insert({ order_id: order.id, status: "pending", actor: "customer" });

  return { ...(order as Order), order_items: (savedItems ?? []) as OrderItem[] };
}

export function lineLabel(i: Pick<OrderItem, "item_name" | "size_label" | "flavour_text">) {
  const extra = [i.flavour_text, i.size_label].filter(Boolean).join(", ");
  return extra ? `${i.item_name} (${extra})` : i.item_name;
}

/** WhatsApp text the customer sends to the bakery after placing an order. */
export function buildCustomerWhatsAppMessage(o: Order, settings: Settings) {
  const items = (o.order_items ?? [])
    .map((i) => `• ${i.emoji} ${lineLabel(i)} x${i.qty} = AED ${Number(i.line_total)}`)
    .join("\n");
  const when = `${new Date(o.slot_date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}, ${o.slot_label}`;
  let msg = `*New order for ${settings.business_name}!*\nOrder ${o.ref}\n\nName: ${o.customer_name}\nWhatsApp: ${o.phone}\n`;
  msg += o.mode === "delivery" ? `Delivery to: ${o.address}\nArea: ${o.zone_name}\n` : `Pickup\n`;
  msg += `When: ${when}\n\n*Items:*\n${items}\n\nSubtotal: AED ${Number(o.subtotal)}\nDelivery: ${Number(o.delivery_fee) ? "AED " + Number(o.delivery_fee) : "Free"}\n*Total: AED ${Number(o.total)}*\nPayment: ${o.payment_method === "cash" ? "Cash" : "Bank transfer"}\n`;
  if (settings.tax_note) msg += `${settings.tax_note}\n`;
  if (o.is_gift) msg += `\n🎁 Gift for: ${o.gift_recipient || "-"}\nCard message: ${o.gift_message || "-"}\n`;
  if (o.notes) msg += `\nSpecial requests: ${o.notes}\n`;
  msg += `\nPlease confirm. Thank you!`;
  return msg;
}
