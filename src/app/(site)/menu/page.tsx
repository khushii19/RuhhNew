import type { Metadata } from "next";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { MenuView } from "@/components/views/menu-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const [items, categories, settings] = await Promise.all([getMenu(), getCategories(), getSettings()]);
  return <MenuView items={items} categories={categories} settings={settings} />;
}
