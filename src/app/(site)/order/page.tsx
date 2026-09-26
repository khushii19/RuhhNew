import type { Metadata } from "next";
import { getSettings, getZones } from "@/lib/data";
import { OrderView } from "@/components/views/order-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Basket" };

export default async function OrderPage() {
  const [settings, zones] = await Promise.all([getSettings(), getZones()]);
  return <OrderView settings={settings} zones={zones} />;
}
