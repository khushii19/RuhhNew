import type { Metadata } from "next";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { TrackView } from "@/components/views/track-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage() {
  // The menu lets "Order again" re-add past bakes at today's prices.
  const [settings, items, categories] = await Promise.all([getSettings(), getMenu(), getCategories()]);
  return <TrackView settings={settings} items={items} categories={categories} />;
}
