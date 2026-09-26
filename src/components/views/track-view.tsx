import { Suspense } from "react";
import { TrackOrder } from "@/components/track-order";
import { PageHeader } from "@/components/page-header";
import type { Category, MenuItem, Settings } from "@/lib/types";

export function TrackView({ settings, items, categories }: { settings: Settings; items: MenuItem[]; categories: Category[] }) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      <PageHeader eyebrow="Order status" title="Track your order" />
      <Suspense fallback={<div className="p-10 text-center text-[13px] text-muted">Loading…</div>}>
        <TrackOrder settings={settings} items={items} categories={categories} />
      </Suspense>
    </div>
  );
}
