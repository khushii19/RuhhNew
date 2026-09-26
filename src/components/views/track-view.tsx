import { Suspense } from "react";
import { TrackOrder } from "@/components/track-order";
import { PageHeader } from "@/components/page-header";
import type { Settings } from "@/lib/types";

export function TrackView({ settings }: { settings: Settings }) {
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
