import type { Metadata } from "next";
import { Suspense } from "react";
import { getSettings } from "@/lib/data";
import { TrackOrder } from "@/components/track-order";
import { PageHeader } from "@/components/page-header";

export const revalidate = 60;
export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader eyebrow="Order status" title="Track your order">
        Enter your order reference and the WhatsApp number you ordered with.
      </PageHeader>
      <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
        <TrackOrder settings={settings} />
      </Suspense>
    </div>
  );
}
