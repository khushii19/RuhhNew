import { Suspense } from "react";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { PageHeader } from "@/components/page-header";
import { fmtDate } from "@/lib/format";
import type { Review, Settings } from "@/lib/types";

export function ReviewsView({ reviews, settings }: { reviews: Review[]; settings: Settings }) {
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <div className="mx-auto w-full max-w-[680px]">
      <PageHeader eyebrow="Kind words" title="Reviews" />
      {reviews.length > 0 && (
        <div className="mb-8 flex items-center gap-5 border-y border-line py-6">
          <div className="font-display text-[48px] leading-none text-ink">{avg.toFixed(1)}</div>
          <div>
            <Stars n={Math.round(avg)} />
            <div className="mt-1 text-[13px] text-muted">
              from {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}
      <div className="mb-10 divide-y divide-line">
        {reviews.length === 0 && <p className="text-[14px] text-muted">No reviews yet. Be the first.</p>}
        {reviews.map((r) => (
          <figure key={r.id} className="py-6 first:pt-0">
            <Stars n={r.rating} />
            <blockquote className="mt-3 font-display text-[19px] italic leading-[1.55] text-ink md:text-[21px]">&ldquo;{r.body}&rdquo;</blockquote>
            <figcaption className="mt-3 text-[13px] text-muted">
              {r.customer_name} · {fmtDate(r.created_at, { day: "numeric", month: "short", year: "numeric" })}
            </figcaption>
          </figure>
        ))}
      </div>
      <h2 className="sec-head">Leave a review</h2>
      <Suspense fallback={<div className="card p-4 text-[12px] text-muted">Loading…</div>}>
        <ReviewForm ownerName={settings.owner_name} />
      </Suspense>
    </div>
  );
}
