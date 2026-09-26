import { Checkout } from "@/components/checkout";
import { PageHeader } from "@/components/page-header";
import type { DeliveryZone, Settings } from "@/lib/types";

export function OrderView({ settings, zones }: { settings: Settings; zones: DeliveryZone[] }) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      <PageHeader eyebrow="Your order" title="Basket" />
      <Checkout settings={settings} zones={zones} />
    </div>
  );
}
