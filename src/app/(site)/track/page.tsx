import type { Metadata } from "next";
import { Suspense } from "react";
import { getSettings } from "@/lib/data";
import { TrackOrder } from "@/components/track-order";

export const revalidate = 60;
export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage() {
  const settings = await getSettings();
  return (
    <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
      <TrackOrder settings={settings} />
    </Suspense>
  );
}
