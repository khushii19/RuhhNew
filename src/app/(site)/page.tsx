import { getCategories, getMenu, getSettings, getSpecials } from "@/lib/data";
import { HomeView } from "@/components/views/home-view";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, specials, items, categories] = await Promise.all([getSettings(), getSpecials(), getMenu(), getCategories()]);
  return <HomeView settings={settings} specials={specials} items={items} categories={categories} />;
}
