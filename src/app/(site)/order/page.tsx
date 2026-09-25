import type { Metadata } from "next";
import { getSettings, getZones } from "@/lib/data";
import { Checkout } from "@/components/checkout";

export const revalidate = 60;
export const metadata: Metadata = { title: "Order" };

export default async function OrderPage() {
  const [settings, zones] = await Promise.all([getSettings(), getZones()]);
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Checkout settings={settings} zones={zones} />
    </div>
  );
}
