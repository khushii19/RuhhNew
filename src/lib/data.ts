import { publicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/env";
import type { Category, DeliveryZone, MenuItem, Review, Settings, Special } from "@/lib/types";
import { SEED_ABOUT, SEED_HERO, seedPhoto } from "@/lib/seed-photos";

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  business_name: "Ruhh",
  tagline: "Baked to perfection · est. 2019",
  owner_name: "Shweta",
  about_text:
    "Ruhh means soul, and that is what Shweta puts into every recipe. Baking from the heart since 2019, made slowly and from scratch.",
  whatsapp_number: "",
  instagram_handle: null,
  pickup_address: null,
  logo_url: null,
  hero_image_url: null,
  about_image_url: null,
  bank_details: null,
  closed_weekdays: [],
  closed_dates: [],
  slots: ["10 AM – 12 PM", "12 PM – 2 PM", "2 PM – 4 PM", "4 PM – 6 PM", "6 PM – 8 PM"],
  daily_order_cap: null,
  slot_capacity: null,
  tax_note: null,
  default_lead_time_hours: 24,
  free_delivery_over: null,
  accept_cash: true,
  accept_bank_transfer: true,
  updated_at: new Date(0).toISOString(),
};

export function normalizeSettings(row: Partial<Settings> | null | undefined): Settings {
  const s = { ...DEFAULT_SETTINGS, ...(row ?? {}) } as Settings;
  s.slots = Array.isArray(s.slots) ? s.slots.map(String) : DEFAULT_SETTINGS.slots;
  s.closed_weekdays = Array.isArray(s.closed_weekdays) ? s.closed_weekdays.map(Number) : [];
  s.closed_dates = Array.isArray(s.closed_dates) ? s.closed_dates.map(String) : [];
  s.free_delivery_over = s.free_delivery_over == null ? null : Number(s.free_delivery_over);
  return s;
}

export async function getSettings(): Promise<Settings> {
  if (!isSupabaseConfigured()) return normalizeSettings(null);
  const { data } = await publicClient().from("settings").select("*").eq("id", 1).maybeSingle();
  const s = normalizeSettings(data);
  // Storefront only: the admin form reads normalizeSettings directly, so it
  // still shows an empty photo slot instead of saving the launch photo back.
  if (data) {
    s.hero_image_url ||= SEED_HERO;
    s.about_image_url ||= SEED_ABOUT;
  }
  return s;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient().from("categories").select("*").order("sort_order");
  return (data ?? []) as Category[];
}

function sortItem(m: MenuItem): MenuItem {
  return {
    ...m,
    image_url: m.image_url || seedPhoto(m.name),
    item_sizes: [...(m.item_sizes ?? [])]
      .map((s) => ({ ...s, price_aed: Number(s.price_aed) }))
      .sort((a, b) => a.sort_order - b.sort_order),
    item_flavours: [...(m.item_flavours ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export const ITEM_SELECT = "*, item_sizes(*), item_flavours(*)";

export async function getMenu(): Promise<MenuItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient()
    .from("menu_items")
    .select(ITEM_SELECT)
    .eq("is_available", true)
    .order("sort_order");
  return ((data ?? []) as MenuItem[]).map(sortItem);
}

export async function getSpecials(): Promise<Special[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient()
    .from("specials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return ((data ?? []) as Special[]).map((s) => ({
    ...s,
    image_url: s.image_url || seedPhoto(s.name),
    price_aed: Number(s.price_aed),
    old_price_aed: s.old_price_aed == null ? null : Number(s.old_price_aed),
  }));
}

export async function getZones(): Promise<DeliveryZone[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient()
    .from("delivery_zones")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return ((data ?? []) as DeliveryZone[]).map((z) => ({
    ...z,
    fee_aed: Number(z.fee_aed),
    min_order_aed: Number(z.min_order_aed),
  }));
}

export async function getApprovedReviews(limit = 20): Promise<Review[]> {
  if (!isSupabaseConfigured()) return [];
  const { data } = await publicClient()
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Review[];
}

export function itemMinPrice(m: MenuItem) {
  return m.item_sizes.length ? Math.min(...m.item_sizes.map((s) => Number(s.price_aed))) : 0;
}

export function itemHasOptions(m: MenuItem) {
  return m.item_flavours.length > 0 || m.item_sizes.length > 1;
}

export function getFeatured(items: MenuItem[], n = 4): MenuItem[] {
  const featured = items.filter((m) => m.is_featured);
  const withPhoto = items.filter((m) => !m.is_featured && m.image_url);
  return [...featured, ...withPhoto].slice(0, n);
}

/**
 * One representative image per category. Prefers a photo not in `exclude`
 * (photos already shown elsewhere on the page), so the home page does not
 * repeat the same bake in several sections; falls back to any photo.
 */
export function categoryCover(items: MenuItem[], categoryId: string, exclude: ReadonlySet<string> = new Set()): string | null {
  const photos = items.filter((m) => m.category_id === categoryId && m.image_url).map((m) => m.image_url!);
  return photos.find((u) => !exclude.has(u)) ?? photos[0] ?? null;
}

export function categoryLeadTime(cat: Category | undefined, settings: Settings) {
  return cat?.lead_time_hours ?? settings.default_lead_time_hours;
}
