import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { CustomCakesView } from "@/components/views/custom-cakes-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Custom cakes" };

export default async function CustomCakesPage() {
  const settings = await getSettings();
  return <CustomCakesView settings={settings} />;
}
