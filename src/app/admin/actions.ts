"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env, isSupabaseConfigured } from "@/lib/env";
import { isAdminEmail, requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { serverClient } from "@/lib/supabase/server";
import { normalizeSettings } from "@/lib/data";
import { notifyStatus } from "@/lib/whatsapp";
import { headers } from "next/headers";
import { importExternalImage, isInHouse, MAX_UPLOAD, storeImage, toWebImage } from "@/lib/images";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "baking", "out_for_delivery", "ready_for_pickup", "delivered", "cancelled"];

function revalidateStore() {
  revalidatePath("/", "layout");
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const num = (fd: FormData, k: string, fallback = 0) => {
  const v = Number(fd.get(k));
  return Number.isFinite(v) ? v : fallback;
};
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

/* ---------------- auth ---------------- */

export async function sendMagicLink(fd: FormData) {
  const email = str(fd, "email").toLowerCase();
  if (!isSupabaseConfigured()) redirect("/admin/login?error=config");
  if (!email || !(await isAdminEmail(email))) redirect("/admin/login?error=denied");
  const supabase = await serverClient();
  const h = await headers();
  const origin = h.get("origin") ?? (h.get("host") ? `https://${h.get("host")}` : env.siteUrl);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/admin`, shouldCreateUser: true },
  });
  if (error) redirect("/admin/login?error=link");
  redirect(`/admin/login?sent=${encodeURIComponent(email)}`);
}

/* ---------------- orders ---------------- */

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  const session = await requireAdmin();
  if (!STATUSES.includes(status)) throw new Error("Bad status");
  const db = adminClient();
  const { data: order } = await db.from("orders").update({ status }).eq("id", orderId).select("*").single();
  if (!order) throw new Error("Order not found");
  await db.from("order_events").insert({ order_id: orderId, status, note: note || null, actor: session.email });
  const { data: settingsRow } = await db.from("settings").select("business_name").eq("id", 1).maybeSingle();
  const result = await notifyStatus(order as Order, status, settingsRow?.business_name ?? "Ruhh");
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  return { whatsapp: result };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: "unpaid" | "paid" | "refunded") {
  await requireAdmin();
  await adminClient().from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderAdjustment(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const db = adminClient();
  const { data: o } = await db.from("orders").select("subtotal").eq("id", id).maybeSingle();
  if (!o) return;
  const deliveryFee = Math.max(0, num(fd, "delivery_fee"));
  const adjustment = num(fd, "adjustment_aed");
  const total = Math.max(0, Number(o.subtotal) + deliveryFee + adjustment);
  await db
    .from("orders")
    .update({ delivery_fee: deliveryFee, adjustment_aed: adjustment, adjustment_note: str(fd, "adjustment_note") || null, total })
    .eq("id", id);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}

/* ---------------- categories ---------------- */

export async function saveCategory(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const row = {
    name: str(fd, "name"),
    sort_order: num(fd, "sort_order"),
    lead_time_hours: str(fd, "lead_time_hours") === "" ? null : num(fd, "lead_time_hours"),
  };
  if (!row.name) return;
  const db = adminClient();
  if (id) await db.from("categories").update(row).eq("id", id);
  else await db.from("categories").insert(row);
  revalidateStore();
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await adminClient().from("categories").delete().eq("id", str(fd, "id"));
  revalidateStore();
}

/* ---------------- menu items ---------------- */

export async function createMenuItem() {
  await requireAdmin();
  const db = adminClient();
  const { data: cat } = await db.from("categories").select("id").order("sort_order").limit(1).maybeSingle();
  const { data: item } = await db
    .from("menu_items")
    .insert({ name: "New item", category_id: cat?.id ?? null, is_available: false, sort_order: 99 })
    .select("id")
    .single();
  if (!item) throw new Error("Could not create item");
  await db.from("item_sizes").insert({ item_id: item.id, label: "Standard", piece_count: 1, price_aed: 0, sort_order: 1 });
  redirect(`/admin/menu/${item.id}`);
}

const sizeSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1).max(40),
  piece_count: z.coerce.number().int().min(1).max(500),
  price_aed: z.coerce.number().min(0).max(100000),
});

export async function saveMenuItem(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  if (!id) return;
  const db = adminClient();

  await db
    .from("menu_items")
    .update({
      name: str(fd, "name") || "Untitled",
      description: str(fd, "description"),
      emoji: str(fd, "emoji") || "🍰",
      category_id: str(fd, "category_id") || null,
      mixable: bool(fd, "mixable"),
      is_available: bool(fd, "is_available"),
      is_featured: bool(fd, "is_featured"),
      sort_order: num(fd, "sort_order"),
    })
    .eq("id", id);

  // Sizes: rows arrive as size_label[], size_count[], size_price[], size_id[]
  const labels = fd.getAll("size_label").map(String);
  const counts = fd.getAll("size_count").map(String);
  const prices = fd.getAll("size_price").map(String);
  const ids = fd.getAll("size_id").map(String);
  const sizes = labels
    .map((label, i) => sizeSchema.safeParse({ id: ids[i] || undefined, label, piece_count: counts[i], price_aed: prices[i] }))
    .filter((r) => r.success)
    .map((r) => r.data);
  const keepIds = sizes.map((s) => s.id).filter(Boolean) as string[];
  if (keepIds.length) await db.from("item_sizes").delete().eq("item_id", id).not("id", "in", `(${keepIds.join(",")})`);
  else await db.from("item_sizes").delete().eq("item_id", id);
  for (const [i, s] of sizes.entries()) {
    const row = { item_id: id, label: s.label, piece_count: s.piece_count, price_aed: s.price_aed, sort_order: i + 1 };
    if (s.id) await db.from("item_sizes").update(row).eq("id", s.id);
    else await db.from("item_sizes").insert(row);
  }
  if (!sizes.length) await db.from("item_sizes").insert({ item_id: id, label: "Standard", piece_count: 1, price_aed: 0, sort_order: 1 });

  // Flavours: comma-separated, replaced wholesale
  const flavours = str(fd, "flavours")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
  await db.from("item_flavours").delete().eq("item_id", id);
  if (flavours.length) await db.from("item_flavours").insert(flavours.map((name, i) => ({ item_id: id, name, sort_order: i + 1 })));

  revalidateStore();
  redirect(`/admin/menu/${id}?saved=1`);
}

export async function deleteMenuItem(fd: FormData) {
  await requireAdmin();
  await adminClient().from("menu_items").delete().eq("id", str(fd, "id"));
  revalidateStore();
  redirect("/admin/menu");
}

export async function toggleItemAvailability(id: string, available: boolean) {
  await requireAdmin();
  await adminClient().from("menu_items").update({ is_available: available }).eq("id", id);
  revalidateStore();
}

/* ---------------- images ---------------- */

async function uploadToStorage(file: File, folder: string, keepAlpha = false): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > MAX_UPLOAD) throw new Error("Image must be under 8 MB.");
  const web = await toWebImage(Buffer.from(await file.arrayBuffer()), { keepAlpha, maxDim: keepAlpha ? 600 : 1400 });
  return storeImage(web.buffer, web.contentType, web.ext, folder);
}

/**
 * Copies externally hosted photos (e.g. the seeded launch set) into Supabase
 * storage at web size, a few per call so it fits a serverless timeout.
 */
export async function importExternalPhotos(limit = 3): Promise<{ done: number; remaining: number; errors: string[] }> {
  await requireAdmin();
  const db = adminClient();
  const errors: string[] = [];
  let done = 0;
  const [{ data: items }, { data: specials }, { data: settings }] = await Promise.all([
    db.from("menu_items").select("id, name, image_url").not("image_url", "is", null),
    db.from("specials").select("id, name, image_url").not("image_url", "is", null),
    db.from("settings").select("hero_image_url, about_image_url, logo_url").eq("id", 1).maybeSingle(),
  ]);
  type Job = { label: string; url: string; apply: (u: string) => Promise<unknown> };
  const jobs: Job[] = [];
  for (const m of items ?? []) if (!isInHouse(m.image_url)) jobs.push({ label: m.name, url: m.image_url, apply: async (u) => { await db.from("menu_items").update({ image_url: u }).eq("id", m.id); } });
  for (const sp of specials ?? []) if (!isInHouse(sp.image_url)) jobs.push({ label: `Special: ${sp.name}`, url: sp.image_url, apply: async (u) => { await db.from("specials").update({ image_url: u }).eq("id", sp.id); } });
  for (const f of ["hero_image_url", "about_image_url", "logo_url"] as const) {
    const url = settings?.[f];
    if (url && !isInHouse(url)) jobs.push({ label: f, url, apply: async (u) => { await db.from("settings").update({ [f]: u }).eq("id", 1); } });
  }
  for (const job of jobs.slice(0, limit)) {
    try {
      const u = await importExternalImage(job.url, job.label === "logo_url" ? "brand" : "items", job.label === "logo_url");
      await job.apply(u);
      done++;
    } catch (e) {
      errors.push(`${job.label}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }
  revalidateStore();
  return { done, remaining: Math.max(0, jobs.length - done), errors };
}

export async function uploadItemPhoto(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const file = fd.get("photo");
  if (!id || !(file instanceof File) || file.size === 0) return;
  const url = await uploadToStorage(file, "items");
  await adminClient().from("menu_items").update({ image_url: url }).eq("id", id);
  revalidateStore();
}

export async function removeItemPhoto(fd: FormData) {
  await requireAdmin();
  await adminClient().from("menu_items").update({ image_url: null }).eq("id", str(fd, "id"));
  revalidateStore();
}

export async function uploadLogo(fd: FormData) {
  await requireAdmin();
  const file = fd.get("logo");
  if (!(file instanceof File) || file.size === 0) return;
  const url = await uploadToStorage(file, "brand", true);
  await adminClient().from("settings").update({ logo_url: url }).eq("id", 1);
  revalidateStore();
}

export async function uploadSettingImage(fd: FormData) {
  await requireAdmin();
  const field = str(fd, "field");
  if (field !== "hero_image_url" && field !== "about_image_url") return;
  const file = fd.get("image");
  if (!(file instanceof File) || file.size === 0) return;
  const url = await uploadToStorage(file, "brand");
  await adminClient().from("settings").update({ [field]: url }).eq("id", 1);
  revalidateStore();
}

export async function removeSettingImage(fd: FormData) {
  await requireAdmin();
  const field = str(fd, "field");
  if (field !== "hero_image_url" && field !== "about_image_url") return;
  await adminClient().from("settings").update({ [field]: null }).eq("id", 1);
  revalidateStore();
}

export async function removeLogo() {
  await requireAdmin();
  await adminClient().from("settings").update({ logo_url: null }).eq("id", 1);
  revalidateStore();
}

/* ---------------- specials ---------------- */

export async function saveSpecial(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const row = {
    name: str(fd, "name") || "New special",
    description: str(fd, "description"),
    emoji: str(fd, "emoji") || "✨",
    price_aed: num(fd, "price_aed"),
    old_price_aed: str(fd, "old_price_aed") === "" ? null : num(fd, "old_price_aed"),
    tag: str(fd, "tag") || null,
    accent: (["rose", "lav", "sage", "peach"].includes(str(fd, "accent")) ? str(fd, "accent") : "rose") as "rose" | "lav" | "sage" | "peach",
    is_active: bool(fd, "is_active"),
    sort_order: num(fd, "sort_order"),
  };
  const db = adminClient();
  if (id) await db.from("specials").update(row).eq("id", id);
  else await db.from("specials").insert(row);
  revalidateStore();
}

export async function deleteSpecial(fd: FormData) {
  await requireAdmin();
  await adminClient().from("specials").delete().eq("id", str(fd, "id"));
  revalidateStore();
}

/* ---------------- zones ---------------- */

export async function saveZone(fd: FormData) {
  await requireAdmin();
  const id = str(fd, "id");
  const row = {
    name: str(fd, "name"),
    fee_aed: num(fd, "fee_aed"),
    min_order_aed: num(fd, "min_order_aed"),
    is_active: bool(fd, "is_active"),
    sort_order: num(fd, "sort_order"),
  };
  if (!row.name) return;
  const db = adminClient();
  if (id) await db.from("delivery_zones").update(row).eq("id", id);
  else await db.from("delivery_zones").insert(row);
  revalidateStore();
}

export async function deleteZone(fd: FormData) {
  await requireAdmin();
  await adminClient().from("delivery_zones").delete().eq("id", str(fd, "id"));
  revalidateStore();
}

/* ---------------- settings ---------------- */

export async function saveSettings(fd: FormData) {
  await requireAdmin();
  const slots = str(fd, "slots")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const closedWeekdays = [0, 1, 2, 3, 4, 5, 6].filter((d) => fd.get(`closed_${d}`) === "on");
  const closedDates = str(fd, "closed_dates")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  const row = {
    business_name: str(fd, "business_name") || "Ruhh",
    tagline: str(fd, "tagline"),
    owner_name: str(fd, "owner_name") || "Shweta",
    about_text: str(fd, "about_text"),
    whatsapp_number: str(fd, "whatsapp_number").replace(/[^0-9]/g, ""),
    instagram_handle: str(fd, "instagram_handle").replace(/^@/, "") || null,
    pickup_address: str(fd, "pickup_address") || null,
    bank_details: str(fd, "bank_details") || null,
    closed_weekdays: closedWeekdays,
    closed_dates: closedDates,
    slots: slots.length ? slots : normalizeSettings(null).slots,
    daily_order_cap: str(fd, "daily_order_cap") === "" ? null : Math.max(1, num(fd, "daily_order_cap", 1)),
    slot_capacity: str(fd, "slot_capacity") === "" ? null : Math.max(1, num(fd, "slot_capacity", 1)),
    tax_note: str(fd, "tax_note") || null,
    default_lead_time_hours: Math.max(0, num(fd, "default_lead_time_hours", 24)),
    free_delivery_over: str(fd, "free_delivery_over") === "" ? null : num(fd, "free_delivery_over"),
    accept_cash: bool(fd, "accept_cash"),
    accept_bank_transfer: bool(fd, "accept_bank_transfer"),
  };
  await adminClient().from("settings").update(row).eq("id", 1);
  revalidateStore();
  redirect("/admin/settings?saved=1");
}

/* ---------------- reviews & enquiries ---------------- */

export async function setReviewApproval(id: string, approved: boolean) {
  await requireAdmin();
  await adminClient().from("reviews").update({ is_approved: approved }).eq("id", id);
  revalidateStore();
}

export async function deleteReview(fd: FormData) {
  await requireAdmin();
  await adminClient().from("reviews").delete().eq("id", str(fd, "id"));
  revalidateStore();
}

export async function updateEnquiry(fd: FormData) {
  await requireAdmin();
  const status = str(fd, "status");
  if (!["new", "quoted", "confirmed", "closed"].includes(status)) return;
  await adminClient().from("enquiries").update({ status, admin_notes: str(fd, "admin_notes") || null }).eq("id", str(fd, "id"));
  revalidatePath("/admin/enquiries");
}

/* ---------------- admins ---------------- */

export async function addAdmin(fd: FormData) {
  const session = await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  if (!z.string().email().safeParse(email).success) return;
  await adminClient().from("admin_users").upsert({ email, name: str(fd, "name") || null, added_by: session.email }, { onConflict: "email" });
  revalidatePath("/admin/admins");
}

export async function removeAdmin(fd: FormData) {
  const session = await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  if (email === session.email) return; // cannot remove yourself
  await adminClient().from("admin_users").delete().eq("email", email);
  revalidatePath("/admin/admins");
}
